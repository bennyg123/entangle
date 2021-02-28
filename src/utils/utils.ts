import { ATOM } from "../types";

/**
 * Helper function to get the value from an atom.
 *
 * @param  {ATOM<T>} atomValue ATOM to get value from
 * @param  {ATOM<T>} subscribed For the molecules and effects, if we dont want the atom to be subscribed we can pass in false
 * @returns {T} Value of the atom
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const defaultGetter = <T>(atomValue: ATOM<T>, subscribed?: boolean): T => atomValue.proxy.value;

/**
 * Helper function to set a new value to a supplied atom.
 *
 * @param  {ATOM<T>} atomValue ATOM where the new value will be set
 * @param  {T} newValue new value to replace the ATOM current value
 * @returns {T} Value of the atom
 */
export const defaultSetter = <T>(atomValue: ATOM<T>, newValue: T): T => (atomValue.proxy.value = newValue);
