export async function rsk(index)
{
	const pArray = this.arrays[index];
	const qArray = this.arrays[index + 1];

	const pSsyt = pArray.numbers;
	const qSsyt = qArray.numbers;

	let arraySize = 0;

	let numHues = 0;

	// Remove any color that's here.
	for (let i = 0; i < pSsyt.length; i++)
	{
		for (let j = 0; j < pSsyt.length; j++)
		{
			if (pSsyt[i][j] === Infinity || qSsyt[i][j] === Infinity)
			{
				this.displayError(
					"The SSYT contain infinite values, which is not allowed in RSK!"
				);

				this.currentlyRunningAlgorithm = false;

				return;
			}

			if (pSsyt[i][j] !== 0)
			{
				numHues++;
			}

			arraySize = Math.max(Math.max(arraySize, pSsyt[i][j]), qSsyt[i][j]);
		}
	}

	if (arraySize === 0)
	{
		this.displayError("The SSYT are empty!");

		this.currentlyRunningAlgorithm = false;

		return;
	}



	const emptyArray = new Array(arraySize);

	for (let i = 0; i < arraySize; i++)
	{
		emptyArray[i] = new Array(arraySize);

		for (let j = 0; j < arraySize; j++)
		{
			emptyArray[i][j] = 0;
		}
	}

	const outputArray = await this.addNewArray(index + 2, emptyArray);



	let hueIndex = 0;

	while (qSsyt[0][0] !== 0)
	{
		const hue = hueIndex / numHues * 6 / 7;

		let maxEntry = 0;
		let row = 0;
		let col = 0;

		for (let i = 0; i < qSsyt.length; i++)
		{
			let j = qSsyt.length - 1;

			while (j >= 0 && qSsyt[i][j] === 0)
			{
				j--;
			}

			if (j >= 0)
			{
				maxEntry = Math.max(maxEntry, qSsyt[i][j]);
			}
		}

		for (let i = 0; i < qSsyt.length; i++)
		{
			let j = qSsyt.length - 1;

			while (j >= 0 && qSsyt[i][j] === 0)
			{
				j--;
			}

			if (qSsyt[i][j] === maxEntry)
			{
				row = i;
				col = j;
				break;
			}
		}



		// Now row and col are the coordinates of the most recently added element.
		// We just need to un-insert the corresponding element from P.
		const pSourceCoordinatesLocal = [];
		const pTargetCoordinatesLocal = [];
		const pSourceCoordinatesExternal = [];
		const pTargetCoordinatesExternal = [];

		const qSourceCoordinatesExternal = [];
		const qTargetCoordinatesExternal = [];

		let i = row;
		let j = col;
		let pEntry = pSsyt[i][j];
		const qEntry = qSsyt[i][j];

		const pCoordinatePath = [[i, j]];



		while (i !== 0)
		{
			// Find the rightmost element in the row above that's strictly smaller than this.
			let newJ = pSsyt.length - 1;

			while (pSsyt[i - 1][newJ] === 0 || pEntry <= pSsyt[i - 1][newJ])
			{
				newJ--;
			}

			for (let k = 0; k < pEntry; k++)
			{
				pSourceCoordinatesLocal.push([i, j, k]);
				pTargetCoordinatesLocal.push([i - 1, newJ, k]);
			}

			i--;
			j = newJ;
			pEntry = pSsyt[i][j];

			pCoordinatePath.push([i, j]);
		}



		// Alright, time for a stupid hack. The visual result we want
		// is to take the stacks getting popped from both P and Q,
		// move them to the first row and column of the output array
		// to form a hook, delete all but one box (the top box of P),
		// and then lower the other. The issue is that this will risk
		// overwriting one of the two overlapping boxes, causing a memory leak
		// and a glitchy state. The solution is to do a couple things.
		// Only the P corner box will actually move to the output array --
		// the one from Q will appear to, but it will stay in its own array.

		const height = outputArray.height + 1;

		for (let k = 0; k < pEntry; k++)
		{
			pSourceCoordinatesExternal.push([i, j, k]);
			pTargetCoordinatesExternal.push([qEntry - 1, k, height]);
		}

		for (let k = 0; k < qEntry - 1; k++)
		{
			qSourceCoordinatesExternal.push([row, col, k]);
			qTargetCoordinatesExternal.push([k, pEntry - 1, height]);
		}



		this.colorCubes(
			qArray,
			qSourceCoordinatesExternal.concat([[row, col, qEntry - 1]]),
			hue
		);

		this.colorCubes(pArray, pSourceCoordinatesLocal, hue);
		await this.colorCubes(pArray, pSourceCoordinatesExternal, hue);



		// Update all the numbers.
		qSsyt[row][col] = 0;

		for (let k = pCoordinatePath.length - 1; k > 0; k--)
		{
			pSsyt[pCoordinatePath[k][0]][pCoordinatePath[k][1]]
				= pSsyt[pCoordinatePath[k - 1][0]][pCoordinatePath[k - 1][1]];
		}

		pSsyt[row][col] = 0;

		if (this.in2dView)
		{
			this.drawSingleCell2dViewText(pArray, row, col);

			for (let k = pCoordinatePath.length - 1; k > 0; k--)
			{
				this.drawSingleCell2dViewText(
					pArray,
					pCoordinatePath[k][0],
					pCoordinatePath[k][1]
				);
			}

			this.drawSingleCell2dViewText(qArray, row, col);
		}


		await Promise.all([
			this.moveCubes(
				qArray,
				qSourceCoordinatesExternal,
				outputArray,
				qTargetCoordinatesExternal
			),

			this.moveCubes(
				pArray,
				pSourceCoordinatesExternal,
				outputArray,
				pTargetCoordinatesExternal
			),

			this.moveCubes(
				pArray,
				pSourceCoordinatesLocal,
				pArray,
				pTargetCoordinatesLocal
			),

			this.moveCubes(
				qArray,
				[[row, col, qEntry - 1]],
				outputArray,
				[[qEntry - 1, pEntry - 1, height]],
				false
			)
		]);



		this.uncolorCubes(pArray, pTargetCoordinatesLocal);



		// Delete the non-corner parts of the hook (animated),
		// delete one of the overlapping corner cubes (instantly), and drop the other.

		// Gross but necessary. deleteCubes() needs to detach the object
		// from its parent cube group, but what we pass isn't actually its parent,
		// so we have to do it manually.
		outputArray.cubeGroup.remove(qArray.cubes[row][col][qEntry - 1]);
		this.deleteCubes(qArray, [[row, col, qEntry - 1]], true, true);

		pTargetCoordinatesExternal.reverse();
		qTargetCoordinatesExternal.reverse();

		this.deleteCubes(outputArray, pTargetCoordinatesExternal.slice(1));
		this.deleteCubes(outputArray, qTargetCoordinatesExternal);

		await this.lowerCubes(outputArray, [[qEntry - 1, pEntry - 1, height]]);

		emptyArray[qEntry - 1][pEntry - 1]++;

		if (this.in2dView)
		{
			this.drawSingleCell2dViewText(outputArray, qEntry - 1, pEntry - 1);
		}

		this.recalculateHeights(outputArray);



		hueIndex++;

		await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
	}



	await this.removeArray(index);

	await new Promise(resolve => setTimeout(resolve, this.animationTime));

	await this.removeArray(index);
}



export async function rskInverse(index)
{
	const array = this.arrays[index];

	const tableau = structuredClone(array.numbers);

	let numEntries = 0;

	tableau.forEach(row => row.forEach(entry => numEntries += entry));

	// The largest possible shape for these two is a straight line,
	// requiring all the inserted elements to be increasing or decreasing.
	let pSsyt = new Array(numEntries);
	let qSsyt = new Array(numEntries);

	for (let i = 0; i < numEntries; i++)
	{
		pSsyt[i] = new Array(numEntries);
		qSsyt[i] = new Array(numEntries);

		for (let j = 0; j < numEntries; j++)
		{
			pSsyt[i][j] = 0;
			qSsyt[i][j] = 0;
		}
	}



	const pRowLengths = new Array(tableau.length);

	for (let i = 0; i < tableau.length; i++)
	{
		pRowLengths[i] = 0;
	}

	let pNumRows = 0;



	// Unfortunately, there's no way to know the shape of P and Q
	// without actually doing RSK, so we need to do all the calculations
	// ahead of time, and only then animate things around.
	const pInsertionPaths = [];
	const qInsertionLocations = [];
	const tableauRemovalLocations = [];

	for (let row = 0; row < tableau.length; row++)
	{
		for (let col = 0; col < tableau.length; col++)
		{
			while (tableau[row][col] !== 0)
			{
				tableau[row][col]--;

				let newNum = col + 1;

				let i = 0;
				let j = 0;

				const path = [];

				for (;;)
				{
					j = pRowLengths[i];

					while (j !== 0 && pSsyt[i][j - 1] > newNum)
					{
						j--;
					}

					if (j === pRowLengths[i])
					{
						pSsyt[i][j] = newNum;

						pRowLengths[i]++;

						if (j === 0)
						{
							pNumRows++;
						}

						path.push([i, j]);

						break;
					}

					const temp = pSsyt[i][j];
					pSsyt[i][j] = newNum;
					newNum = temp;
					path.push([i, j]);

					i++;
				}

				pInsertionPaths.push(path);
				qInsertionLocations.push([i, j]);
				tableauRemovalLocations.push([row, col]);

				qSsyt[i][j] = row + 1;
			}
		}
	}



	const ssytSize = Math.max(pRowLengths[0], pNumRows);

	pSsyt = new Array(ssytSize);
	qSsyt = new Array(ssytSize);

	for (let i = 0; i < ssytSize; i++)
	{
		pSsyt[i] = new Array(ssytSize);
		qSsyt[i] = new Array(ssytSize);

		for (let j = 0; j < ssytSize; j++)
		{
			pSsyt[i][j] = 0;
			qSsyt[i][j] = 0;
		}
	}

	const pArray = await this.addNewArray(index + 1, pSsyt);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));

	const qArray = await this.addNewArray(index + 2, qSsyt);

	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));



	let hueIndex = 0;

	// Loop through the tableau in weirdo lex order and reassemble the paths.
	for (let i = 0; i < tableauRemovalLocations.length; i++)
	{
		const row = tableauRemovalLocations[i][0];
		const col = tableauRemovalLocations[i][1];

		const height = array.height + 1;

		const hue = hueIndex / numEntries * 6 / 7;



		// Add a bunch of cubes corresponding to the hook that this thing is a part of.
		for (let j = col; j >= 0; j--)
		{
			array.cubes[row][j][height] = this.addCube(array, j, height, row);

			array.cubes[row][j][height].material
				.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
		}

		for (let j = row - 1; j >= 0; j--)
		{
			array.cubes[j][col][height] = this.addCube(array, col, height, j);
			
			array.cubes[j][col][height].material
				.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
		}

		// This is the duplicate cube. As usual, we need to store it
		// somewhere else in the array -- here, we're going to place it
		// one space vertically above its actual location.

		array.cubes[row][col][height + 1] = this.addCube(array, col, height, row);

		array.cubes[row][col][height + 1].material
			.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));



		await this.colorCubes(array, [[row, col, array.numbers[row][col] - 1]], hue);

		await this.raiseCubes(array, [[row, col, array.numbers[row][col] - 1]], height);



		const promise1 = this.revealCubes(array, [[row, col, height + 1]]);

		let coordinates = [];

		for (let j = col - 1; j >= 0; j--)
		{
			coordinates.push([row, j, height]);
		}

		const promise2 = this.revealCubes(array, coordinates);

		coordinates = [];

		for (let j = row - 1; j >= 0; j--)
		{
			coordinates.push([j, col, height]);
		}

		const promise3 = this.revealCubes(array, coordinates);

		await Promise.all([promise1, promise2, promise3]);



		// First of all, we'll handle the insertion into P.
		// As always, this takes some care. The strictly proper way
		// to animate this would be to move the stacks one at a time,
		// but just like with the forward direction, it is *much* easier
		// (and time-efficient) to just move everything at once.
		const path = pInsertionPaths[hueIndex];

		const pSourceCoordinatesLocal = [];
		const pTargetCoordinatesLocal = [];

		const pSourceCoordinatesExternal = [[row, col, array.numbers[row][col] - 1]];
		const pTargetCoordinatesExternal = [[path[0][0], path[0][1], col]];

		const qSourceCoordinatesExternal = [[row, col, height + 1]];
		const qTargetCoordinatesExternal = [[
			qInsertionLocations[hueIndex][0],
			qInsertionLocations[hueIndex][1],
			row
		]];



		for (let j = col - 1; j >= 0; j--)
		{
			pSourceCoordinatesExternal.push([row, j, height]);
			pTargetCoordinatesExternal.push([path[0][0], path[0][1], j]);
		}

		for (let j = 0; j < path.length - 1; j++)
		{
			for (let k = 0; k < pSsyt[path[j][0]][path[j][1]]; k++)
			{
				pSourceCoordinatesLocal.push([path[j][0], path[j][1], k]);
				pTargetCoordinatesLocal.push([path[j + 1][0], path[j + 1][1], k]);
			}
		}

		for (let j = row - 1; j >= 0; j--)
		{
			qSourceCoordinatesExternal.push([j, col, height]);

			qTargetCoordinatesExternal.push([
				qInsertionLocations[hueIndex][0],
				qInsertionLocations[hueIndex][1],
				j
			]);
		}

		await this.colorCubes(pArray, pSourceCoordinatesLocal, hue);



		for (let j = path.length - 1; j > 0; j--)
		{
			pSsyt[path[j][0]][path[j][1]] = pSsyt[path[j - 1][0]][path[j - 1][1]];
		}

		if (path.length !== 0)
		{
			pSsyt[path[0][0]][path[0][1]] = 0;
		}

		if (this.in2dView)
		{
			this.drawAll2dViewText();
		}

		if (pSourceCoordinatesLocal.length !== 0)
		{
			await this.moveCubes(
				pArray,
				pSourceCoordinatesLocal,
				pArray,
				pTargetCoordinatesLocal
			);
		}



		array.numbers[row][col]--;

		if (this.in2dView)
		{
			this.drawAll2dViewText();
		}

		await Promise.all([
			this.moveCubes(
				array,
				pSourceCoordinatesExternal,
				pArray,
				pTargetCoordinatesExternal)
			,

			this.moveCubes(
				array,
				qSourceCoordinatesExternal,
				qArray,
				qTargetCoordinatesExternal
			)
		]);



		pSsyt[path[0][0]][path[0][1]] = col + 1;

		qSsyt[qInsertionLocations[hueIndex][0]][qInsertionLocations[hueIndex][1]] = row + 1;

		if (this.in2dView)
		{
			this.drawAll2dViewText();
		}



		this.recalculateHeights(array);
		this.recalculateHeights(pArray);
		this.recalculateHeights(qArray);



		hueIndex++;

		await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
	}

	await this.removeArray(index);
}