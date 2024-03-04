import { writeStateFromAscii } from "./writeStateFromArray.js";

export function rocket(gridSize)
{
	gridSize = Math.max(gridSize, 500);

	const state = new Uint8Array(gridSize * gridSize);

	const ascii = `
		...o.
		....o
		o...o
		.oooo
		.....
		.....
		.....
		o....
		.oo..
		..o..
		..o..
		.o...
		.....
		.....
		...o.
		....o
		o...o
		.oooo
	`;

	writeStateFromAscii({
		state,
		gridSize,
		ascii,
		startCol: 50
	});

	return [state, gridSize];
}