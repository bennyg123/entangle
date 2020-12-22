import React, { useRef } from "react";
import { ADD_TO_LIST } from "../atoms";

const AddTodo = () => {
	const todoRef = useRef<HTMLInputElement>(null);

	const handleAddTodo = () => {
		if (todoRef.current?.value) {
			ADD_TO_LIST(todoRef.current.value);
		}
	};

	return (
		<div className="AddTodo">
			<div className="AddTodo_Input">
				<input ref={todoRef} className="AddTodo_InputName" type="text" />
			</div>
			<button onClick={handleAddTodo} className="AddTodo_Add">
				Add Todo
			</button>
		</div>
	);
};

export default AddTodo;
