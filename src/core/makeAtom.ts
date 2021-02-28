import { ATOM_CALLBACK, ATOM, ATOM_EFFECT_FN, ATOM_EFFECT_SNAPSHOT_FN } from "../types";
import { defaultGetter, defaultSetter } from "../utils/utils";

/**
 * Basic unit that contains a value to which molecules and hooks can subscribe to its changes.
 *
 * @param {T} value initialValue for the atom
 * @param {boolean} readOnly boolean to determine whether the atom is readOnly or not
 * @returns {ATOM<T>} returns an atom to be used in a hook or molecule function
 */
export const makeAtom = <T>(value: T, readOnly = false): ATOM<T> => {
	const callbacks: ATOM_CALLBACK<T>[] = [];

	return {
		proxy: new Proxy(
			{ value },
			{
				set: (target, property, value) => {
					target["value"] = value;
					callbacks.forEach((cb) => cb(value));
					return true;
				},
			}
		),
		setCallback: (cb) => {
			callbacks.push(cb);
			return () => callbacks.splice(callbacks.indexOf(cb), 1);
		},
		readOnly,
	};
};

/**
 * Side effect function that can subscribe to atoms and also update them, can be used outside of components.
 *
 * @param  {ATOM_EFFECT_FN} atomEffectFn function with a getter or setter to run updates to atoms outside of a hook
 * @returns {void}
 */
export const makeAtomEffect = (atomEffectFn: ATOM_EFFECT_FN, debounce?: number): void => {
	let debounceID = 0;
	atomEffectFn((atomValue, subscribed = true) => {
		if (subscribed) {
			atomValue.setCallback(
				debounce && debounce > 0
					? () => {
							window.clearTimeout(debounceID);
							debounceID = window.setTimeout(async () => {
								await atomEffectFn(defaultGetter, defaultSetter);
							}, debounce);
					  }
					: async () => {
							await atomEffectFn(defaultGetter, defaultSetter);
					  }
			);
		}

		return atomValue.proxy.value;
	}, defaultSetter);
};

/**
 * Similar to makeAtomEffect but this returns a function that can be called manually and is not subscribed to the atom values it reads.
 *
 * @param  {ATOM_EFFECT_FN} atomEffectFn function with a getter or setter to run updates to atoms outside of a hook
 * @returns {(...args: K) => void} function to manually call to run the side effect function passed
 */
export const makeAtomEffectSnapshot = <K extends unknown[]>(atomSnapshotFn: ATOM_EFFECT_SNAPSHOT_FN<K>) => (...args: K): void =>
	atomSnapshotFn(defaultGetter, defaultSetter, ...args);
