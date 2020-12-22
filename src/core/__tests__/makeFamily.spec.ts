import { act } from "@testing-library/react";
import { makeAtom } from "../makeAtom";
import { makeAsyncMoleculeFamily, makeAtomFamily, makeMoleculeFamily } from "../makeFamily";
jest.useFakeTimers();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GUNDAM_ATOM = (ms: string) => ({
	proxy: { value: `GUNDAM: ${ms}` },
	setCallback: expect.any(Function),
	readOnly: false,
});

describe("makeAtomFamily", () => {
	test("makeAtomFamily returns an ATOM for each different callback fn with primitive", () => {
		const atomFamily = makeAtomFamily("GUNDAM: ");

		["RX 78-2", "ZETA", "Nu"].map((ms) => expect(atomFamily(ms)).toStrictEqual(GUNDAM_ATOM("")));
	});

	test("makeAtomFamily returns an ATOM for each different callback fn with fn", () => {
		const atomFamily = makeAtomFamily((ms: string) => "GUNDAM: " + ms);

		["RX 78-2", "ZETA", "Nu"].map((ms) => expect(atomFamily(ms)).toStrictEqual(GUNDAM_ATOM(ms)));
	});

	test("makeAtomFamily is only called once for each unique atom", () => {
		const atomFamilyCaller = jest.fn();

		const atomFamily = makeAtomFamily((ms: string) => {
			atomFamilyCaller(ms);
			return `GUNDAM: ${ms}`;
		});

		["RX 78-2", "ZETA", "Nu"].map((ms) => expect(atomFamily(ms)).toStrictEqual(GUNDAM_ATOM(ms)));

		["RX 78-2", "ZETA", "Nu"].map((ms) => expect(atomFamily(ms)).toStrictEqual(GUNDAM_ATOM(ms)));

		expect(atomFamilyCaller).toHaveBeenCalledTimes(3);

		atomFamily("Unicorn");

		expect(atomFamilyCaller).toHaveBeenCalledTimes(4);
	});

	test("makeMoleculeFamily returns an ATOM for each different callback fn", () => {
		const allianceAtom = makeAtom("ESFS");
		const moleculeFamily = makeMoleculeFamily((get, pilot) => ({
			alliance: get(allianceAtom),
			pilot,
		}));

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Amuro",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Bright Noa",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});

	test("makeMoleculeFamily is subscribed to atom changes", () => {
		const allianceAtom = makeAtom("ESFS");
		const moleculeFamily = makeMoleculeFamily((get, pilot) => ({
			alliance: get(allianceAtom),
			pilot,
		}));

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Amuro",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Bright Noa",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		allianceAtom.proxy.value = "Londo Bell";

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "Londo Bell",
					pilot: "Amuro",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "Londo Bell",
					pilot: "Bright Noa",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});

	test("makeAsyncMoleculeFamily returns an ATOM for each different callback fn", async () => {
		const allianceAtom = makeAtom("ESFS");
		const moleculeFamily = makeAsyncMoleculeFamily(
			async (get, pilot: string) => {
				sleep(100);

				return {
					alliance: get(allianceAtom),
					pilot,
				};
			},
			{
				alliance: "",
				pilot: "",
			}
		);

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "",
					pilot: "",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "",
					pilot: "",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		await act(async () => {
			jest.runAllTimers();
		});

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Amuro",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Bright Noa",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});

	test("makeAsyncMoleculeFamily returns the correct initial value for a initial function", async () => {
		const allianceAtom = makeAtom("ESFS");
		const moleculeFamily = makeAsyncMoleculeFamily(
			async (get, pilot: string) => {
				sleep(100);

				return {
					alliance: get(allianceAtom),
					pilot,
				};
			},
			(get, pilot: string) => ({
				alliance: "",
				pilot,
			})
		);

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "",
					pilot: "Amuro",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "",
					pilot: "Bright Noa",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		await act(async () => {
			jest.runAllTimers();
		});

		expect(moleculeFamily("Amuro")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Amuro",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});

		expect(moleculeFamily("Bright Noa")).toStrictEqual({
			proxy: {
				value: {
					alliance: "ESFS",
					pilot: "Bright Noa",
				},
			},
			setCallback: expect.any(Function),
			readOnly: true,
		});
	});
});
