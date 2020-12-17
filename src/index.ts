import { useEffect, useRef, useState } from "react";

export type NotPromise<T> = T extends Promise<T> ? never : T;

export type ATOM_CALLBACK<T> = (newValue: T) => void;

// Generic ATOM type
export type ATOM<T> = {
	proxy: { value: T };
	updater: (callback: ATOM_CALLBACK<T>) => void;
	molecule: boolean;
};

export type ASYNC_ATOM<T> = {
	atom: () => Promise<ATOM<T>>;
	molecule: boolean;
	defaultValue: T;
};

// Generic getter that returns the proxied value from an ATOM
const defaultGetter = <T>(atomValue: ATOM<T>) => atomValue.proxy.value;

/*
    Non exported function to create an internal atom, this is not exposed so the user
    does not see the molecule option as this should only be set by the exposed atom creation methods
*/
const makeInternalAtom = <T>(initialValue: T, molecule: boolean): ATOM<T> => {
	const callbacks: ATOM_CALLBACK<T>[] = [];

	/* Creates a proxy per atom with the initialValue and also adds a set trap to
    call all the setState hooks inside of useEntangle */
	const proxy = new Proxy(
		{ value: initialValue },
		{
			set: (target, property, value) => {
				target["value"] = value; // the target is always of type { value: T }
				callbacks.forEach((cb) => cb(value));
				return true;
			},
		}
	);

	return {
		proxy, // The proxy generated
		updater: (callback: ATOM_CALLBACK<T>) => callbacks.push(callback), // An updater function to add to the list of callback hooks to call during a set
		molecule, // A boolean of whether the atom passed in is a molecule or an atom
	};
};

/**
 * Creates a global atom value to be used in the useEntangle hook
 * @example
 * // returns ATOM<string> - value: "HELLO WORLD"
 * const atomValue = makeAtom("HELLO WORLD");
 * @example
 * // return ATOM<number> - value: 123
 * const atomValue = makeAtom(123);
 * @example
 * // return ATOM<{name: string}> - value: {name: "JOHN"}
 * const atomValue = makeAtom({name: "JOHN"});
 * @param {T} initialValue - A value to initialize the ATOM.
 * @returns {ATOM<T>} Returns an ATOM of Type T passed in.
 */
export const makeAtom = <T>(initialValue: T): ATOM<T> => makeInternalAtom(initialValue, false);

/**
 * Creates a molecule (an synchronous atom created using other atoms) to be used in the useEntangle hook
 * @example
 * // returns ATOM<string> - value: "HELLO WORLD"
 * const atomValue = makeAtom("HELLO");
 * const moleculeValue = makeMolecule((get) => get(atomValue) + " WORLD");
 * @example
 * // return ATOM<number> - value: 3
 * const atomValue1 = makeAtom(1);
 * const atomValue2 = makeAtom(2);
 * const moleculeValue = makeMolecule((get) => get(atomValue1) + get(atomValue2));
 * @example
 * // return ATOM<{firstName: string, lastName: string}> - value: {firstName: "JOHN", lastName: "DOE"}
 * const atomValue1 = makeAtom({firstName: "JOHN"});
 * const atomValue2 = makeAtom({lastName: "DOE"});
 * const atomValue = makeMolecule<{firstName: string, lastName: string}>((get) => {
 *      ...get(atomValue1),
 *      ...get(atomValue2),
 * });
 * @param {(get: ATOM<T>) => T} generateMolecule -
 * Function that has a get argument passed in that allows it retrieve data from other atoms and construct composed values.
 * @returns {ATOM<T>} Returns an ATOM of Type T passed in. Can be used the same way as the return value of makeAtom.
 */
export const makeMolecule = <T>(generateMolecule: (get: typeof defaultGetter) => T): ATOM<T> => {
	let proxy: { value?: T } = {};

	// Since every molecule is composed of different atoms we need to add callbacks to each of those atoms
	// So that when any of them update, the molecule is automatically updated as well.
	const atom = makeInternalAtom(
		generateMolecule((atomValue) => {
			// On the first pass of generateMolecule execution, the updater function is called with this callback function
			atomValue.updater(() => {
				// On the second and subsequent calls whenever one of the individual atoms get updated, the generateMolecule is called again to regenerate the molecule
				proxy.value = generateMolecule(defaultGetter);
			});

			return atomValue.proxy.value;
		}),
		true
	);

	proxy = atom.proxy;

	return atom;
};

/**
 * Creates an async version of a molecule (an asynchronous atom created using other atoms)
 * to be used in the useEntangle hook
 * @example
 * // returns ATOM<string> - value: "HELLO WORLD"
 * const atomValue = makeAtom("HELLO");
 * const moleculeValue = makeMolecule(async (get) => {
 *      const response = await fetch(API_URL); // returns { body: "WORLD"}
 *      const value = await response.json()
 *      return get(atomValue) + value.body;
 * });
 * @param {(get: ATOM<T>) => T} asyncGenerateMolecule -
 * Async Function that has a get argument passed in that allows it retrieve data from other atoms and construct composed values.
 * Values can be awaited for async functionality
 * @param {T} defaultValue -
 * DefaultValue for initial usage of the atom before it resolves for the first time
 * @returns {ASYNC_ATOM<ATOM<T>>} Returns an object with an atom: Promise that resolves to an ATOM of Type T passed in.
 * Can be used the same way as the return value of makeAtom, molecule: whether it is a molecule or not, and defaultValue: initial value of molecule.
 */
export const makeAsyncMolecule = <T>(
	asyncGenerateMolecule: (get: NotPromise<typeof defaultGetter>) => Promise<T>,
	defaultValue: T
): ASYNC_ATOM<T> => ({
	atom: async () => {
		let proxy: { value?: T } = {};

		const atom = makeInternalAtom(
			// The same as makeMolecule except we await values so the initial value for the atom returned is always a promise
			await asyncGenerateMolecule((atomValue) => {
				atomValue.updater(async () => {
					proxy.value = await asyncGenerateMolecule(defaultGetter);
				});

				return atomValue.proxy.value;
			}),
			true
		);

		proxy = atom.proxy;

		return atom;
	},
	molecule: true,
	defaultValue,
});

/**
 * Hook that allows a component to update and read values from an Atom and subscribe to those changes
 * @example
 * // Returns [state, setState]
 * const atomValue = makeAtom("HELLO");
 *
 * export default () => {
 *      const [state, setState] = useEntangle(atomValue);
 *
 *      return <>
 *                  <button onClick={() => setState(state.reverse())}>Reverse String</button>
 *                  <h1>{state}</h1>
 *             </>
 * }
 * @param {ATOM<T> | Promise<ATOM<T>} atomValue -
 * Atom generated from either (makeAtom | makeMolecule | makeAsyncMolecule), should be the same for all components who need to share state
 * @returns {[value: T, setValue: (newValue: T) => void]} [value, setValue] -
 * Returns an array of two elements (very similar to useState)
 *      - value : A variable containing the value of the shared state
 *      - setValue: A function allowing that state to be modified and those changes to propagate through the different components sharing the ATOM
 *                  It is important to note that while when a selector is passed in, there will be a setValue function, it does not do anything and will not update the state
 *
 */
export const useEntangle = <T>(atomValue: ATOM<T> | ASYNC_ATOM<T>): [value: T, setValue: (newValue: T) => void] => {
	const atomValueRef = useRef(atomValue);
	const { proxy } = atomValueRef.current as ATOM<T>;
	const { defaultValue } = atomValueRef.current as ASYNC_ATOM<T>;

	const [internalState, setInternalState] = useState<T>(proxy?.value || defaultValue);

	useEffect(() => {
		const atomValueIsPromise = !!(atomValue as ASYNC_ATOM<T>).atom;

		/*  We check to see if the atomValue is a promise/async function or not

            If so, we call in async iffe to resolve the promise/async function and then pass setInternalState so that on all future 
            updates it will automatically update the internal hook state since we will be calling the second call back function we passed in makeAsyncMolecule
        
            If not, we set the ref value to the proxy for future use in between renders
            and pass setInternalState to the callback so it updates the hook state when the proxy is updated
        */
		if (atomValueIsPromise) {
			(async () => {
				atomValueRef.current = await (atomValue as ASYNC_ATOM<T>).atom();
				atomValueRef.current.updater(setInternalState);
				setInternalState(atomValueRef.current.proxy.value);
			})();
		} else {
			(atomValueRef.current as ATOM<T>).proxy = (atomValue as ATOM<T>).proxy;
			(atomValueRef.current as ATOM<T>).updater(setInternalState);
		}

		atomValueRef.current.molecule = atomValueRef.current.molecule || atomValueIsPromise;
	}, []);

	// Returns the internalState, and a
	return [
		internalState as T,
		(newValue: T) => (atomValueRef.current.molecule ? void 0 : ((atomValueRef.current as ATOM<T>).proxy.value = newValue)),
	];
};

export type EFFECT_FUNCTION = (get: typeof defaultGetter, set: typeof defaultSetter) => void | Promise<void>;
const defaultSetter = <T>(atomValue: ATOM<T>, newValue: T) => (atomValue.proxy.value = newValue);
const effectGetter = (callbackFn: EFFECT_FUNCTION) => <T>(atomValue: ATOM<T>) => {
	atomValue.updater(() => {
		callbackFn(defaultGetter, defaultSetter);
	});
	return atomValue.proxy.value;
};

/**
 * Effect function for running side effects outside of a component. This can listen for atom changes and also update other atoms accordingly.
 *
 * @example
 *
 * const atom1 = makeAtom("Hello");
 * const atom2 = makeAtom("");
 *
 * makeAtomEffect((get, set) => {
 * 		const value1 = get(atom1);
 * 		set(atom2, value1);
 * });
 *
 * @example
 *
 * const atom1 = makeAtom("Hello");
 * const atom2 = makeAtom("");
 *
 * makeAtomEffect((get, set) => {
 * 		const value1 = get(atom1);
 * 		const response = await fetch(value1);
 * 		set(atom2, await response.json());
 * });
 *
 * @param {(get: (atom: ATOM<T>) => T, set: (atom: ATOM<T>, value: T) => void) => void} -
 * Takes in a function similar to makeMolecule and makeAsyncMolecule that has a getter and setter passed in, function can be async as well
 * @returns void
 */
export const makeAtomEffect = (effectFunction: EFFECT_FUNCTION): Promise<void> =>
	(async () => await effectFunction(effectGetter(effectFunction), defaultSetter))();

/**
 *	For readonly access to an atom, this hooks allows a component to only read an atom and subscribe to changes without giving it the ability to update it.
 *
 * @example
 *
 * const atom1 = makeAtom("Hello");
 *
 * const Component = () => {
 *		const value = useReadEntangle(atom1);
 *
 * 		return (
 * 			<div>{value}</div>
 * 		)
 * }
 *
 * @param {ATOM<T>} - ATOM to subscribe to
 * @returns {T} read only version of the atom
 */
export const useReadEntangle = <T>(atom: ATOM<T>): T => useEntangle(atom)[0];

/**
 * A hook for setting an atom value without subscribing to its changes.
 *
 * @example
 *
 * const atom1 = makeAtom("Hello");
 *
 * const Component = () => {
 *		const setValue = useSetEntangle(atom1);
 *
 * 		return (
 * 			<button onClick={() => setValue("World")}>Update Atom</button>
 * 		)
 * }
 *
 * @param {ATOM<T>} - ATOM to subscribe to
 * @returns {(newValue: T) => void} read only version of the atom
 */
export const useSetEntangle = <T>(atom: ATOM<T>) => (newValue: T): void => {
	atom.proxy.value = newValue;
};

/**
 * A helper function for generating a family of atoms that may be related but should have their own state and not update each other
 *
 * @example
 *
 * const atom1 = makeAtomFamily("Hello");
 *
 * const Component1 = () => {
 *		const setValue = useEntangle(atom1("A"));
 *
 * 		// Component1 will not update Component2
 * 		return (
 * 			<button onClick={() => setValue("World")}>Update Atom</button>
 * 		)
 * }
 *
 * const Component2 = () => {
 *		const setValue = useEntangle(atom1("B"));
 *
 * 		// Component1 will not update Component2
 * 		return (
 * 			<button onClick={() => setValue("World")}>Update Atom</button>
 * 		)
 * }
 *
 *
 * @param {T | (..args: unknown[]) => T} - initial value or initial value function for the atom's initial value
 * @returns {(args: unknown[]) => ATOM<T>} - function that takes in a parameter that acts as a key to distinguish the atom from each other
 */
export const makeAtomFamily = <K, T extends unknown[]>(initialValue: K | ((...args: T) => K)): ((...args: T) => ATOM<K>) => {
	const atomMap: { [keys: string]: ATOM<K> } = {};

	return (...args) => {
		const key = JSON.stringify(args);

		if (!atomMap[key]) {
			atomMap[key] = makeInternalAtom(
				typeof initialValue === "function" ? (initialValue as (...args: T) => K)(...args) : (initialValue as K),
				false
			) as ATOM<K>;
		}
		return atomMap[key] as ATOM<K>;
	};
};
