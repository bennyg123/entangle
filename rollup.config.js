import rollupTypescript from "rollup-plugin-typescript2";
import typescript from "typescript";
import copy from "rollup-plugin-copy";
import packageJSON from "./package.json";
import compiler from "@ampproject/rollup-plugin-closure-compiler";

export default {
	input: "src/index.ts",
	output: [
		{
			file: `${packageJSON.module}`,
			format: "es",
			exports: "named",
		},
		{
			file: `${packageJSON.main}`,
			format: "cjs",
			exports: "named",
		},
		{
			file: `${packageJSON.unpkg}`,
			format: "umd",
			exports: "named",
			name: "Entangle",
			globals: {
				react: "React",
			},
		},
	],
	// external: ["react"],
	plugins: [
		rollupTypescript({
			typescript: typescript,
		}), // Converts the TSX files to JS
		compiler(), // minifies the js bundle
		copy({
			targets: [{ src: "src/index.d.ts", dest: "dist" }],
		}),
	],
};
