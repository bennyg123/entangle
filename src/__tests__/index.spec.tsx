import React, { useEffect } from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { renderHook, act as act2 } from "@testing-library/react-hooks";
import {
	makeAsyncMolecule,
	makeAtom,
	makeAtomEffect,
	makeAtomFamily,
	makeMolecule,
	useEntangle,
	useReadEntangle,
	useSetEntangle,
} from "../index";

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

	test("makeAtomEffect listens to value updates", async () => {
		const mobileSuitAtom = makeAtom("ZAKU");
		const testFN = jest.fn();

		makeAtomEffect((get, set) => {
			testFN(get(mobileSuitAtom) + " FROM ATOM EFFECT");
		});

		const { result: profileResult } = renderHook(() => useEntangle(mobileSuitAtom));

		act2(() => {
			profileResult.current[1]("SAZABI");
		});

		expect(testFN).toBeCalledTimes(2);
		expect(testFN).toHaveBeenCalledWith("SAZABI FROM ATOM EFFECT");
		expect(testFN).toHaveBeenCalledWith("ZAKU FROM ATOM EFFECT");
	});

	test("makeAtomEffect updates value correctly", async () => {
		const mobileSuitAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("");

		makeAtomEffect((get, set) => {
			if (get(mobileSuitAtom) === "SAZABI") {
				set(pilotAtom, "CHAR");
			}
		});

		const { result: profileResult } = renderHook(() => useEntangle(mobileSuitAtom));

		expect(pilotAtom.proxy.value).toEqual("");

		act2(() => {
			profileResult.current[1]("SAZABI");
		});

		expect(pilotAtom.proxy.value).toEqual("CHAR");
	});

	test("useReadEntangle works as expected", async () => {
		const mobileSuitAtom = makeAtom("ZAKU");

		const Component1 = () => {
			const ms = useReadEntangle(mobileSuitAtom);

			return <div className="MS">{ms}</div>;
		};

		const Component2 = () => {
			const [ms, setMS] = useEntangle(mobileSuitAtom);

			return (
				<button className="UPDATE_ATOM" onClick={() => setMS("SAZABI")}>
					Click Me
				</button>
			);
		};

		const { container: container1 } = render(<Component1 />);
		const { container: container2 } = render(<Component2 />);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("ZAKU");

		await act(async () => {
			fireEvent(
				container2.getElementsByClassName("UPDATE_ATOM")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
		});

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("SAZABI");
	});

	test("useSetEntangle works as expected and does not re render component", async () => {
		const mobileSuitAtom = makeAtom("ZAKU");
		const mockReRender = jest.fn();

		const Component1 = () => {
			const ms = useReadEntangle(mobileSuitAtom);

			return <div className="MS">{ms}</div>;
		};

		const Component2 = () => {
			const setMS = useSetEntangle(mobileSuitAtom);

			useEffect(() => {
				mockReRender();
			});

			return (
				<button className="UPDATE_ATOM" onClick={() => setMS("SAZABI")}>
					Click Me
				</button>
			);
		};

		const { container: container1 } = render(<Component1 />);
		const { container: container2 } = render(<Component2 />);

		expect(mockReRender).toHaveBeenCalledTimes(1);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("ZAKU");

		await act(async () => {
			fireEvent(
				container2.getElementsByClassName("UPDATE_ATOM")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
		});

		expect(mockReRender).toHaveBeenCalledTimes(1);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("SAZABI");
	});

	test("makeAtomFamily works with initial value", async () => {
		const mobileSuitAtom = makeAtomFamily("ZAKU");
		const mockReRender1 = jest.fn();
		const mockReRender2 = jest.fn();

		const Component1 = () => {
			const [ms, setMS] = useEntangle(mobileSuitAtom("1"));

			useEffect(() => {
				mockReRender1();
			});

			return (
				<>
					<div className="MS">{ms}</div>{" "}
					<button className="UPDATE_ATOM" onClick={() => setMS("SAZABI")}>
						Click Me
					</button>
				</>
			);
		};

		const Component2 = () => {
			const [ms, setMS] = useEntangle(mobileSuitAtom("2"));

			useEffect(() => {
				mockReRender2();
			});

			return (
				<>
					<div className="MS">{ms}</div>{" "}
					<button className="UPDATE_ATOM" onClick={() => setMS("ZEONG")}>
						Click Me
					</button>
				</>
			);
		};

		const { container: container1 } = render(<Component1 />);
		const { container: container2 } = render(<Component2 />);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("ZAKU");
		expect(container2.getElementsByClassName("MS")[0].innerHTML).toEqual("ZAKU");

		expect(mockReRender1).toHaveBeenCalledTimes(1);
		expect(mockReRender2).toHaveBeenCalledTimes(1);

		await act(async () => {
			fireEvent(
				container1.getElementsByClassName("UPDATE_ATOM")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
		});

		expect(mockReRender1).toHaveBeenCalledTimes(2);
		expect(mockReRender2).toHaveBeenCalledTimes(1);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("SAZABI");
		expect(container2.getElementsByClassName("MS")[0].innerHTML).toEqual("ZAKU");

		await act(async () => {
			fireEvent(
				container2.getElementsByClassName("UPDATE_ATOM")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
		});

		expect(mockReRender1).toHaveBeenCalledTimes(2);
		expect(mockReRender2).toHaveBeenCalledTimes(2);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("SAZABI");
		expect(container2.getElementsByClassName("MS")[0].innerHTML).toEqual("ZEONG");
	});

	test("makeAtomFamily works with initial value which is a function", async () => {
		const mobileSuitAtom = makeAtomFamily((ms: string) => `MS: ${ms}`);
		const mockReRender1 = jest.fn();
		const mockReRender2 = jest.fn();

		const Component1 = () => {
			const [ms, setMS] = useEntangle(mobileSuitAtom("ZAKU"));

			useEffect(() => {
				mockReRender1();
			});

			return (
				<>
					<div className="MS">{ms}</div>{" "}
					<button className="UPDATE_ATOM" onClick={() => setMS("SAZABI")}>
						Click Me
					</button>
				</>
			);
		};

		const Component2 = () => {
			const [ms, setMS] = useEntangle(mobileSuitAtom("Hyaku Shiki"));

			useEffect(() => {
				mockReRender2();
			});

			return (
				<>
					<div className="MS">{ms}</div>{" "}
					<button className="UPDATE_ATOM" onClick={() => setMS("ZEONG")}>
						Click Me
					</button>
				</>
			);
		};

		const { container: container1 } = render(<Component1 />);
		const { container: container2 } = render(<Component2 />);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("MS: ZAKU");
		expect(container2.getElementsByClassName("MS")[0].innerHTML).toEqual("MS: Hyaku Shiki");

		expect(mockReRender1).toHaveBeenCalledTimes(1);
		expect(mockReRender2).toHaveBeenCalledTimes(1);

		await act(async () => {
			fireEvent(
				container1.getElementsByClassName("UPDATE_ATOM")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
		});

		expect(mockReRender1).toHaveBeenCalledTimes(2);
		expect(mockReRender2).toHaveBeenCalledTimes(1);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("SAZABI");
		expect(container2.getElementsByClassName("MS")[0].innerHTML).toEqual("MS: Hyaku Shiki");

		await act(async () => {
			fireEvent(
				container2.getElementsByClassName("UPDATE_ATOM")[0],
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
				})
			);
		});

		expect(mockReRender1).toHaveBeenCalledTimes(2);
		expect(mockReRender2).toHaveBeenCalledTimes(2);

		expect(container1.getElementsByClassName("MS")[0].innerHTML).toEqual("SAZABI");
		expect(container2.getElementsByClassName("MS")[0].innerHTML).toEqual("ZEONG");
	});
});
