import React from "react";
import AddTodo from "./AddTodo";
import Filters from "./Filters";
import TodoList from "./TodoList";

const App = () => (
	<div className="App">
		<AddTodo />
		<Filters />
		<TodoList />
	</div>
);

export default App;
