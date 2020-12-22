import { defaultGetter, defaultSetter } from "./utils/utils";

export type ATOM_CALLBACK<T> = (newValue: T) => void;

export type ATOM_EFFECT_FN = (get: typeof defaultGetter, set: typeof defaultSetter) => void;

export type ATOM<T> = {
	proxy: { value: T };
	setCallback: (callbackFN: (newValue: T) => void) => void;
	readOnly: boolean;
};

export type ATOM_EFFECT_SNAPSHOT_FN<T, K extends unknown[]> = (
	get: typeof defaultGetter,
	set: typeof defaultSetter,
	...args: K
) => void;

export type ATOM_MOLECULE_FAMILY_FN<T, K> = (
	get: typeof defaultGetter,
	...args: [string, ...K]
) => T extends Promise<unknown> ? never : T;

export type ASYNC_ATOM_MOLECULE_FAMILY_FN<T, K> = (get: typeof defaultGetter, ...args: [string, ...K]) => Promise<T>;

export type ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN<T, K> = (get: typeof defaultGetter, ...args: [string, ...K]) => T;
