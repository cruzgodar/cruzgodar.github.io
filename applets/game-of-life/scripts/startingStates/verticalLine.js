export function verticalLine(gridSize)
{
	const state = new Uint8Array(gridSize * gridSize);

	const middleCol1 = Math.floor((gridSize - 1) / 2);
	const middleCol2 = Math.ceil((gridSize - 1) / 2);

	for (let i = 0; i < state.length; i++)
	{
		const col = i % gridSize;

		state[i] = (col === middleCol1 || col === middleCol2) ? 1 : 0;
	}

	return [state, gridSize];
}