// eslint-disable-next-line no-undef
module.exports = {
	// The root of your source code, typically /src
	// `<rootDir>` is a token Jest substitutes
	roots: ["<rootDir>/src"],

	// Jest transformations -- this adds support for TypeScript
	// using ts-jest
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},

	setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
	// Test spec file resolution pattern
	// Matches parent folder `__tests__` and filename
	// should contain `test` or `spec`.
	testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
	moduleNameMapper: {
		"\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
	},

	// Module file extensions for importing
	moduleFileExtensions: ["tsx", "ts", "js"],
};
