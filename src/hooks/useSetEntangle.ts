import { ATOM } from "../types";

export const useSetEntangle = <T>(atomValue: ATOM<T>): ((newValue: T) => T) => {
	if (atomValue.readOnly) throw new Error("Read Only ATOMS cannot be used with useSetEntangle");
	return (newValue: T) => (atomValue.proxy.value = newValue);
};
