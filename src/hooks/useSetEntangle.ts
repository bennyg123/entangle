import { ATOM } from "../types";

/**
 * Helper function to set an atom without subscribing to its changes
 *
 * @param  {ATOM<T>} atomValue atom to set a new value to
 * @returns {(newValue: T) => T} setter function to update the atom
 */
export const useSetEntangle = <T>(atomValue: ATOM<T>): ((newValue: T) => T) => {
	if (atomValue.readOnly) throw new Error("Read Only ATOMS cannot be used with useSetEntangle");
	return (newValue: T) => (atomValue.proxy.value = newValue);
};
