import { makeAtom } from "../../core/makeAtom";
import { defaultGetter, defaultSetter } from "../utils";

describe("utils", () => {
	test("defaultGetter gets value from atom", () => {
		const msAtom = makeAtom("ZAKU");

		expect(defaultGetter(msAtom)).toEqual("ZAKU");
	});

	test("defaultSettertGetter sets value to atom", () => {
		const msAtom = makeAtom("ZAKU");

		expect(defaultGetter(msAtom)).toEqual("ZAKU");

		defaultSetter(msAtom, "SAZABI");

		expect(defaultGetter(msAtom)).toEqual("SAZABI");
	});
});
