import { ATOM } from "../types";
import { defaultGetter } from "../utils/utils";
import { makeAtom } from "./makeAtom";

export const makeMolecule = <T>(
	generateMolecule: (get: typeof defaultGetter) => T extends Promise<unknown> ? never : T
): ATOM<T> => {
	let proxy: { value?: T } = {};

	// Since every molecule is composed of different atoms we need to add callbacks to each of those atoms
	// So that when any of them update, the molecule is automatically updated as well.
	const atom = makeAtom(
		generateMolecule((atomValue) => {
			// On the first pass of generateMolecule execution, the updater function is called with this callback function
			atomValue.setCallback(() => {
				// On the second and subsequent calls whenever one of the individual atoms get updated, the generateMolecule is called again to regenerate the molecule
				proxy.value = generateMolecule(defaultGetter);
			});

			return atomValue.proxy.value;
		}),
		true
	);

	proxy = atom.proxy;

	return atom;
};

export const makeAsyncMolecule = <T>(
	asyncGenerateMolecule: (get: typeof defaultGetter) => Promise<T>,
	defaultValue: T
): ATOM<T> => {
	const atom = makeAtom(defaultValue, true);

	(async () => {
		atom.proxy.value = await asyncGenerateMolecule((atomValue) => {
			// On the first pass of generateMolecule execution, the updater function is called with this callback function
			atomValue.setCallback(async () => {
				// On the second and subsequent calls whenever one of the individual atoms get updated, the generateMolecule is called again to regenerate the molecule
				atom.proxy.value = await asyncGenerateMolecule(defaultGetter);
			});

			return atomValue.proxy.value;
		});
	})();

	return atom;
};
