import { ATOM } from "../types";

/**
 * Helper function to get the value from an atom.
 *
 * @param  {ATOM<T>} atomValue ATOM to get value from
 * @returns {T} Value of the atom
 */
export const defaultGetter = <T>(atomValue: ATOM<T>): T => atomValue.proxy.value;

/**
 * Helper function to set a new value to a supplied atom.
 *
 * @param  {ATOM<T>} atomValue ATOM where the new value will be set
 * @param  {T} newValue new value to replace the ATOM current value
 * @returns {T} Value of the atom
 */
export const defaultSetter = <T>(atomValue: ATOM<T>, newValue: T): T => (atomValue.proxy.value = newValue);
