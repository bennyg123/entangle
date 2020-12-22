import { ATOM } from "../types";

export const defaultGetter = <T>(atomValue: ATOM<T>): T => atomValue.proxy.value;

export const defaultSetter = <T>(atomValue: ATOM<T>, newValue: T): T => (atomValue.proxy.value = newValue);

export const isFunction = (fn: (...args: unknown[]) => unknown): boolean => fn.constructor.name.indexOf("Function") !== -1;
