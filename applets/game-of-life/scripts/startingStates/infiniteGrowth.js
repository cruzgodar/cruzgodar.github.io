import { writeStateFromAscii } from "./writeStateFromArray.js";

export function infiniteGrowth(gridSize)
{
	gridSize = Math.max(gridSize, 300);

	const state = new Uint8Array(gridSize * gridSize);

	writeStateFromAscii(state, gridSize, `
ooo.o
o....
...oo
.oo.o
o.o.o
`);

	return [state, gridSize];
}