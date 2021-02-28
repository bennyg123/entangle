import { ATOM } from "../types";
import { defaultGetter } from "../utils/utils";
import { makeAtom } from "./makeAtom";
/**
 * A composite function that returns a value from other atoms, it also subscribes to the atom values it reads from
 *
 * @param  {(get: typeof defaultGetter) => T} generateMolecule a non-async function that has a getter function passed in and returns a value
 * @returns ATOM
 */
export const makeMolecule = <T>(
	generateMolecule: (get: typeof defaultGetter) => T extends Promise<unknown> ? never : T
): ATOM<T> => {
	let proxy: { value?: T } = {};

	// Since every molecule is composed of different atoms we need to add callbacks to each of those atoms
	// So that when any of them update, the molecule is automatically updated as well.
	const atom = makeAtom(
		generateMolecule((atomValue, subscribed = true) => {
			// On the first pass of generateMolecule execution, the updater function is called with this callback function

			// If we dont want the molecule to subscribe to a certain atoms changes we can pass in false to subscribed
			if (subscribed) {
				atomValue.setCallback(() => {
					// On the second and subsequent calls whenever one of the individual atoms get updated, the generateMolecule is called again to regenerate the molecule
					proxy.value = generateMolecule(defaultGetter);
				});
			}

			return atomValue.proxy.value;
		}),
		true
	);

	proxy = atom.proxy;

	return atom;
};
/**
 * Am async composite function that returns a value from other atoms, it also subscribes to the atom values it reads from.
 *
 * @param  {(get: typeof defaultGetter)=> Promise<T>} asyncGenerateMolecule async function that has a getter passed in to produce a composite value from other atoms
 * @param  {T} defaultValue defaultValue for the atom before it gets updated
 * @returns ATOM
 */
export const makeAsyncMolecule = <T>(
	asyncGenerateMolecule: (get: typeof defaultGetter) => Promise<T>,
	defaultValue: T
): ATOM<T> => {
	const atom = makeAtom(defaultValue, true);

	(async () => {
		atom.proxy.value = await asyncGenerateMolecule((atomValue, subscribed = true) => {
			// On the first pass of generateMolecule execution, the updater function is called with this callback function

			// if the user opts to not subscribe to certain atoms, then can pass false to subscribe
			if (subscribed) {
				atomValue.setCallback(async () => {
					// On the second and subsequent calls whenever one of the individual atoms get updated, the generateMolecule is called again to regenerate the molecule
					atom.proxy.value = await asyncGenerateMolecule(defaultGetter);
				});
			}

			return atomValue.proxy.value;
		});
	})();

	return atom;
};
