import { ASYNC_ATOM_MOLECULE_FAMILY_FN, ATOM, ATOM_MOLECULE_FAMILY_FN, ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN } from "../types";
import { defaultGetter } from "../utils/utils";
import { makeAtom } from "./makeAtom";
import { makeAsyncMolecule, makeMolecule } from "./makeMolecule";

enum FT {
	A, // ATOM
	M, // MOLECULE
	AM, // ASYNC_MOLECULE
}

const makeFamily = <T, K extends unknown[]>(
	type: FT,
	initialValue?: T | ((...args: [string, ...K]) => T),
	moleculeFN?: ATOM_MOLECULE_FAMILY_FN<T, K> | ASYNC_ATOM_MOLECULE_FAMILY_FN<T, K>,
	initialValueFN?: ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN<T, K>
): ((...args: [string, ...K]) => ATOM<T | undefined>) => {
	const atomMap: { [keys: string]: ATOM<T | undefined> } = {};

	return (...args) => {
		const keyValue = args[0];
		if (!atomMap[keyValue]) {
			if (type === FT.A) {
				atomMap[keyValue] = makeAtom(
					typeof initialValue === "function"
						? (initialValue as (...args: [string, ...K]) => T)(...args)
						: (initialValue as T)
				);
			} else if (type === FT.M) {
				atomMap[keyValue] = makeMolecule((get) => (moleculeFN as ATOM_MOLECULE_FAMILY_FN<T, K>)(get, ...args)) as ATOM<T>;
			} else {
				const asyncInitialValue =
					initialValueFN === undefined
						? initialValue
						: (initialValueFN as ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN<T, K>)(defaultGetter, ...args);
				atomMap[keyValue] = makeAsyncMolecule(
					async (get) => await (moleculeFN as ATOM_MOLECULE_FAMILY_FN<T, K>)(get, ...args),
					asyncInitialValue
				) as ATOM<T>;
			}
		}
		return atomMap[keyValue];
	};
};

export const makeAtomFamily = <T, K extends unknown[]>(
	initialValue: T | ((...args: [string, ...K]) => T)
): ((...args: [string, ...K]) => ATOM<T>) => makeFamily(FT.A, initialValue) as (...args: [string, ...K]) => ATOM<T>;

export const makeMoleculeFamily = <T, K extends unknown[]>(
	moleculeFN: ATOM_MOLECULE_FAMILY_FN<T, K>
): ((...args: [string, ...K]) => ATOM<T | undefined>) => makeFamily(FT.M, undefined, moleculeFN, undefined);

export const makeAsyncMoleculeFamily = <T, K extends unknown[]>(
	moleculeFN: ASYNC_ATOM_MOLECULE_FAMILY_FN<T, K>,
	initialValue: T | ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN<T, K>
): ((...args: [string, ...K]) => ATOM<T | undefined>) =>
	makeFamily(
		FT.AM,
		typeof initialValue === "function" ? undefined : initialValue,
		moleculeFN,
		typeof initialValue === "function" ? (initialValue as ATOM_MOLECULE_FAMILY_INITIAL_VALUE_FN<T, K>) : undefined
	);
