import { ATOM } from "../types";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to subscribe a component to an atom and its changes
 *
 * @param  {ATOM<T>} atomValue atom to subscribe the component to
 * @returns {[T, (newValue: T) => T]} the value of the atom and a function to update the atom (Atoms only not molecules)
 */
export const useEntangle = <T>(atomValue: ATOM<T>): [value: T, setValue: (newValue: T) => T] => {
	const [entangleState, setEntangleState] = useState<T>(atomValue.proxy.value);
	const setValue = useCallback(
		(newValue: T) => {
			if (atomValue.readOnly) throw new Error("Read Only ATOMS cannot be set");
			return (atomValue.proxy.value = newValue);
		},
		[atomValue]
	);

	useEffect(() => {
		const cleanup = atomValue.setCallback(setEntangleState);

		return () => cleanup();
	}, []);

	return [entangleState, setValue];
};

/**
 * Helper hook to listen to multiple atoms. Essentially this is just calling useEntangle on multiple atoms.
 * @param  {ATOM<unknown>[]} ...args
 * @returns {[unknown[], (newValue: unknown => unknown)[]]} returns an array of values and setters in the order of the atoms passed in
 */
// TODO: FIX TYPING
export const useMultiEntangle = (...args: ATOM<unknown>[]): [unknown[], ((newValue: unknown) => unknown)[]] =>
	args.reduce(
		(currentAtomArr: [unknown[], ((newValue: unknown) => unknown)[]], atom: ATOM<unknown>) => {
			const [atomValue, setAtomValue] = useEntangle(atom);
			currentAtomArr[0].push(atomValue);
			currentAtomArr[1].push(setAtomValue);
			return currentAtomArr;
		},
		[[], []]
	);
