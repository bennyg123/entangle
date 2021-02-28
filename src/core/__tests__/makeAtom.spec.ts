import { act } from "@testing-library/react";
import { makeAtom, makeAtomEffect, makeAtomEffectSnapshot } from "../makeAtom";

jest.useFakeTimers();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("makeAtom", () => {
	test("makeAtom returns the right object with primitives", () => {
		["ZAKU", 782, 3.14, false, { pilot: "Char Azanable" }].forEach((primitive) => {
			expect(makeAtom(primitive)).toStrictEqual({
				proxy: { value: primitive },
				setCallback: expect.any(Function),
				readOnly: false,
			});
		});
	});

	test("makeAtom's setCallback is called when value is updated", () => {
		const callbackFN = jest.fn();
		const msAtomValue = makeAtom("ZAKU");

		expect(msAtomValue.proxy.value).toEqual("ZAKU");

		msAtomValue.setCallback(callbackFN);

		msAtomValue.proxy.value = "SAZABI";
		expect(msAtomValue.proxy.value).toEqual("SAZABI");

		expect(callbackFN).toHaveBeenCalledWith("SAZABI");
	});

	test("makeAtom cleanup callbacks correctly", () => {
		const callbackFN = jest.fn();
		const callbackFN2 = jest.fn();
		const msAtomValue = makeAtom("ZAKU");

		expect(msAtomValue.proxy.value).toEqual("ZAKU");

		msAtomValue.setCallback(callbackFN);
		const cleanup = msAtomValue.setCallback(callbackFN2);

		msAtomValue.proxy.value = "SAZABI";
		expect(msAtomValue.proxy.value).toEqual("SAZABI");

		expect(callbackFN).toHaveBeenCalledWith("SAZABI");
		expect(callbackFN2).toHaveBeenCalledWith("SAZABI");

		cleanup();

		msAtomValue.proxy.value = "ZEONG";
		expect(msAtomValue.proxy.value).toEqual("ZEONG");

		expect(callbackFN).toHaveBeenCalledWith("ZEONG");
		expect(callbackFN2).not.toHaveBeenCalledWith("ZEONG");

		expect(callbackFN).toHaveBeenCalledTimes(2);
		expect(callbackFN2).toHaveBeenCalledTimes(1);
	});
});

describe("makeAtomEffect", () => {
	test("makeAtomEffect gets and sets atom value correctly", () => {
		const msAtomValue = makeAtom("ZAKU");
		const newMSAtomValue = makeAtom("");

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("");

		makeAtomEffect((get, set) => {
			const oldValue = get(msAtomValue);
			set(newMSAtomValue, oldValue);
		});

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("ZAKU");
	});

	test("makeAtomEffect is subscribed to atoms", () => {
		const msAtomValue = makeAtom("ZAKU");
		const newMSAtomValue = makeAtom("");

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("");

		makeAtomEffect((get, set) => {
			const oldValue = get(msAtomValue);
			set(newMSAtomValue, oldValue);
		});

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("ZAKU");

		msAtomValue.proxy.value = "SAZABI";

		expect(msAtomValue.proxy.value).toEqual("SAZABI");
		expect(newMSAtomValue.proxy.value).toEqual("SAZABI");
	});

	test("makeAtomEffect is not subscribed to atoms when passing in false", () => {
		const pilotAtomValue = makeAtom("Char");
		const msAtomValue = makeAtom("ZAKU");
		const newMSAtomValue = makeAtom("");

		expect(pilotAtomValue.proxy.value).toEqual("Char");
		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("");

		makeAtomEffect((get, set) => {
			const pilotValue = get(pilotAtomValue);
			const msValue = get(msAtomValue, false);
			set(newMSAtomValue, `${pilotValue}:${msValue}`);
		});

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("Char:ZAKU");

		msAtomValue.proxy.value = "SAZABI";

		expect(msAtomValue.proxy.value).toEqual("SAZABI");
		expect(newMSAtomValue.proxy.value).toEqual("Char:ZAKU");
	});

	test("makeAtomEffect works with async functions correctly", () => {
		const msAtomValue = makeAtom("ZAKU");
		const newMSAtomValue = makeAtom("");

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("");

		makeAtomEffect(async (get, set) => {
			sleep(1);
			const oldValue = get(msAtomValue);
			set(newMSAtomValue, oldValue);
		});

		act(() => {
			jest.runAllTimers();
		});

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("ZAKU");
	});
});

describe("makeAtomEffectSnapshot", () => {
	test("makeAtomEffectSnapshot returns a function", () => {
		const msAtomValue = makeAtom("ZAKU");
		const newMSAtomValue = makeAtom("");

		const atomEffectSnapshot = makeAtomEffectSnapshot((get, set) => {
			const oldValue = get(msAtomValue);
			set(newMSAtomValue, oldValue);
		});

		expect(atomEffectSnapshot).toEqual(expect.any(Function));
	});

	test("makeAtomEffectSnapshot gets and sets correctly", () => {
		const msAtomValue = makeAtom("ZAKU");
		const newMSAtomValue = makeAtom("");

		const atomEffectSnapshot = makeAtomEffectSnapshot((get, set) => {
			const oldValue = get(msAtomValue);
			set(newMSAtomValue, oldValue);
		});

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("");

		atomEffectSnapshot();

		expect(msAtomValue.proxy.value).toEqual("ZAKU");
		expect(newMSAtomValue.proxy.value).toEqual("ZAKU");
	});

	test("makeAtomEffectSnapshot handles arguments correctly", () => {
		const newMSAtomValue = makeAtom("MS: ");

		const atomEffectSnapshot = makeAtomEffectSnapshot<string[]>((get, set, ms: string) => {
			set(newMSAtomValue, get(newMSAtomValue) + ms);
		});

		atomEffectSnapshot("ZAKU");

		expect(newMSAtomValue.proxy.value).toEqual("MS: ZAKU");
	});

	test("makeAtomEffectSnapshot is not subscribed to atoms", () => {
		const mockCallbackFN = jest.fn();
		const newMSAtomValue = makeAtom("MS: ");

		const atomEffectSnapshot = makeAtomEffectSnapshot<string[]>((get, set, ms: string) => {
			mockCallbackFN();
			set(newMSAtomValue, get(newMSAtomValue) + ms);
		});

		atomEffectSnapshot("ZAKU");

		expect(newMSAtomValue.proxy.value).toEqual("MS: ZAKU");

		newMSAtomValue.proxy.value = "MS: SAZABI";

		expect(mockCallbackFN).toHaveBeenCalledTimes(1);

		atomEffectSnapshot("ZAKU");

		expect(mockCallbackFN).toHaveBeenCalledTimes(2);
	});
});
