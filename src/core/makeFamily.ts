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

/**
 * Creates an generator function that can generate unique atoms given a key that is passed in. Same keys will result in the same atom being returned and not recreated.
 *
 * @param  {T | (key: string, ...args:K[]) => T} initialValue takes in either a value or function that generates a value
 * @returns {(key: string, ...args: K[])} return function whose arguments as passed to the function that generates initialValue (if a function was passed). First argument is a unique string to help differentiate atoms.
 */
export const makeAtomFamily = <T, K extends unknown[]>(
	initialValue: T | ((...args: [string, ...K]) => T)
): ((...args: [string, ...K]) => ATOM<T>) => makeFamily(FT.A, initialValue) as (...args: [string, ...K]) => ATOM<T>;

/**
 * Creates an generator function that can generate unique molecules given a key that is passed in. Same keys will result in the same molecule being returned and not recreated.
 *
 * @param  {(get, key, ...args: K[]) => T} moleculeFN molecule function that has a atom getter function that returns a composite value based off the atoms
 * @returns {(get, key, ...args: K[])} returns a function whose arguments are passed to moleculeFN. First argument is a unique string to help differentiate molecules.
 */
export const makeMoleculeFamily = <T, K extends unknown[]>(
	moleculeFN: ATOM_MOLECULE_FAMILY_FN<T, K>
): ((...args: [string, ...K]) => ATOM<T | undefined>) => makeFamily(FT.M, undefined, moleculeFN, undefined);

/**
 * Creates an generator function that can generate unique async molecules given a key that is passed in. Same keys will result in the same molecule being returned and not recreated.
 *
 * @param {(get, key, ...args: K[]) => Promise<T>} moleculeFN async molecule function that has a atom getter function that returns a composite value based off the atoms
 * @param {T | (get, key, ...args: K[]) => T} initialValue value or synchronous function to generate the initial value for the molecule before the main function is run
 * @returns {(get, key, ...args: K[])} returns a function whose arguments are passed to moleculeFN. First argument is a unique string to help differentiate molecules.
 */
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
