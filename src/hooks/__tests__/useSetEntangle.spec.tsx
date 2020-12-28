import React, { useEffect } from "react";
import { renderHook } from "@testing-library/react-hooks";
import { act, fireEvent, render } from "@testing-library/react";
import { makeAtom } from "../../core/makeAtom";
import { useEntangle } from "../useEntangle";
import { useMultiSetEntangle, useSetEntangle } from "../useSetEntangle";
import { makeAsyncMolecule, makeMolecule } from "../../core/makeMolecule";
import { makeAsyncMoleculeFamily, makeMoleculeFamily, makeAtomFamily } from "../../core/makeFamily";
import { defaultGetter } from "../../utils/utils";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useSetEntangle", () => {
	test("useSetEntangle returns an function to set atoms", () => {
		const msAtom = makeAtom("ZAKU");
		const { result } = renderHook(() => useSetEntangle(msAtom));

		expect(result.current).toEqual(expect.any(Function));

		result.current("SAZABI");

		expect(msAtom.proxy.value).toEqual("SAZABI");
	});

	test("useSetEntangle updates the atom without rerendering", () => {
		const reRendered = jest.fn();
		const msAtom = makeAtom("ZAKU");

		const AtomSetOnlyComponent = () => {
			const setMS = useSetEntangle(msAtom);

			useEffect(() => {
				reRendered();
			});

			return (
				<button className="UPDATE_MS" onClick={() => setMS("SAZABI")}>
					UPDATE MS
				</button>
			);
		};

		const AtomComponent = () => {
			const [ms, setMS] = useEntangle(msAtom);

			return (
				<>
					<div className="MS_VALUE">{ms}</div>
				</>
			);
		};

		const { container } = render(
			<>
				<AtomComponent />
				<AtomSetOnlyComponent />
			</>
		);

		expect(container.getElementsByClassName("MS_VALUE")[0].innerHTML).toEqual("ZAKU");

		expect(reRendered).toHaveBeenCalledTimes(1);

		act(() => {
			fireEvent.click(container.getElementsByClassName("UPDATE_MS")[0]);
		});

		expect(reRendered).toHaveBeenCalledTimes(1);

		expect(container.getElementsByClassName("MS_VALUE")[0].innerHTML).toEqual("SAZABI");
	});

	test("useSetEntangle throws an error when used with a molecule", () => {
		const msAtom = makeAtom("ZAKU");

		const moleculeFN = (get: typeof defaultGetter) => `MS: ${get(msAtom)}`;
		const asyncMoleculeFN = async (get: typeof defaultGetter) => {
			await sleep(100);

			return `MS: ${get(msAtom)}`;
		};

		const msMolecule = makeMolecule(moleculeFN);
		const msAsyncMolecule = makeAsyncMolecule(asyncMoleculeFN, "");
		const msAtomFromFamily = makeAtomFamily("ZAKU")("");
		const msMoleculeFromFamily = makeMoleculeFamily(moleculeFN)("");
		const msAsyncMoleculeFromFamily = makeAsyncMoleculeFamily(asyncMoleculeFN, "")("");

		[msMolecule, msAsyncMolecule, msMoleculeFromFamily, msAsyncMoleculeFromFamily].map((atom) => {
			expect(() => useSetEntangle(atom)).toThrow(new Error("Read Only ATOMS cannot be used with useSetEntangle"));
		});

		[msAtom, msAtomFromFamily].map((atom) => {
			expect(() => useSetEntangle(atom)).not.toThrow(new Error("Read Only ATOMS cannot be used with useSetEntangle"));
		});
	});
});

describe("useMultiSetEntangle", () => {
	test("useMultiSetEntangle returns multiple atom setters", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");

		const { result } = renderHook(() => useMultiSetEntangle(msAtom, pilotAtom));

		expect(result.current).toStrictEqual([expect.any(Function), expect.any(Function)]);
	});

	test("useMultiSetEntangle throws an error when used with a molecule", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");
		const allianceMolecule = makeMolecule((get) => (get(msAtom) === "ZAKU" ? "ZEON" : "ESFS"));

		expect(() => useMultiSetEntangle(msAtom, pilotAtom, allianceMolecule)).toThrow(
			new Error("Read Only ATOMS cannot be used with useSetEntangle")
		);
	});

	test("useMultiSetEntangle does not stay subscribed to atoms", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");
		const reRendered = jest.fn();

		const Component = () => {
			const [setMS, setPilot] = useMultiSetEntangle(msAtom, pilotAtom);

			useEffect(() => {
				reRendered();
			});

			return (
				<button
					className="UPDATE_ATOMS"
					onClick={() => {
						setMS("Hyakku Shiki");
						setPilot("Quattro Bajeena");
					}}
				></button>
			);
		};

		const { container } = render(<Component />);

		expect(reRendered).toHaveBeenCalledTimes(1);

		act(() => {
			fireEvent.click(container.getElementsByClassName("UPDATE_ATOMS")[0]);
		});

		expect(reRendered).toHaveBeenCalledTimes(1);

		expect(msAtom.proxy.value).toEqual("Hyakku Shiki");
		expect(pilotAtom.proxy.value).toEqual("Quattro Bajeena");
	});
});
