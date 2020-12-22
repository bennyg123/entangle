import { ATOM } from "../types";

export const useSetEntangle = <T>(atomValue: ATOM<T>): ((newValue: T) => T) => (newValue: T) => {
	if (atomValue.readOnly) throw new Error("Read Only ATOMS cannot be used with useSetEntangle");
	return (atomValue.proxy.value = newValue);
};
