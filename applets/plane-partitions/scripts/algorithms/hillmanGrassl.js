export async function hillmanGrassl(index)
{
	const array = this.arrays[index];

	const planePartition = structuredClone(array.numbers);



	const columnStarts = new Array(planePartition.length);

	for (let i = 0; i < planePartition.length; i++)
	{
		let j = 0;

		while (j < planePartition.length && planePartition[j][i] === Infinity)
		{
			j++;
		}

		columnStarts[i] = j;
	}



	const rowStarts = new Array(planePartition.length);

	for (let i = 0; i < planePartition.length; i++)
	{
		let j = 0;

		while (j < planePartition.length && planePartition[i][j] === Infinity)
		{
			j++;
		}

		rowStarts[i] = j;
	}



	const zigzagPaths = [];

	for (;;)
	{
		// Find the right-most nonzero entry at the top of its column.
		let startingCol = planePartition[0].length - 1;

		while (
			startingCol >= 0
			&& columnStarts[startingCol] < planePartition.length
			&& planePartition[columnStarts[startingCol]][startingCol] === 0
		) {
			startingCol--;
		}

		if (startingCol < 0 || columnStarts[startingCol] === planePartition.length)
		{
			break;
		}



		let currentRow = columnStarts[startingCol];
		let currentCol = startingCol;

		const path = [[currentRow, currentCol, planePartition[currentRow][currentCol] - 1]];

		for (;;)
		{
			if (
				currentRow < planePartition.length - 1
				&& planePartition[currentRow + 1][currentCol]
					=== planePartition[currentRow][currentCol]
			) {
				currentRow++;
			}

			else if (currentCol > 0 && planePartition[currentRow][currentCol - 1] !== Infinity)
			{
				currentCol--;
			}

			else
			{
				break;
			}

			path.push([currentRow, currentCol, planePartition[currentRow][currentCol] - 1]);
		}



		for (let i = 0; i < path.length; i++)
		{
			planePartition[path[i][0]][path[i][1]]--;
		}

		zigzagPaths.push(path);
	}



	const emptyArray = new Array(planePartition.length);

	for (let i = 0; i < planePartition.length; i++)
	{
		emptyArray[i] = new Array(planePartition.length);

		for (let j = 0; j < planePartition.length; j++)
		{
			emptyArray[i][j] = planePartition[i][j] === Infinity ? Infinity : 0;
		}
	}

	const outputArray = await this.addNewArray(index + 1, emptyArray);

	await new Promise(resolve => setTimeout(resolve, this.animationTime));



	// Now we'll animate those paths actually decrementing, one-by-one.
	for (let i = 0; i < zigzagPaths.length; i++)
	{
		const hue = i / zigzagPaths.length * 6 / 7;

		await this.colorCubes(array, zigzagPaths[i], hue);



		// Lift all the cubes up. There's no need to do this if we're in the 2d view.
		await this.raiseCubes(array, zigzagPaths[i], array.height);



		// Now we actually delete the cubes.
		for (let j = 0; j < zigzagPaths[i].length; j++)
		{
			array.numbers[zigzagPaths[i][j][0]][zigzagPaths[i][j][1]]--;

			if (this.in2dView)
			{
				this.drawSingleCell2dViewText(
					array,
					zigzagPaths[i][j][0],
					zigzagPaths[i][j][1]
				);
			}
		}

		this.recalculateHeights(array);



		await new Promise(resolve => setTimeout(resolve, this.animationTime / 5));

		// Find the pivot and rearrange the shape into a hook.
		const pivot = [zigzagPaths[i][zigzagPaths[i].length - 1][0], zigzagPaths[i][0][1]];

		let targetCoordinates = [];

		const targetHeight = outputArray.height + 1;

		// This is the vertical part of the hook.
		for (let j = columnStarts[pivot[1]]; j <= pivot[0]; j++)
		{
			targetCoordinates.push([j, pivot[1], targetHeight]);
		}

		const pivotCoordinates = targetCoordinates[targetCoordinates.length - 1];

		// And this is the horizontal part.
		for (let j = pivot[1] - 1; j >= rowStarts[pivot[0]]; j--)
		{
			targetCoordinates.push([pivot[0], j, targetHeight]);
		}

		await this.moveCubes(array, zigzagPaths[i], outputArray, targetCoordinates);



		// Now delete everything but the pivot and move that down.
		// To make the deletion look nice, we'll put these coordinates
		// in a different order and send two lists total.
		targetCoordinates = [];

		for (let j = pivot[0] - 1; j >= columnStarts[pivot[1]]; j--)
		{
			targetCoordinates.push([j, pivot[1], targetHeight]);
		}

		this.deleteCubes(outputArray, targetCoordinates);

		targetCoordinates = [];

		for (let j = pivot[1] - 1; j >= rowStarts[pivot[0]]; j--)
		{
			targetCoordinates.push([pivot[0], j, targetHeight]);
		}

		this.deleteCubes(outputArray, targetCoordinates);



		await this.lowerCubes(outputArray, [pivotCoordinates]);



		outputArray.numbers[pivotCoordinates[0]][pivotCoordinates[1]]++;

		this.recalculateHeights(outputArray);

		if (this.in2dView)
		{
			this.drawSingleCell2dViewText(
				outputArray,
				pivotCoordinates[0],
				pivotCoordinates[1]
			);
		}

		outputArray.height = Math.max(
			outputArray.height,
			outputArray.numbers[pivotCoordinates[0]][pivotCoordinates[1]]
		);

		outputArray.size = Math.max(outputArray.size, outputArray.height);



		await new Promise(resolve => setTimeout(resolve, this.animationTime));
	}

	this.currentlyAnimatingCamera = false;

	await this.removeArray(index);
}



export async function hillmanGrasslInverse(index)
{
	const array = this.arrays[index];

	const tableau = structuredClone(array.numbers);

	const zigzagPaths = [];



	const columnStarts = new Array(tableau.length);

	for (let i = 0; i < tableau.length; i++)
	{
		let j = 0;

		while (j < tableau.length && tableau[j][i] === Infinity)
		{
			j++;
		}

		columnStarts[i] = j;
	}



	const rowStarts = new Array(tableau.length);

	for (let i = 0; i < tableau.length; i++)
	{
		let j = 0;

		while (j < tableau.length && tableau[i][j] === Infinity)
		{
			j++;
		}

		rowStarts[i] = j;
	}



	const emptyArray = new Array(tableau.length);

	for (let i = 0; i < tableau.length; i++)
	{
		emptyArray[i] = new Array(tableau.length);

		for (let j = 0; j < tableau.length; j++)
		{
			emptyArray[i][j] = tableau[i][j] === Infinity ? Infinity : 0;
		}
	}

	const planePartition = structuredClone(emptyArray);

	const outputArray = await this.addNewArray(index + 1, emptyArray);



	// Loop through the tableau in weirdo lex order and reassemble the paths.
	for (let j = 0; j < tableau.length; j++)
	{
		for (let i = tableau.length - 1; i >= columnStarts[j]; i--)
		{
			while (tableau[i][j] !== 0)
			{
				const path = [];

				let currentRow = i;
				let currentCol = rowStarts[i];

				while (currentRow >= 0)
				{
					// Go up at the last possible place with a matching entry.
					let k = currentCol;

					if (currentRow !== 0)
					{
						while (
							planePartition[currentRow][k] !== planePartition[currentRow - 1][k]
							&& k < j
						) {
							k++;
						}
					}

					else
					{
						k = j;
					}

					// Add all of these boxes.
					for (let l = currentCol; l <= k; l++)
					{
						path.push([currentRow, l, planePartition[currentRow][l]]);
					}

					if (currentRow - 1 >= columnStarts[k])
					{
						currentRow--;
						currentCol = k;
					}

					else
					{
						break;
					}
				}



				for (let k = 0; k < path.length; k++)
				{
					planePartition[path[k][0]][path[k][1]]++;
				}

				zigzagPaths.push([path, [i, j, tableau[i][j] - 1]]);

				tableau[i][j]--;
			}
		}
	}



	await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));



	// Now we'll animate those paths actually incrementing, one-by-one.
	for (let i = 0; i < zigzagPaths.length; i++)
	{
		const hue = i / zigzagPaths.length * 6 / 7;

		await this.colorCubes(array, [zigzagPaths[i][1]], hue);



		const row = zigzagPaths[i][1][0];
		const col = zigzagPaths[i][1][1];
		const height = array.size;

		// Add a bunch of cubes corresponding to the hook that this thing is a part of.
		for (let j = columnStarts[col]; j < row; j++)
		{
			array.cubes[j][col][height] = this.addCube(array, col, height, j);

			array.cubes[j][col][height].material
				.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
		}

		for (let j = rowStarts[row]; j < col; j++)
		{
			array.cubes[row][j][height] = this.addCube(array, j, height, row);

			array.cubes[row][j][height].material
				.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
		}



		await this.raiseCubes(array, [zigzagPaths[i][1]], height);



		let coordinates = [];

		for (let j = row - 1; j >= columnStarts[col]; j--)
		{
			coordinates.push([j, col, height]);
		}

		const promise1 = this.revealCubes(array, coordinates);

		coordinates = [];

		for (let j = col - 1; j >= rowStarts[row]; j--)
		{
			coordinates.push([row, j, height]);
		}

		const promise2 = this.revealCubes(array, coordinates);

		await Promise.all([promise1, promise2]);



		// The coordinates now need to be in a different order to match the zigzag path.
		coordinates = [];

		for (let j = rowStarts[row]; j < col; j++)
		{
			coordinates.push([row, j, height]);
		}

		coordinates.push([row, col, array.numbers[row][col] - 1]);

		for (let j = row - 1; j >= columnStarts[col]; j--)
		{
			coordinates.push([j, col, height]);
		}

		const targetCoordinates = zigzagPaths[i][0];

		const targetHeight = outputArray.height + 1;

		targetCoordinates.forEach(entry => entry[2] = targetHeight);

		array.numbers[row][col]--;

		this.recalculateHeights(array);

		if (this.in2dView)
		{
			this.drawSingleCell2dViewText(array, row, col);
		}

		await this.moveCubes(array, coordinates, outputArray, targetCoordinates);



		await this.lowerCubes(outputArray, targetCoordinates);

		targetCoordinates.forEach((entry) =>
		{
			outputArray.numbers[entry[0]][entry[1]]++;
		});

		this.recalculateHeights(outputArray);

		if (this.in2dView)
		{
			targetCoordinates.forEach(entry => this.drawSingleCell2dViewText(
				outputArray,
				entry[0],
				entry[1]
			));
		}



		await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
	}

	this.currentlyAnimatingCamera = false;

	await this.removeArray(index);
}