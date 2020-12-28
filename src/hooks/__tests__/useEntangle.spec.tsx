import React, { useEffect } from "react";
import { render, act as renderAct, fireEvent } from "@testing-library/react";
import { renderHook, act as renderHookAct } from "@testing-library/react-hooks";
import { makeAtom } from "../../core/makeAtom";
import { makeAsyncMolecule, makeMolecule } from "../../core/makeMolecule";
import { makeAsyncMoleculeFamily, makeAtomFamily, makeMoleculeFamily } from "../../core/makeFamily";
import { useEntangle, useMultiEntangle } from "../useEntangle";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

jest.useFakeTimers();

describe("useEntangle", () => {
	test("useEntangle works with makeAtom", () => {
		const msAtom = makeAtom("ZAKU");

		const { result } = renderHook(() => useEntangle(msAtom));

		expect(result.current[0]).toEqual("ZAKU");

		renderHookAct(() => {
			result.current[1]("SAZABI");
		});

		expect(result.current[0]).toEqual("SAZABI");
	});

	test("useEntangle works with makeMolecule and cannot be updated", () => {
		const msAtom = makeAtom("ZAKU");
		const profileMolecule = makeMolecule((get) => ({
			ms: get(msAtom),
			pilot: "Char",
		}));

		const { result: atomHook } = renderHook(() => useEntangle(msAtom));
		const { result: profileHook } = renderHook(() => useEntangle(profileMolecule));

		expect(profileHook.current[0]).toEqual({
			ms: "ZAKU",
			pilot: "Char",
		});

		renderHookAct(() => {
			expect(() => profileHook.current[1]({ ms: "SAZABI", pilot: "Char" })).toThrow(
				new Error("Read Only ATOMS cannot be set")
			);
		});

		expect(profileHook.current[0]).toEqual({
			ms: "ZAKU",
			pilot: "Char",
		});

		renderHookAct(() => {
			atomHook.current[1]("SAZABI");
		});

		expect(atomHook.current[0]).toEqual("SAZABI");
		expect(profileHook.current[0]).toEqual({
			ms: "SAZABI",
			pilot: "Char",
		});
	});

	test("useEntangle works with makeAsyncMolecule and cannot be updated", async () => {
		const msAtom = makeAtom("ZAKU");
		const profileMolecule = makeAsyncMolecule(
			async (get) => {
				await sleep(1000);
				return {
					ms: get(msAtom),
					pilot: "Char",
				};
			},
			{
				pilot: "",
				ms: "",
			}
		);

		const { result: atomHook } = renderHook(() => useEntangle(msAtom));
		const { result: profileHook } = renderHook(() => useEntangle(profileMolecule));

		expect(profileHook.current[0]).toEqual({
			ms: "",
			pilot: "",
		});

		await renderHookAct(async () => {
			expect(() => profileHook.current[1]({ ms: "SAZABI", pilot: "Char" })).toThrow(
				new Error("Read Only ATOMS cannot be set")
			);
			jest.runAllTimers();
		});

		expect(profileHook.current[0]).toEqual({
			ms: "ZAKU",
			pilot: "Char",
		});

		await renderHookAct(async () => {
			atomHook.current[1]("SAZABI");
			jest.runAllTimers();
		});

		expect(atomHook.current[0]).toEqual("SAZABI");
		expect(profileHook.current[0]).toEqual({
			ms: "SAZABI",
			pilot: "Char",
		});
	});

	test("useEntangle works with makeAtomFamily", () => {
		const renderCallback = jest.fn();
		const msAtomFamily = makeAtomFamily((ms) => {
			renderCallback();
			return `MOBILE SUIT: ${ms}`;
		});

		const { result: atomHook1 } = renderHook(() => useEntangle(msAtomFamily("ZAKU")));
		const { result: atomHook2 } = renderHook(() => useEntangle(msAtomFamily("RX 78-2")));
		const { result: atomHook3 } = renderHook(() => useEntangle(msAtomFamily("ZEONG")));

		expect(atomHook1.current[0]).toEqual("MOBILE SUIT: ZAKU");
		expect(atomHook2.current[0]).toEqual("MOBILE SUIT: RX 78-2");
		expect(atomHook3.current[0]).toEqual("MOBILE SUIT: ZEONG");

		expect(renderCallback).toHaveBeenCalledTimes(3);

		const { result: atomHook4 } = renderHook(() => useEntangle(msAtomFamily("ZAKU"))); // cached atom value is returned
		expect(atomHook4.current[0]).toEqual("MOBILE SUIT: ZAKU");

		expect(renderCallback).toHaveBeenCalledTimes(3);

		renderHookAct(() => {
			atomHook4.current[1]("SAZABI");
		});

		expect(atomHook4.current[0]).toEqual("SAZABI");
		expect(atomHook4.current[0]).toEqual("SAZABI");
	});

	test("useEntangle works with makeMoleculeFamily", () => {
		const renderCallback = jest.fn();
		const msAtom = makeAtom("MOBILE SUIT:");
		const profileMoleculeFamily = makeMoleculeFamily((get, ms, pilot) => {
			renderCallback();
			return {
				ms: `${get(msAtom)} ${ms}`,
				pilot,
			};
		});

		const { result: atomHook1 } = renderHook(() => useEntangle(profileMoleculeFamily("ZAKU", "Char")));
		const { result: atomHook2 } = renderHook(() => useEntangle(profileMoleculeFamily("RX 78-2", "Amuro")));
		const { result: atomHook3 } = renderHook(() => useEntangle(profileMoleculeFamily("ZEONG", "Char")));

		expect(atomHook1.current[0]).toEqual({
			ms: `MOBILE SUIT: ZAKU`,
			pilot: `Char`,
		});

		expect(atomHook2.current[0]).toEqual({
			ms: `MOBILE SUIT: RX 78-2`,
			pilot: `Amuro`,
		});

		expect(atomHook3.current[0]).toEqual({
			ms: `MOBILE SUIT: ZEONG`,
			pilot: `Char`,
		});
	});
	test("useEntangle works with makeAsyncMoleculeFamily", async () => {
		const renderCallback = jest.fn();
		const msAtom = makeAtom("MOBILE SUIT:");
		const profileMoleculeFamily = makeAsyncMoleculeFamily(
			async (get, ms: string, pilot: string) => {
				sleep(100);
				renderCallback();
				return {
					ms: `${get(msAtom)} ${ms}`,
					pilot,
				};
			},
			{
				ms: "",
				pilot: "",
			}
		);

		const { result: atomHook1 } = renderHook(() => useEntangle(profileMoleculeFamily("ZAKU", "Char")));
		const { result: atomHook2 } = renderHook(() => useEntangle(profileMoleculeFamily("RX 78-2", "Amuro")));
		const { result: atomHook3 } = renderHook(() => useEntangle(profileMoleculeFamily("ZEONG", "Char")));

		expect(atomHook1.current[0]).toEqual({
			ms: "",
			pilot: "",
		});

		expect(atomHook2.current[0]).toEqual({
			ms: "",
			pilot: "",
		});

		expect(atomHook3.current[0]).toEqual({
			ms: "",
			pilot: "",
		});

		await renderHookAct(async () => {
			jest.runAllTimers();
		});

		expect(atomHook1.current[0]).toEqual({
			ms: `MOBILE SUIT: ZAKU`,
			pilot: `Char`,
		});

		expect(atomHook2.current[0]).toEqual({
			ms: `MOBILE SUIT: RX 78-2`,
			pilot: `Amuro`,
		});

		expect(atomHook3.current[0]).toEqual({
			ms: `MOBILE SUIT: ZEONG`,
			pilot: `Char`,
		});
	});

	test("useEntangle only updates components subscribed to it and not parent components", async () => {
		const msRender = jest.fn();
		const pilotRender = jest.fn();
		const profileRender = jest.fn();
		const parentRender = jest.fn();

		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");

		const profileMolecule = makeAsyncMolecule(
			async (get) => {
				await sleep(100);
				return {
					ms: get(msAtom),
					pilot: get(pilotAtom),
				};
			},
			{
				ms: "",
				pilot: "",
			}
		);

		const MSComponent = () => {
			const [ms, setMS] = useEntangle(msAtom);

			useEffect(() => {
				msRender();
			});

			return (
				<>
					<h1 className="MS_VALUE">{ms}</h1>
					<button className="UPDATE_MS" onClick={() => setMS("SAZABI")}>
						Update MS
					</button>
				</>
			);
		};

		const PilotComponent = () => {
			const [pilot, setPilot] = useEntangle(pilotAtom);

			useEffect(() => {
				pilotRender();
			});

			return (
				<>
					<h1 className="PILOT_VALUE">{pilot}</h1>
					<button className="UPDATE_PILOT" onClick={() => setPilot("RED COMET")}>
						Update MS
					</button>
				</>
			);
		};

		const ProfileComponent = () => {
			const [profile] = useEntangle(profileMolecule);

			useEffect(() => {
				profileRender();
			});

			return <div className="PROFILE">{JSON.stringify(profile)}</div>;
		};

		const ParentComponent = () => {
			useEffect(() => {
				parentRender();
			});

			return (
				<>
					<MSComponent />
					<PilotComponent />
					<ProfileComponent />
				</>
			);
		};

		const { container } = render(<ParentComponent />);

		[
			{
				className: "MS_VALUE",
				value: "ZAKU",
			},
			{
				className: "PILOT_VALUE",
				value: "Char",
			},
			{
				className: "PROFILE",
				value: JSON.stringify({
					ms: "",
					pilot: "",
				}),
			},
		].map(({ className, value }) => {
			expect(container.getElementsByClassName(className)[0].innerHTML).toEqual(value);
		});

		expect(msRender).toHaveBeenCalledTimes(1);
		expect(pilotRender).toHaveBeenCalledTimes(1);
		expect(profileRender).toHaveBeenCalledTimes(1);
		expect(parentRender).toHaveBeenCalledTimes(1);

		await renderAct(async () => {
			jest.runAllTimers();
		});

		expect(msRender).toHaveBeenCalledTimes(1);
		expect(pilotRender).toHaveBeenCalledTimes(1);
		expect(profileRender).toHaveBeenCalledTimes(2);
		expect(parentRender).toHaveBeenCalledTimes(1);

		await renderAct(async () => {
			fireEvent.click(container.getElementsByClassName("UPDATE_MS")[0]);
		});

		expect(container.getElementsByClassName("PROFILE")[0].innerHTML).toEqual(
			JSON.stringify({
				ms: "ZAKU",
				pilot: "Char",
			})
		);

		expect(msRender).toHaveBeenCalledTimes(2);
		expect(pilotRender).toHaveBeenCalledTimes(1);
		expect(profileRender).toHaveBeenCalledTimes(2);
		expect(parentRender).toHaveBeenCalledTimes(1);

		expect(container.getElementsByClassName("MS_VALUE")[0].innerHTML).toEqual("SAZABI");

		await renderAct(async () => {
			jest.runAllTimers();
		});

		expect(container.getElementsByClassName("PROFILE")[0].innerHTML).toEqual(
			JSON.stringify({
				ms: "SAZABI",
				pilot: "Char",
			})
		);

		await renderAct(async () => {
			fireEvent.click(container.getElementsByClassName("UPDATE_PILOT")[0]);
			jest.runAllTimers();
		});

		expect(container.getElementsByClassName("PROFILE")[0].innerHTML).toEqual(
			JSON.stringify({
				ms: "SAZABI",
				pilot: "RED COMET",
			})
		);
	});
});

describe("useMultiEntangle", () => {
	test("useMultiEntangle is able to read multiple atoms and set multiple atoms and stay subscribed", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");
		const allianceMolecule = makeMolecule((get) => (get(msAtom) === "ZAKU" ? "ZEON" : "ESFS"));

		const { result } = renderHook(() => useMultiEntangle(msAtom, pilotAtom, allianceMolecule));

		expect(result.current[0]).toStrictEqual(["ZAKU", "Char", "ZEON"]);
		expect(result.current[1]).toStrictEqual([expect.any(Function), expect.any(Function), expect.any(Function)]);

		renderHookAct(() => {
			result.current[1][0]("Hyakku Shiki");
		});

		expect(result.current[0]).toStrictEqual(["Hyakku Shiki", "Char", "ESFS"]);

		renderHookAct(() => {
			result.current[1][1]("Quattro Bajeena");
		});

		expect(result.current[0]).toStrictEqual(["Hyakku Shiki", "Quattro Bajeena", "ESFS"]);
	});
});
