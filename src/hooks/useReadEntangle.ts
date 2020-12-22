import { ATOM } from "../types";
import { useEntangle } from "./useEntangle";

export const useReadEntangle = <T>(atomValue: ATOM<T>): T => useEntangle(atomValue)[0];
