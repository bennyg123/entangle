import { ATOM } from "../types";
import { useEffect, useRef, useState } from "react";

/**
 * Hook to subscribe a component to an atom and its changes
 *
 * @param  {ATOM<T>} atomValue atom to subscribe the component to
 * @returns {[T, (newValue: T) => T]} the value of the atom and a function to update the atom (Atoms only not molecules)
 */
export const useEntangle = <T>(atomValue: ATOM<T>): [value: T, setValue: (newValue: T) => T] => {
	const atomValueRef = useRef(atomValue);
	const [entangleState, setEntangleState] = useState<T>(atomValueRef.current.proxy.value);

	useEffect(() => {
		atomValueRef.current.setCallback(setEntangleState);
	}, []);

	return [
		entangleState,
		(newValue: T) => {
			if (atomValueRef.current.readOnly) throw new Error("Read Only ATOMS cannot be set");
			return (atomValueRef.current.proxy.value = newValue);
		},
	];
};
