export function acorn(gridSize)
{
	gridSize = Math.max(gridSize, 300);
	
	const state = new Uint8Array(gridSize * gridSize);

	const row = Math.floor(gridSize / 2) - 1;
	const col = Math.floor(gridSize / 2) - 3;

	state[gridSize * (row + 0) + (col + 1)] = 1;

	state[gridSize * (row + 1) + (col + 3)] = 1;

	state[gridSize * (row + 2) + (col + 0)] = 1;
	state[gridSize * (row + 2) + (col + 1)] = 1;
	state[gridSize * (row + 2) + (col + 4)] = 1;
	state[gridSize * (row + 2) + (col + 5)] = 1;
	state[gridSize * (row + 2) + (col + 6)] = 1;

	return [state, gridSize];
}