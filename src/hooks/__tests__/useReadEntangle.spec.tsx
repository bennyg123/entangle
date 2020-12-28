import React from "react";
import { renderHook, act as renderAct } from "@testing-library/react-hooks";
import { makeAtom } from "../../core/makeAtom";
import { useEntangle } from "../useEntangle";
import { useMultiReadEntangle, useReadEntangle } from "../useReadEntangle";
import { act, fireEvent, render } from "@testing-library/react";
import { makeMolecule } from "../../core/makeMolecule";

describe("useReadEntangle", () => {
	test("useReadEntangle returns an atom value", () => {
		const msAtom = makeAtom("ZAKU");
		const { result } = renderHook(() => useReadEntangle(msAtom));

		expect(result.current).toEqual("ZAKU");
	});

	test("useReadEntangle updates with the atom", () => {
		const msAtom = makeAtom("ZAKU");

		const AtomReadOnlyComponent = () => {
			const ms = useReadEntangle(msAtom);

			return <h1 className="MS_READ_ONLY">{ms}</h1>;
		};

		const AtomComponent = () => {
			const [ms, setMS] = useEntangle(msAtom);

			return (
				<>
					<button className="UPDATE_MS" onClick={() => setMS("SAZABI")}>
						UPDATE MS
					</button>
				</>
			);
		};

		const { container } = render(
			<>
				<AtomComponent />
				<AtomReadOnlyComponent />
			</>
		);

		expect(container.getElementsByClassName("MS_READ_ONLY")[0].innerHTML).toEqual("ZAKU");

		act(() => {
			fireEvent.click(container.getElementsByClassName("UPDATE_MS")[0]);
		});

		expect(container.getElementsByClassName("MS_READ_ONLY")[0].innerHTML).toEqual("SAZABI");
	});
});

describe("useMultiReadEntangle", () => {
	test("useMultiReadEntangle returns multiple atom values and stay subscribed", () => {
		const msAtom = makeAtom("ZAKU");
		const pilotAtom = makeAtom("Char");
		const allianceMolecule = makeMolecule((get) => (get(msAtom) === "ZAKU" ? "ZEON" : "ESFS"));

		const { result } = renderHook(() => useMultiReadEntangle(msAtom, pilotAtom, allianceMolecule));

		expect(result.current).toStrictEqual(["ZAKU", "Char", "ZEON"]);

		renderAct(() => {
			msAtom.proxy.value = "Hyakku Shiki";
		});

		expect(result.current).toStrictEqual(["Hyakku Shiki", "Char", "ESFS"]);
	});
});
