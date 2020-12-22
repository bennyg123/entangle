import { makeAtom } from "../makeAtom";
import { act } from "@testing-library/react";
import { makeAsyncMolecule, makeMolecule } from "../makeMolecule";

jest.useFakeTimers();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("makeMolecule", () => {
	test("makeMolecule returns an ATOM", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");

		const profileMolecule = makeMolecule((get) => ({
			ms: get(msAtom),
			pilot: get(pilotAtom),
		}));

		expect(profileMolecule).toStrictEqual({
			proxy: {
				value: {
					ms: "ZAKU",
					pilot: "Char",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});

	test("makeMolecule is subscribed to atom changes", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");

		const profileMolecule = makeMolecule((get) => ({
			ms: get(msAtom),
			pilot: get(pilotAtom),
		}));

		expect(profileMolecule.proxy.value).toStrictEqual({
			ms: "ZAKU",
			pilot: "Char",
		});

		msAtom.proxy.value = "SAZABI";

		expect(profileMolecule.proxy.value).toStrictEqual({
			ms: "SAZABI",
			pilot: "Char",
		});
	});
});

describe("makeAsyncMolecule", () => {
	test("makeAsyncMolecule returns an atom and updates asynchronously", async () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");

		const profileMolecule = makeAsyncMolecule(
			async (get) => {
				sleep(100);
				return {
					ms: get(msAtom),
					pilot: get(pilotAtom),
				};
			},
			{ ms: "", pilot: "" }
		);

		expect(profileMolecule).toStrictEqual({
			proxy: {
				value: {
					ms: "",
					pilot: "",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		await act(async () => {
			jest.runAllTimers();
		});

		expect(profileMolecule).toStrictEqual({
			proxy: {
				value: {
					ms: "ZAKU",
					pilot: "Char",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});

	test("makeAsyncMolecule is subscribed to changes", async () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");

		const profileMolecule = makeAsyncMolecule(
			async (get) => {
				sleep(100);
				return {
					ms: get(msAtom),
					pilot: get(pilotAtom),
				};
			},
			{ ms: "", pilot: "" }
		);

		await act(async () => {
			jest.runAllTimers();
		});

		expect(profileMolecule).toStrictEqual({
			proxy: {
				value: {
					ms: "ZAKU",
					pilot: "Char",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		msAtom.proxy.value = "SAZABI";

		expect(profileMolecule).toStrictEqual({
			proxy: {
				value: {
					ms: "ZAKU",
					pilot: "Char",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		await act(async () => {
			jest.runAllTimers();
		});

		expect(profileMolecule).toStrictEqual({
			proxy: {
				value: {
					ms: "SAZABI",
					pilot: "Char",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});
});
