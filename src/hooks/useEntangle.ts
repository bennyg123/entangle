import { ATOM } from "../types";
import { useEffect, useRef, useState } from "react";

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
