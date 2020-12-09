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

In the above example, a global `atomValue` is created with the initial value passed in. **A non-null, non-undefined value must be passed into makeAtom**. Then the components that need to access that value will pass in the `atomValue` to a `useEntangle` hook inside the component. The `useEntangle` hook works the same way as a `useState` hook, the first value is the value, while the second is an updater function. If either of the buttons are clicked and they update the `atomState`, then both components (and only those components and their children) will rerender, staying in sync. Most importantly the parents will not rerender.

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

Entangle also supports async molecules as well with the `makeAsyncMolecule` method. You can do API calls using atom values here, and they will automatically update and subscribe to those atom changes. One thing to note is a non-null, non-undefined default value must be passed in as a second parameter and this value must match the return value of the async generator function passed in.

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

Same usage as `makeMolecule` except you pass in an async function and a default value as the second argument. ***It is important to note that the second argument must be passed in and not-null/not-undefined.***

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

## Footnotes

Thank you so much for trying this library out. Please leave feedback in the issues section. Have fun. 