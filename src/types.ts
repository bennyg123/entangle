import { defaultGetter } from "./utils/utils";

export type ATOM_CALLBACK<T> = (newValue: T) => void;

export type ATOM_EFFECT_FN = (get: <T>(atomValue: ATOM<T>) => T, set: <T>(atomValue: ATOM<T>, newValue: T) => T) => void;

export type ATOM<T> = {
	proxy: { value: T };
	setCallback: (callbackFN: (newValue: T) => void) => void;
	readOnly: boolean;
};

export type ATOM_EFFECT_SNAPSHOT_FN<K extends unknown[]> = (
	get: <T>(atomValue: ATOM<T>) => T,
	set: <T>(atomValue: ATOM<T>, newValue: T) => T,
	...args: K
) => void;

export type ATOM_MOLECULE_FAMILY_FN<T, K extends unknown[]> = (
	get: <J>(atomValue: ATOM<J>) => J,
	...args: [string, ...K]
) => T extends Promise<unknown> ? never : T;

export type ASYNC_ATOM_MOLECULE_FAMILY_FN<T, K extends unknown[]> = (
	get: <J>(atomValue: ATOM<J>) => J,
	...args: [string, ...K]
) => Promise<T>;

export type ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN<T, K extends unknown[]> = (
	get: <J>(atomValue: ATOM<J>) => J,
	...args: [string, ...K]
) => T;
