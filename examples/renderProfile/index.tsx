import "regenerator-runtime/runtime";
import React from "react";
import ReactDom from "react-dom";
import { makeAsyncMolecule, makeAtom, makeMolecule, useEntangle } from "../../src/index";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parentAtomValue = makeAtom(1);
const childAtomValue = makeAtom("I am a child");
const moleculeChildAtomValue = makeMolecule((get) => get(childAtomValue) + " and I am a molecule");
const asyncChildAtomValue = makeAsyncMolecule(async (get) => {
	await sleep(1500);
	const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${get(parentAtomValue)}`);
	const value = await response.json();
	return value;
}, "LOADING");

const AsyncChild = () => {
	const [asyncChildState] = useEntangle(asyncChildAtomValue);

	return (
		<>
			<div>AsyncChild state is : {JSON.stringify(asyncChildState)}</div>
		</>
	);
};

const MoleculeChild = () => {
	const [moleculeChildState] = useEntangle(moleculeChildAtomValue);

	return (
		<>
			<div>Child state is : {moleculeChildState}</div>
		</>
	);
};

const Child = () => {
	const [childState] = useEntangle(childAtomValue);

	return (
		<>
			<div>Child state is : {childState}</div>
			<hr />
		</>
	);
};

const Parent = () => {
	const [parentState] = useEntangle(parentAtomValue);

	return (
		<>
			<div>Parent state is : {parentState}</div>
			<hr />
			<Child />
			<hr />
			<MoleculeChild />
			<hr />
		</>
	);
};

const Controls = () => {
	const [parentValue, setParentState] = useEntangle(parentAtomValue);
	const [, setChildState] = useEntangle(childAtomValue);

	return (
		<>
			<button onClick={() => setParentState(parentValue + 1)}>Update Parent</button>
			<button onClick={() => setChildState("I am a cool child")}>Update Child</button>
		</>
	);
};

const App = () => (
	<div>
		<Controls />
		<Parent />
		<AsyncChild />
	</div>
);

ReactDom.render(<App />, document.getElementById("root"));
