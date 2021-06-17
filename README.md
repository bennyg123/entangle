# Entangle

<a href="https://app.circleci.com/pipelines/github/bennyg123/entangle">
    <img src="https://badgen.net/github/status/bennyg123/entangle/main/circleci?service=github">
</a>
<a href="https://www.npmjs.com/package/@bennyg_123/entangle">
    <img src="https://badgen.net/npm/v/@bennyg_123/entangle?service=github " />
</a>
<a href="https://bundlephobia.com/result?p=@bennyg_123/entangle@latest">
    <img src="https://badgen.net/bundlephobia/minzip/@bennyg_123/entangle@latest?service=github" />
</a>
<a href="https://www.npmjs.com/package/@bennyg_123/entangle">
    <img src="https://badgen.net/npm/dt/@bennyg_123/entangle?service=github" />
</a>

Global state management tool for react hooks inspired by [RecoilJS](https://github.com/facebookexperimental/Recoil) and [Jotai](https://github.com/pmndrs/jotai) using proxies.

## Features

- No need for context
- Zero dependencies
- Super lightweight: [~ 1kb gzipped](https://bundlephobia.com/result?p=@bennyg_123/entangle)

## Table of Contents
  - [Intro](#intro)
  - [Getting Started](#getting-started)
  - [API](#api)
    - [`makeAtom`](#make-atom)
    - [`makeMolecule`](#make-molecule)
    - [`makeAsyncMolecule`](#make-async-molecule)
    - [`makeAtomEffect`](#make-atom-effect)
  - [Hooks](#hooks)
    - [`useEntangle`](#use-entangle)
    - [`useMultiEntangle`](#use-multi-entangle)
    - [`useReadEntangle`](#use-read-entangle)
    - [`useMultiReadEntangle`](#use-multi-read-entangle)
    - [`useSetEntangle`](#use-set-entangle)
    - [`useMultiSetEntangle`](#use-multi-set-entangle)
  - [Advance API](#advance-api)
    - [`makeAtomEffectSnapshot`](#make-atom-effect-snapshot)
    - [`makeAtomFamily`](#make-atom-family)
    - [`makeMoleculeFamily`](#make-molecule-family)
    - [`makeAsyncMoleculeFamily`](#make-async-molecule-family)
    - [`Debounce`](#debounce-molecules-effects)
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

In the above example, a global `atomValue` is created with the initial value passed in. Then the components that need to access that value will pass in the `atomValue` to a `useEntangle` hook inside the component. 

The `useEntangle` hook works the same way as a `useState` hook, the first value is the value, while the second is an updater function. If either of the buttons are clicked and they update the `atomState`, then both components (and only those components and their children) will rerender, staying in sync. Most importantly the parents will not rerender.

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
    value: "Default"
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
}, "HELLO WORLD");

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
<h3 id="make-atom"><code>makeAtom</code></h3>

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

<h3 id="make-molecule"><code>makeMolecule</code></h3>

makeMolecule allows for subscriptions to an atoms changes for composing values based off other atoms.

```jsx
import { makeAtom, makeMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const atomValue2 = makeAtom("world");

// In the below example, you can pass in am optional boolean as a second argument to the getter, this will un subscribe the molecule from that atoms changes
const moleculeValue = makeMolecule((get) => get(atomValue) + get(atomValue2, false));

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
***It is important to note that since molecules are dependent on atoms. They are read only, thus while they can be used with `useEntangle`, calling the set function will throw an error. As a result they should be used with `useReadEntangle`***

```jsx
import { makeAtom, makeMolecule, useEntangle } from "@bennyg_123/entangle";

const atomValue = makeAtom("Hello");
const moleculeValue = makeMolecule((get) => get(atomValue) + " world");

const Component = () => {
    const [atomState, setAtomState] = useEntangle(atomValue);
    const [moleculeState, setMoleculeState] = useEntangle(moleculeValue); // not recommended
    const readOnlyMoleculeState = useReadEntangle(moleculeValue);
    
    return (
        <div>
            <button onClick={() => setAtomState("Hello, 世界")}>Update atomState</button>
            <button onClick={() => setMoleculeState("Hello, 世界")}>Throws an error</button>
            <h1>{atomState}</h1>
            <h1>{moleculeState}</h1>
            <h1>{readOnlyMoleculeState}</h1>
        </div>
    );
}
```

<h3 id="make-async-molecule"><code>makeAsyncMolecule</code></h3>

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

<h3 id="make-atom-effect"><code>makeAtomEffect</code></h3>

Sometimes we want to do side effects that update other atoms outside of a component, thats where `makeAtomEffect` comes in handy. 

You pass it a function that has a getter and setter passed to it and in it you can get and set atoms, be aware of infinite loops though as the
`makeAtomEffect` subscribes to all the getters it uses/calls

```ts
import { makeAtom, makeAtomEffect } from "@bennyg_123/entangle";

const atomValue1 = makeAtom("Hello");
const atomValue2 = makeAtom(" World");

const combinedValue = makeAtom("");

makeAtomEffect((get, set) => {
    const value1 = get(atomValue);
    // Similar to get molecule, for the getter function, if you pass in a false boolean as the second parameter, it will not subscribe to the atoms changes
    const value2 = get(atomValue, false);
    set(combinedValue, value1 + value2);
})
```

### Hooks

<h3 id="use-entangle"><code>useEntangle</code></h3>

`useEntangle` entangles the atoms together with the components and syncs them. The API is the same as `useState` and whenever an atom is updated, all other components that has `useEntangle` with that atom value or has `useEntangle` with a molecule that is composed with that atom value will get updated.

***if a molecule is passed in, calling the set function will throw an error. Thus it is advised to use molecules with `useReadEntangle` instead. ***

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

<h3 id="use-multi-entangle"><code>useMultiEntangle</code></h3>

For reading and setting multiple atoms, you can use `useMultiEntangle` with multiple atoms. You pass in a list of atoms as arguments and it'll return getters and setters in that order.

***Unfortunately due to my own limited knowledge with advanced ts, I was unable to make typing work with the `useMulti` hooks. I am actively looking for a way for TS to infer the types of atoms passed in and evaluate typings, but any help would be greatly appreciated.***

```tsx

import { makeAtom, useMultiEntangle } from "@bennyg_123/entangle";

const atom1 = makeAtom("Hello");
const atom2 = makeAtom("World");
const atom3 = makeAtom1("!!!");
 
const Component = () => {
    const [
        [atom1Value, atom2Value, atom3Value],
        [setAtom1, setAtom2, setAtom3]
    ] = useMultiEntangle(atom1, atom2, atom3);

    ...
}
```

<h3 id="use-read-entangle"><code>useReadEntangle</code></h3>


Sometimes in our components we don't want to allow for updates to an atom and only want to consume the values, thats where useReadEntangle comes in handy.
It only returns a read only value and lets the component subscribe to the atom changes.

```tsx
import { makeAtom, useReadEntangle } from "@bennyg_123/entangle";

const atom1 = makeAtom("Hello");
 
const Component = () => {
    const value = useReadEntangle(atom1);

    return (
        <div>{value}</div>
    )
}
```

<h3 id="use-multi-read-entangle"><code>useMultiReadEntangle</code></h3>

When one needs to read from multiple atoms and stay subscribed use `useMultiReadEntangle`. Pass in multiple atoms and get the values back in an array.

```tsx

import { makeAtom, useMultiReadEntangle } from "@bennyg_123/entangle";

const atom1 = makeAtom("Hello");
const atom2 = makeAtom("World");
const atom3 = makeAtom1("!!!");
 
const Component = () => {
    const [atom1Value, atom2Value, atom3Value] = useMultiReadEntangle(atom1, atom2, atom3);

    ...
}
```

<h3 id="use-set-entangle"><code>useSetEntangle</code></h3>

Sometimes a component only needs to set an atom's value and not subscribe to those changes, as a result useSetEntangle will only return a function that'll set an atoms value and update other components subscribed but not the current component. ***useSetEntangle will not take in a molecule***

```tsx
import { makeAtom, useSetEntangle } from "@bennyg_123/entangle";

const atom1 = makeAtom("Hello");
 
const Component = () => {
    const setValue = useSetEntangle(atom1);
    // Is not subscribed to ATOM changes

    return (
        <button onClick={() => setValue("World")}>Update Atom</button>
    )
}
```

<h3 id="use-multi-set-entangle"><code>useMultiSetEntangle</code></h3>

When one needs to set multiple atoms use `useMultiSetEntangle`. Pass in multiple atoms and get the setters back in an array.

```tsx

import { makeAtom, useMultiSetEntangle } from "@bennyg_123/entangle";

const atom1 = makeAtom("Hello");
const atom2 = makeAtom("World");
const atom3 = makeAtom1("!!!");
 
const Component = () => {
    const [setAtom1, setAtom2, setAtom3] = useMultiSetEntangle(atom1, atom2, atom3);

    ...
}
```

## Advance API

<h3 id="make-atom-effect-snapshot"><code>makeAtomEffectSnapshot</code></h3>

For certain situations it might advantageous to manually call a side effect function without having it subscribe to atom changes. For this `makeAtomEffectSnapshot` can be used. 

`makeAtomEffectSnapshot` takes in a function or async function exactly like makeAtomEffect, with a getter and setter parameter and returns a function that can be called with arguments when the developer wants the side effect function to be run.

```tsx
import { makeAtom, makeAtomEffectSnapshot } from "@bennyg_123/entangle";

const atom1 = makeAtom("Hello");
const snapshotFN = makeAtomEffectSnapshot(async (get, arg1) => {
    writeToDB(get(atom1) + arg1);
});
 
const Component = () => {
    useEffect(() => {
        snapshotFN("ARG")
    }, [])
    // Is not subscribed to ATOM changes

    return (<></>)
}
```

<h3 id="make-atom-family"><code>makeAtomFamily</code></h3>

When we need to have a array or set of atoms, makeAtomFamily can help. It is an atom generator that takes either an initial value or function that returns an initial value, and outputs a helper function to generate atoms on the fly. 

You can pass in values as arguments for initialization, and then use it the exact same as a regular atom. The first argument must be a string as this acts as a key to differentiate an atom from each other, thus if one component updates an atom, then the other components using an atomFamily wont get updated. This also allows atoms in families to be shared if they use the same key.

```tsx
import { makeAtomFamily } from "@bennyg_123/entangle";

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

const Component3 = () => {
 	const setValue = useEntangle(atomFamily("A"));
 
  	// Component1 will update Component3
  	return (
  		<button onClick={() => setValue("World")}>Update Atom</button>
 	)
}
```

```tsx
import { makeAtomFamily } from "@bennyg_123/entangle";

// First argument is always a string that acts as a key to differentiate atoms
const atomFamily = makeAtomFamily((arg1: string, arg2) => parseInt(arg1) + arg2);

const Component = () => {
    const setValue = useEntangle(atomFamily("1", 2));
 
  	return (
  		// All subsequent sets to the atom should be set like a regular atom and not via the function
  		<button onClick={() => setValue(32)}>Update Atom</button>
  	)
}
 
const Component2 = () => {
 	const setValue = useEntangle(atomFamily("3", 4));
 
 	return (
  		<button onClick={() => setValue(24)}>Update Atom</button>
  	)
}
```

<h3 id="make-molecule-family"><code>makeMoleculeFamily</code></h3>

Same as makeAtomFamily but instead of instantiating atoms, it instantiates molecules. The initializer function has a getter function (same as makeMolecule), a key, and arguments passed in. The return function subsequently takes a unique string key and any additional arguments that need to be passed to the molecule function.

```tsx
import { makeAtom, makeMoleculeFamily } from "@bennyg_123/entangle";

const atom = makeAtom("Hello");
const moleculeFamily = makeMoleculeFamily((get, key, arg1) => `${get(atom)} ${key} ${arg1}`);
 
const Component1 = () => {
 	const value = useReadEntangle(moleculeFamily("A", 123));
 
    // will render `Hello A 123`
    return (
        <div>{value}</div> 
    )
}
```

<h3 id="make-async-molecule-family"><code>makeAsyncMoleculeFamily</code></h3>

Same as makeMoleculeFamily except this takes in an async function and also takes either an initial value or a synchronous function to generate an initial value for the async molecules.

```tsx
import { makeAtom, makeAsyncMoleculeFamily } from "@bennyg_123/entangle";

const atom = makeAtom("Hello");
const asyncMoleculeFamily = makeAsyncMoleculeFamily(async (get, key, arg1) => {
    value = await db.get(); // returns ABCD
    `${get(atom)} ${key} ${arg1} ${value}`
}, "Loading");
 
const Component1 = () => {
    const value = useReadEntangle(asyncMoleculeFamily("A", 123));
 
    // will render `Loading` at first then `Hello A 123 ABCD` when the db call is done
    return (
        <div>{value}</div> 
    )
}
```

```tsx
import { makeAtom, makeAsyncMoleculeFamily } from "@bennyg_123/entangle";

const atom = makeAtom("Hello");
const asyncMoleculeFamily = makeAsyncMoleculeFamily(async (get, key, arg1) => {
    value = await db.get(); // returns ABCD
    `${get(atom)} ${key} ${arg1} ${value}`
}, (get, key, arg1) => `Loading ${key} ${arg1}`);
 
const Component1 = () => {
    const value = useReadEntangle(asyncMoleculeFamily("A", 123));
 
    // will render `Loading A 123` at first then `Hello A 123 ABCD` when the db call is done
    return (
        <div>{value}</div> 
    )
}
```

<h3 id="debounce-molecules-effects"><code>Debounce</code></h3>

Since the `makeAtomEffect`, `makeAsyncMolecule` and `makeMolecule` functions run automatically, sometimes when a large amount of changes are made at the same, this could result in running expensive functions multiple times. Thus there is the option to debounce these functions by waiting a set time before running them. This can be achieved by passing a time in ms as the last argument when initializing an Atom Effect or a Molecule.

```tsx
// This effect will debounce and be run 500 ms after receiving the last atom update. If an atom is updated before 500ms then the debounce timer is reset and the effect wont run.
makeAtomEffect((get, set) => { ... }, 500); 

// Equivalent debounce usage for molecules and async molecules
makeMolecule((get, set) => { ... }, 500);
makeAsyncMolecule((get, set) => { ... }, {},  500)
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
