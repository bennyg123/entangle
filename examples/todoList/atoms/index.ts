import { makeAtom, makeMolecule, makeAtomEffectSnapshot } from "../../../src/index";

const LIST = makeAtom<{ id: number; title: string; completed: boolean }[]>([]);

export const SELECTED_FILTER = makeAtom<"COMPLETED" | "UNCOMPLETED" | "ALL">("ALL");

export const FILTERED_LIST = makeMolecule((get) => {
	const filter = get(SELECTED_FILTER);
	const list = get(LIST);

	switch (filter) {
		case "ALL":
			return list;
		case "COMPLETED":
			return list.filter(({ completed }) => completed === true);
		case "UNCOMPLETED":
			return list.filter(({ completed }) => completed === false);
	}
});

export const ADD_TO_LIST = makeAtomEffectSnapshot((get, set, title: string) => {
	const list = get(LIST);
	let i = 0;

	while (list.find(({ id }) => id === i) !== undefined) {
		i++;
	}

	set(LIST, [...list, { id: i, completed: false, title }]);
});

export const TOGGLE_COMPLETED = makeAtomEffectSnapshot((get, set, id: number) => {
	const list = get(LIST);

	const item = list.find(({ id: _id }) => _id === id);
	item.completed = !item.completed;

	set(LIST, [...list]);
});
