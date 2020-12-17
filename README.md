# Entangle

[![bennyg123](https://circleci.com/gh/bennyg123/entangle.svg?style=svg&circle-token=d913026464207a76d0fecb39f5f57452b794f0c2)](https://circleci.com/gh/bennyg123/entangle)

Global state management tool for react hooks inspired by [RecoilJS](https://github.com/facebookexperimental/Recoil) using proxies.

## Features

- No need for context
- Zero dependencies
- Super lightweight: **< 1kb gzipped**

## Table of Contents
- [Entangle](#entangle)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Intro](#intro)
  - [Getting Started](#getting-started)
  - [API](#api)
    - [`makeAtom`](#makeatom)
    - [`makeMolecule`](#makemolecule)
  - [makeAsyncMolecule](#makeasyncmolecule)
  - [useEntangle](#useentangle)
  - [makeAtomEffect](#makeatomeffect)
  - [Advance API](#advance-api)
    - [`useReadEntangle`](#usereadentangle)
    - [`useSetEntangle`](#usesetentangle)
    - [`makeAtomFamily`](#makeatomfamily)
  - [Develop](#develop)
  - [Footnotes](#footnotes)

  - [Develop](#develop)
  - [Footnotes](#footnotes)

## Intro

Inspired by [RecoilJS](https://github.com/facebookexperimental/Recoil) with its 3D state management where the state does not live with the virtual dom tree, I wanted to create a simpler and much more lightweight version for modern browsers (IE is dead!!). The current state management solutions in the react ecosystem work really well (mobx, redux, etc), but I think a recoil like library that allows for granular updates without context and without having to rerender the whole DOM tree is the future. Thus Entangle was born. The name Entangle comes from quantum entanglement where two Atoms are linked event across great distances and can affect each other.

This library is written in TS and has typings shipped with it.

This library should work with all browsers that support [proxies](https://caniuse.com/?search=Proxy) (aka all modern browsers). However if you need to support other browsers there is a [polyfill](https://github.com/GoogleChrome/proxy-polyfill) available, though that wont be officially supported by this library.

Please try this library out and let me know if you encounter any bugs and suggestions on improvements. Its still very much in the experimental and testing phase so try at your own risk.

<a href="https://buymeacoffee.com/bennyg123">
    <img alt="Buy Me A Coffee" src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" style="height: auto !important; width: auto !important;" />
</a>

## Getting Started

Super simple example with makeAtom

```jsx
import { makeAtom, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");

const Component1 = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <h1>{atomState}</h1>
        </div>
    );
}

const Component2 = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello World")}>Update atomState</button>
            <h1>{atomState}</h1>
        </div>
    );
}
```

In the above example, a global `atomValue` is created with the initial value passed in. Then the components that need to access that value will pass in the `atomValue` to a `useEntangle` hook inside the component. The `useEntangle` hook works the same way as a `useState` hook, the first value is the value, while the second is an updater function. If either of the buttons are clicked and they update the `atomState`, then both components (and only those components and their children) will rerender, staying in sync. Most importantly the parents will not rerender.

```tsx
import { makeAtom, makeMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const moleculeValue = makeMolecule((get) => get(atomValue) + " world");

const Component = () => {
    const [atomState] = useEntangle(moleculeValue);
    
    return (
        <div>
            <h1>{atomState}</h1>
        </div>
    );
}
```

Entangle also supports composition using atoms as well. You can pass a function to `makeMolecule` that takes a get method and composes the composed value using `get` to get the atom's current value and subscribe to those changes.

```tsx
import { makeAtom, makeAsyncMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const asyncMoleculeValue = makeAsyncMolecule(async (get) => {
    const response = await fetch(`API/${get(atomValue)}`);
    const value = await response.json(); // { value: "Hello World" }
    return value;
}, { 
    value: "Default
}});

const Component = () => {
    const [atomState] = useEntangle(asyncMoleculeValue);
    
    return (
        <div>
            <h1>{atomState}</h1>
        </div>
    );
}
```

Entangle also supports async molecules as well with the `makeAsyncMolecule` method. You can do API calls using atom values here, and they will automatically update and subscribe to those atom changes. The value of the second parameter must match the return value of the async generator function passed in.

For example the below example wont work since you passed in a string for a default value but the async function returns an object.
```tsx
import { makeAtom, makeAsyncMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const asyncMoleculeValue = makeAsyncMolecule(async (get) => {
    const response = await fetch(`API/${get(atomValue)}`);
    const {value} = await response.json(); // { value: "Hello World" }
    return { response: value };
}, "HELLO WORLD);

const Component = () => {
    const [atomState] = useEntangle(asyncMoleculeValue);
    
    return (
        <div>
            <h1>{atomState}</h1>
        </div>
    );
}
```

For this reason it is better to add explicit types (if you are using TS) to the make methods:

```tsx
import { makeAtom, makeMolecule, makeAsyncMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom<string>("1");
const moleculeValue = makeMolecule<number>((get) => parseInt(get(atomValue)));
const atomValue = makeAsyncMolecule<{value: string}>(async (get) => ({value: get(atomValue)}));

```

<hr />
## API
### `makeAtom`

makeAtom creates an atom value to be used inside the useEntangle hook. All components using this value will be synced and updated when any of the components update the atom. It does not matter how deeply nested.

```jsx
import { makeAtom, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");

const Component = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <h1>{atomState}</h1>
        </div>
    );
}
```

### `makeMolecule`

makeMolecule allows for subscriptions to an atoms changes for composing values based off other atoms.

```jsx
import { makeAtom, makeMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const moleculeValue = makeMolecule((get) => get(atomValue) + " world");

const Component = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    const [moleculeState] = useEntangle(moleculeValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <h1>{atomState}</h1>
            <h1>{moleculeState}</h1>
        </div>
    );
}
```

***important: while the useEntangle hook will always return two values, the first is the state value, the second is an updater, when you use useEntangle with an molecule (async or not), the second function will not update any values or do anything***

```jsx
import { makeAtom, makeMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const moleculeValue = makeMolecule((get) => get(atomValue) + " world");

const Component = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    const [moleculeState, setMoleculeState] = useEntangle(moleculeValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <button onClick={() => setMoleculeState("Hello, 世界")}>Does not do anything</button> {/* will not do anything */}
            <h1>{atomState}</h1>
            <h1>{moleculeState}</h1>
        </div>
    );
}
```

## makeAsyncMolecule

Same usage as `makeMolecule` except you pass in an async function and a default value as the second argument.

```jsx
import { makeAtom, makeMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const moleculeValue = makeMolecule(async (get) => get(atomValue) + " world", "defaultValue");

const Component = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    const [moleculeState] = useEntangle(moleculeValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <h1>{atomState}</h1>
            <h1>{moleculeState}</h1>
        </div>
    );
}
```

## useEntangle

`useEntangle` entangles the atoms together with the components and syncs them. The API is the same as `useState` and whenever an atom is updated, all other components that has `useEntangle` with that atom value or has `useEntangle` with a molecule that is composed with that atom value will get updated.

```jsx
import { makeAtom, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");

const Component = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <h1>{atomState}</h1>
        </div>
    );
}
```

## makeAtomEffect

Sometimes we want to do side effects that update other atoms outside of a component, thats where `makeAtomEffect` comes in handy. 
You pass it a function that has a getter and setter passed to it and in it you can get and set atoms, be aware of infinite loops though as the
`makeAtomEffect` subscribes to all the getters it uses/calls

```ts
import { makeAtom, makeAtomEffect } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const atomValue2 = makeAtom("");

makeAtomEffect((get, set) => {
    const value1 = get(atomValue);
    set(atomValue2, value);
})
```

## Advance API

### `useReadEntangle`

Sometimes in our components we don't want to allow for updates to an atom and only want to consume the values, thats where useReadEntangle comes in handy.
It only returns a read only value and lets the component subscribe to the atom changes.

```tsx
 
const atom1 = makeAtom("Hello");
 
const Component = () => {
	const value = useReadEntangle(atom1);

	return (
        <div>{value}</div>
	)
}
```

### `useSetEntangle`

Sometimes a component only needs to set an atom's value and not subscribe to those changes, as a result useSetEntangle will only return a function that'll set an atoms value and
update other components subscribed but not the current component.

```tsx
 
const atom1 = makeAtom("Hello");
 
const Component = () => {
    const setValue = useSetEntangle(atom1);
    // Is not subscribed to ATOM changes

	return (
    	<button onClick={() => setValue("World")}>Update Atom</button>
	)
}
```

### `makeAtomFamily`

When we need to have a array or set of atoms, makeAtomFamily can help, it is an atom generator that takes either an initial value or function that returns an initial value, and outputs a helper function to generate atoms on the fly. You can pass in values as arguments for initialization, and then use it the exact same as a regular atom. The arguments help act as keys to differentiate an atom from each other, thus if one component updates an atom, then the other components using an atomFamily wont get updated.

```tsx
const atomFamily = makeAtomFamily("Hello");
 
const Component1 = () => {
 	const setValue = useEntangle(atomFamily("A"));
 
  	// Component1 will not update Component2
  	return (
  		<button onClick={() => setValue("World")}>Update Atom</button>
 	)
}
 
const Component2 = () => {
 	const setValue = useEntangle(atomFamily("B"));
 
  	// Component2 will not update Component1
  	return (
  		<button onClick={() => setValue("World")}>Update Atom</button>
  	)
}
```

```tsx
const atomFamily = makeAtomFamily((arg1, arg2) => arg1 + arg2);

const Component = () => {
    const setValue = useEntangle(atomFamily(1, 2));
 
  	return (
  		// All subsequent sets to the atom should be set like a regular atom and not via the function
  		<button onClick={() => setValue(32)}>Update Atom</button>
  	)
}
 
const Component2 = () => {
 	const setValue = useEntangle(atomFamily(3, 4));
 
 	return (
  		<button onClick={() => setValue(24)}>Update Atom</button>
  	)
}
```

## Develop

To develop, you can fork this repo. 

To build:
```
yarn && yarn run build
```

To run test:
```
yarn && yarn run test
```

To run lint:
```
yarn && yarn run lint
```

To run example page:
```
yarn && yarn run example
```
## Footnotes

Thank you so much for trying this library out. Please leave feedback in the issues section. Have fun. 