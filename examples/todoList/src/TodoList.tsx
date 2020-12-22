import React from "react";
import { useReadEntangle } from "../../../src";
import { FILTERED_LIST, TOGGLE_COMPLETED } from "../atoms";

const TodoList = () => {
	const filteredList = useReadEntangle(FILTERED_LIST);

	return (
		<ul>
			{filteredList.map(({ id, title, completed }) => (
				<li key={id}>
					<h5>Title: {title}</h5>
					<input type="checkbox" checked={completed} onChange={() => TOGGLE_COMPLETED(id)} /> Completed?
				</li>
			))}
		</ul>
	);
};

export default TodoList;
