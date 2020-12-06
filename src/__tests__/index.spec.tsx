import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { renderHook, act as act2 } from "@testing-library/react-hooks";
import { makeAsyncMolecule, makeAtom, makeMolecule, useEntangle } from "../index";

jest.useFakeTimers();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Entangle", () => {
	test("makeAtom returns the right value", () => {
		const zakuAtomValue = makeAtom("ZAKU");

		expect(zakuAtomValue).toStrictEqual({
			proxy: { value: "ZAKU" },
			updater: expect.anything(),
			molecule: false,
		});

		const integerAtomValue = makeAtom(5);

		expect(integerAtomValue).toStrictEqual({
			proxy: { value: 5 },
			updater: expect.any(Function),
			molecule: false,
		});

		const piAtomValue = makeAtom(3.14);

		expect(piAtomValue).toStrictEqual({
			proxy: { value: 3.14 },
			updater: expect.any(Function),
			molecule: false,
		});

		const booleanAtomValue = makeAtom(false);

		expect(booleanAtomValue).toStrictEqual({
			proxy: { value: false },
			updater: expect.any(Function),
			molecule: false,
		});

		const profileAtomValue = makeAtom({
			name: "Char Aznable",
			alliance: "ZEON",
		});

		expect(profileAtomValue).toStrictEqual({
			proxy: {
				value: {
					name: "Char Aznable",
					alliance: "ZEON",
				},
			},
			updater: expect.any(Function),
			molecule: false,
		});

		const listOfMSAtomValue = makeAtom(["ZAKU", "ZEON", "Big Zam"]);

		expect(listOfMSAtomValue).toStrictEqual({
			proxy: { value: ["ZAKU", "ZEON", "Big Zam"] },
			updater: expect.any(Function),
			molecule: false,
		});
	});

	test("makeAtom throws error when passed in undefined and null", () => {
		expect(() => makeAtom(null as unknown)).toThrow("Initial value for atom cannot be null or undefined");
		expect(() => makeAtom(undefined as unknown)).toThrow("Initial value for atom cannot be null or undefined");
	});

	test("makeAtom's updater is called when the value is updated", () => {
		const zakuAtomValue = makeAtom("ZAKU");
		const mockHandler = jest.fn();

		expect(zakuAtomValue).toStrictEqual({
			proxy: { value: "ZAKU" },
			updater: expect.anything(),
			molecule: false,
		});

		zakuAtomValue.updater(mockHandler);
		zakuAtomValue.proxy.value = "SAZABI";

		expect(mockHandler).toHaveBeenCalledWith("SAZABI");
		expect(zakuAtomValue.proxy.value).toEqual("SAZABI");
	});

	test("makeMolecule returns the right value", () => {
		const zakuAtomValue = makeAtom("ZAKU");

		const charProfileAtomValue = makeMolecule((get) => {
			return {
				pilot: "Char Azanable",
				ms: get(zakuAtomValue),
			};
		});

		expect(charProfileAtomValue).toStrictEqual({
			proxy: {
				value: {
					pilot: "Char Azanable",
					ms: "ZAKU",
				},
			},
			updater: expect.anything(),
			molecule: true,
		});
	});

	test("makeMolecule updates when dependent atom is updated", () => {
		const zakuAtomValue = makeAtom("ZAKU");

		const mockHandler = jest.fn();

		const charProfileAtomValue = makeMolecule((get) => {
			return {
				pilot: "Char Azanable",
				ms: get(zakuAtomValue),
			};
		});

		expect(charProfileAtomValue.proxy.value).toEqual({
			pilot: "Char Azanable",
			ms: "ZAKU",
		});

		charProfileAtomValue.updater(mockHandler);
		zakuAtomValue.proxy.value = "SAZABI";

		expect(mockHandler).toHaveBeenCalledWith({
			pilot: "Char Azanable",
			ms: "SAZABI",
		});

		expect(charProfileAtomValue.proxy.value).toStrictEqual({
			pilot: "Char Azanable",
			ms: "SAZABI",
		});
	});

	test("makeAsyncMolecule returns the right value", async () => {
		const sazabiAtomValue = makeAtom("SAZABI");

		const asyncCharProfileAtomValue = makeAsyncMolecule(
			async (get) => ({
				pilot: "Char Azanable",
				ms: get(sazabiAtomValue),
			}),
			{
				pilot: "Char Azanable",
				ms: "ZAKU",
			}
		);

		expect(asyncCharProfileAtomValue).toStrictEqual({
			atom: expect.anything(),
			molecule: true,
			defaultValue: {
				pilot: "Char Azanable",
				ms: "ZAKU",
			},
		});

		const awaitedAsyncCharProfileAtomValue = await asyncCharProfileAtomValue.atom();

		expect(awaitedAsyncCharProfileAtomValue).toStrictEqual({
			proxy: {
				value: {
					pilot: "Char Azanable",
					ms: "SAZABI",
				},
			},
			updater: expect.anything(),
			molecule: true,
		});
	});

	test("useEntangle behaves correctly with makeAtom", () => {
		const atomValue = makeAtom("ZAKU");
		const { result } = renderHook(() => useEntangle(atomValue));

		expect(result.current[0]).toEqual("ZAKU");

		act2(() => {
			result.current[1]("SAZABI");
		});

		expect(result.current[0]).toEqual("SAZABI");
	});

	test("useEntangle behaves correctly with makeMolecule", () => {
		const mobileSuitAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char Azanable");

		const profileMolecule = makeMolecule((get) => ({
			ms: get(mobileSuitAtom),
			pilot: get(pilotAtom),
		}));

		const { result: msResult } = renderHook(() => useEntangle(mobileSuitAtom));
		const { result: pilotResult } = renderHook(() => useEntangle(pilotAtom));

		const { result: profileResult } = renderHook(() => useEntangle(profileMolecule));

		expect(msResult.current[0]).toEqual("ZAKU");
		expect(pilotResult.current[0]).toEqual("Char Azanable");
		expect(profileResult.current[0]).toEqual({
			ms: "ZAKU",
			pilot: "Char Azanable",
		});

		act2(() => {
			msResult.current[1]("SAZABI");
		});

		expect(msResult.current[0]).toEqual("SAZABI");
		expect(pilotResult.current[0]).toEqual("Char Azanable");
		expect(profileResult.current[0]).toEqual({
			ms: "SAZABI",
			pilot: "Char Azanable",
		});

		act2(() => {
			msResult.current[1]("ν Gundam");
			pilotResult.current[1]("Amuro Ray");
		});

		expect(msResult.current[0]).toEqual("ν Gundam");
		expect(pilotResult.current[0]).toEqual("Amuro Ray");
		expect(profileResult.current[0]).toEqual({
			ms: "ν Gundam",
			pilot: "Amuro Ray",
		});
	});

	test("useMolecules updateState function does not update the molecule when invoked", () => {
		const mobileSuitAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char Azanable");

		const profileMolecule = makeMolecule((get) => ({
			ms: get(mobileSuitAtom),
			pilot: get(pilotAtom),
		}));

		const { result: profileResult } = renderHook(() => useEntangle(profileMolecule));

		expect(profileResult.current[0]).toEqual({
			ms: "ZAKU",
			pilot: "Char Azanable",
		});

		profileResult.current[1]({
			ms: "ν Gundam",
			pilot: "Amuro Ray",
		});

		expect(profileResult.current[0]).toEqual({
			ms: "ZAKU",
			pilot: "Char Azanable",
		});
	});

	test("useEntangle behaves correctly with useAsyncMolecule", async () => {
		const mobileSuitAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char Azanable");

		const profileMolecule = makeAsyncMolecule<{ ms?: string; pilot?: string }>(async (get) => {
			await sleep(1000);
			return {
				ms: get(mobileSuitAtom),
				pilot: get(pilotAtom),
			};
		}, {});

		const TEST = () => {
			const [, setMS] = useEntangle(mobileSuitAtom);
			const [, setPilot] = useEntangle(pilotAtom);
			const [profileValue] = useEntangle(profileMolecule);

			return (
				<div>
					<button
						className="UPDATE"
						onClick={() => {
							setMS("ν Gundam");
							setPilot("Amuro Ray");
						}}
					>
						Update Values
					</button>
					<h1 className="PROFILE">{JSON.stringify(profileValue)}</h1>
				</div>
			);
		};

		const { container } = render(<TEST />);

		expect(container.getElementsByClassName("PROFILE")[0].innerHTML).toContain(JSON.stringify({}));

		await act(async () => {
			jest.runAllTimers();
		});

		expect(container.getElementsByClassName("PROFILE")[0].innerHTML).toContain(
			JSON.stringify({
				ms: "ZAKU",
				pilot: "Char Azanable",
			})
		);

		await act(async () => {
			fireEvent(
				container.getElementsByClassName("UPDATE")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
			jest.runAllTimers();
		});

		expect(container.getElementsByClassName("PROFILE")[0].innerHTML).toContain(
			JSON.stringify({
				ms: "ν Gundam",
				pilot: "Amuro Ray",
			})
		);
	});
});
