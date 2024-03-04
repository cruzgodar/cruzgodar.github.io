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

	return [state, gridSize];
}