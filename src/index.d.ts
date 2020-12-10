export type NotNull<T> = T extends null ? (T extends undefined ? never : T) : T;

// Generic ATOM type
export type ATOM<T> = {
	proxy: { value: T };
	updater: (callback: (newValue: T) => void) => void;
	molecule: boolean;
	defaultValue: T;
};

export const defaultGetter: <T>(atomValue: ATOM<T>) => T;

export const isPromise: <T>(p: ATOM<T> | Promise<ATOM<T>>) => boolean;

export const makeInternalAtom: <T>(initialValue: T, molecule: boolean, defaultValue?: T) => ATOM<T>;

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
 * @param {NotNull<T>} initialValue - A non-null & non-undefined value to initialize the ATOM.
 * @returns {ATOM<T>} Returns an ATOM of Type T passed in.
 */
export const makeAtom: <T>(initialValue: NotNull<T>) => ATOM<NotNull<T>>;

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
 * @param {(get: ATOM<NotNull<T>>) => NotNull<T>} generateMolecule -
 * Function that has a get argument passed in that allows it retrieve data from other atoms and construct composed values.
 * @returns {ATOM<NotNull<T>>} Returns an ATOM of Type T passed in. Can be used the same way as the return value of makeAtom.
 */
export const makeMolecule: <T>(generateMolecule: (get: typeof defaultGetter) => NotNull<T>) => ATOM<NotNull<T>>;

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
 * @param {(get: ATOM<NotNull<T>>) => NotNull<T>} asyncGenerateMolecule -
 * Async Function that has a get argument passed in that allows it retrieve data from other atoms and construct composed values.
 * Values can be awaited for async functionality
 * @param {NotNull<T>} defaultValue -
 * DefaultValue for initial usage of the atom before it resolves for the first time
 * @returns {Promise<ATOM<NotNull<T>>>} Returns an Promise that resolves to an ATOM of Type T passed in.
 * Can be used the same way as the return value of makeAtom.
 */
export const makeAsyncMolecule: <T>(
	asyncGenerateMolecule: (get: typeof defaultGetter) => Promise<NotNull<T>>,
	defaultValue: NotNull<T>
) => Promise<ATOM<NotNull<T>>>;

/**
 *
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
 * @param {ATOM<NotNull<T>> | Promise<ATOM<NotNull<T>>} atomValue -
 * Atom generated from either (makeAtom | makeMolecule | makeAsyncMolecule), should be the same for all components who need to share state
 * @returns {[value: NotNull<T>, setValue: (newValue: NotNull<T>) => void]} [value, setValue] -
 * Returns an array of two elements (very similar to useState)
 *      - value : A variable containing the value of the shared state
 *      - setValue: A function allowing that state to be modified and those changes to propagate through the different components sharing the ATOM
 *                  It is important to note that while when a selector is passed in, there will be a setValue function, it does not do anything and will not update the state
 *
 */
export const useEntangle: <T>(
	atomValue: ATOM<NotNull<T>> | Promise<ATOM<NotNull<T>>>
) => [value: NotNull<T>, setValue: (newValue: NotNull<T>) => void];

export type EFFECT_FUNCTION = (get: typeof defaultGetter, set: typeof defaultSetter) => void | Promise<void>;
export const defaultSetter: <T>(atomValue: ATOM<NotNull<T>>, newValue: NotNull<T>) => void;
export const effectGetter: <T>(callbackFn: EFFECT_FUNCTION) => <T>(atomValue: ATOM<T>) => T;

/**
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
 * @param {(get: (atom: ATOM<NotNull<T>>) => T, set: (atom: ATOM<NotNull<T>>, value: NotNull<T>) => void) => void} -
 * Takes in a function similar to makeMolecule and makeAsyncMolecule that has a getter and setter passed in, function can be async as well
 * @returns void
 */
export const makeAtomEffect: <T>(effectFunction: (get: typeof defaultGetter, set: typeof defaultSetter) => void) => void;
