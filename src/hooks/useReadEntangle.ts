import { ATOM } from "../types";
import { useEntangle, useMultiEntangle } from "./useEntangle";

/**
 * Hook to get a read only value of an atom without the setter function
 *
 * @param  {ATOM<T>} atomValue atom to read the value from
 * @returns {T} value of the atom
 */
export const useReadEntangle = <T>(atomValue: ATOM<T>): T => useEntangle(atomValue)[0];

/**
 * Helper hook to get the values of multiple atoms. Essentially this is just calling useEntangle on multiple atoms and returning the values
 * @param  {ATOM<unknown>[]} ...args
 * @returns {[unknown[]]} returns an array of values in the order of the atoms passed in
 */
export const useMultiReadEntangle = (...args: ATOM<unknown>[]): unknown[] => useMultiEntangle(...args)[0];
