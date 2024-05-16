export function generateRandomPlanePartition()
{
	const sideLength = Math.floor(Math.random() * 3) + 5;

	const maxEntry = Math.floor(Math.random() * 5) + 10;

	const planePartition = new Array(sideLength);



	for (let i = 0; i < sideLength; i++)
	{
		planePartition[i] = new Array(sideLength);
	}

	planePartition[0][0] = maxEntry;

	for (let j = 1; j < sideLength; j++)
	{
		planePartition[0][j] = Math.max(
			planePartition[0][j - 1] - Math.floor(Math.random() * 4),
			0
		);
	}

	for (let i = 1; i < sideLength; i++)
	{
		planePartition[i][0] = Math.max(
			planePartition[i - 1][0] - Math.floor(Math.random() * 4),
			0
		);

		for (let j = 1; j < sideLength; j++)
		{
			planePartition[i][j] = Math.max(
				Math.min(
					planePartition[i][j - 1],
					planePartition[i - 1][j]
				) - Math.floor(Math.random() * 4),
				0
			);
		}
	}

	for (let i = 0; i < sideLength; i++)
	{
		planePartition[sideLength - 1][i] = 0;
		planePartition[i][sideLength - 1] = 0;
	}


	return planePartition;
}



// Does not return a string, unlike the previous function.
export function generateRandomTableau()
{
	const sideLength = Math.floor(Math.random() * 3) + 5;

	const tableau = new Array(sideLength);



	for (let i = 0; i < sideLength; i++)
	{
		tableau[i] = new Array(sideLength);

		for (let j = 0; j < sideLength; j++)
		{
			if (Math.random() < .75 / sideLength)
			{
				tableau[i][j] = Math.floor(Math.random() * 3) + 1;
			}

			else
			{
				tableau[i][j] = 0;
			}
		}
	}

	for (let i = 0; i < sideLength; i++)
	{
		tableau[i][sideLength - 1] = 0;
		tableau[sideLength - 1][i] = 0;
	}

	return tableau;
}



// Also doesn't return a string.
export function generateRandomSsyt()
{
	const sideLength = Math.floor(Math.random() * 3) + 2;

	const ssyt = new Array(sideLength);



	for (let i = 0; i < sideLength; i++)
	{
		ssyt[i] = new Array(sideLength);
	}

	ssyt[0][0] = Math.floor(Math.random() * 2);

	for (let j = 1; j < sideLength; j++)
	{
		ssyt[0][j] = ssyt[0][j - 1] + Math.floor(Math.random() * 2);
	}

	for (let i = 1; i < sideLength; i++)
	{
		ssyt[i][0] = ssyt[i - 1][0] + 1 + Math.floor(Math.random() * 2);

		for (let j = 1; j < sideLength; j++)
		{
			ssyt[i][j] = Math.max(
				ssyt[i][j - 1],
				ssyt[i - 1][j] + 1
			) + Math.floor(Math.random() * 2);
		}
	}



	return ssyt;
}