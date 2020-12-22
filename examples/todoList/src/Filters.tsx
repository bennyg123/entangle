import React from "react";
import { useEntangle } from "../../../src";
import { SELECTED_FILTER } from "../atoms";

const Filters = () => {
	const [selectedFilter, setSelectedFilter] = useEntangle(SELECTED_FILTER);

	const updateSelectedFilter = (e) => {
		if (e.target.value) {
			setSelectedFilter(e.target.value);
		}
	};

	return (
		<div className="Filters">
			{["ALL", "COMPLETED", "UNCOMPLETED"].map((filter) => (
				<React.Fragment key={filter}>
					<input
						type="radio"
						value={filter}
						name="filter"
						checked={selectedFilter === filter}
						onChange={updateSelectedFilter}
					/>
					{filter.toLowerCase()}
				</React.Fragment>
			))}
		</div>
	);
};

export default Filters;
