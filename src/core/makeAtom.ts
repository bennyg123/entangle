import { ATOM_CALLBACK, ATOM, ATOM_EFFECT_FN, ATOM_EFFECT_SNAPSHOT_FN } from "../types";
import { defaultGetter, defaultSetter } from "../utils/utils";

export const makeAtom = <T>(value: T, readOnly = false): ATOM<T> => {
	const callbacks: ATOM_CALLBACK<T>[] = [];

	return {
		proxy: new Proxy(
			{ value },
			{
				set: (target, property, value) => {
					target["value"] = value;
					callbacks.forEach((cb) => cb(value));
					return true;
				},
			}
		),
		setCallback: (cb) => callbacks.push(cb),
		readOnly,
	};
};

export const makeAtomEffect = (atomEffectFn: ATOM_EFFECT_FN): void => {
	atomEffectFn((atomValue) => {
		atomValue.setCallback(async () => await atomEffectFn(defaultGetter, defaultSetter));

		return atomValue.proxy.value;
	}, defaultSetter);
};

export const makeAtomEffectSnapshot = <T, K extends unknown[]>(atomSnapshotFn: ATOM_EFFECT_SNAPSHOT_FN<T, K>) => (
	...args: K
): void => atomSnapshotFn(defaultGetter, defaultSetter, ...args);
