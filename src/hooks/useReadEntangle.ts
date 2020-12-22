import { ATOM } from "../types";
import { useEntangle } from "./useEntangle";

/**
 * Hook to get a read only value of an atom without the setter function
 *
 * @param  {ATOM<T>} atomValue atom to read the value from
 * @returns {T} value of the atom
 */
export const useReadEntangle = <T>(atomValue: ATOM<T>): T => useEntangle(atomValue)[0];
