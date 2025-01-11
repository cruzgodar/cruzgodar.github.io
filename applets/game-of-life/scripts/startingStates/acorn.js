import { writeStateFromAscii } from "./writeStateFromArray.js";

export function acorn(gridSize)
{
	gridSize = Math.max(gridSize, 300);

	const state = new Uint8Array(gridSize * gridSize);

	const ascii = `
		.o.....
		...o...
		oo..ooo
	`;

	writeStateFromAscii({
		state,
		gridSize,
		ascii
	});

	return [state, gridSize];
}