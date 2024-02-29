export function verticalRow(gridSize)
{
	const state = new Uint8Array(gridSize * gridSize);

	const middleCol1 = Math.floor((gridSize - 1) / 2);
	const middleCol2 = Math.ceil((gridSize - 1) / 2);

	for (let i = 0; i < state.length; i++)
	{
		const col = i % gridSize;

		state[i] = (col === middleCol1 || col === middleCol2) ? 1 : 0;
	}

	return state;
}

export function random(gridSize)
{
	const state = new Uint8Array(gridSize * gridSize);

	for (let i = 0; i < state.length; i++)
	{
		if (Math.random() < 0.5)
		{
			state[i] = 1;
		}
	}

	return state;
}