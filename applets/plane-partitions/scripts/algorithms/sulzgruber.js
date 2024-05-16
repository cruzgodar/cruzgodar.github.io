export async function sulzgruber(index)
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



	// First, find the candidates. This first requires categorizing the diagonals.
	const diagonals = {};

	const diagonalStarts = {};



	// First the ones along the left edge.
	for (let i = 0; i < planePartition.length; i++)
	{
		diagonalStarts[-i] = [i, 0];
	}

	// Now the ones along the top edge.
	for (let i = 1; i < planePartition.length; i++)
	{
		diagonalStarts[i] = [0, i];
	}



	// First the ones along the left edge.
	for (let i = -planePartition.length + 1; i < planePartition.length; i++)
	{
		let row = diagonalStarts[i][0];
		let col = diagonalStarts[i][1];

		while (
			row < planePartition.length
			&& col < planePartition.length
			&& planePartition[row][col] === Infinity
		) {
			row++;
			col++;
		}

		diagonalStarts[i] = [row, col];

		if (row === planePartition.length || col === planePartition.length)
		{
			diagonals[i] = -1;
			continue;
		}



		const boundaryLeft = col === 0 || planePartition[row][col - 1] === Infinity;
		const boundaryUp = row === 0 || planePartition[row - 1][col] === Infinity;

		if (boundaryLeft && boundaryUp)
		{
			diagonals[i] = 0;
		}

		else if (boundaryLeft)
		{
			diagonals[i] = 3;
		}

		else if (boundaryUp)
		{
			diagonals[i] = 2;
		}

		else
		{
			diagonals[i] = 1;
		}
	}



	// Now we need to move through the candidates.
	// They only occur in A and O regions, so we only scan those diagonals,
	// top-left to bottom-right, and then bottom-left to top-right in terms of diagonals.
	const qPaths = [];

	for (let i = -planePartition.length + 1; i < planePartition.length; i++)
	{
		if (diagonals[i] === 1 || diagonals[i] === 3)
		{
			continue;
		}

		let startRow = diagonalStarts[i][0];
		let startCol = diagonalStarts[i][1];

		if (planePartition[startRow][startCol] === 0)
		{
			continue;
		}



		for (;;)
		{
			let foundCandidate = false;

			while (
				startRow < planePartition.length
				&& startCol < planePartition.length
				&& planePartition[startRow][startCol] !== 0
			) {
				if (
					(
						startCol < planePartition.length - 1
						&& planePartition[startRow][startCol] >
							planePartition[startRow][startCol + 1]
					) || (
						startCol === planePartition.length - 1
						&& planePartition[startRow][startCol] > 0
					)
				) {
					if (
						diagonals[i] === 0
						|| (
							diagonals[i] === 2
							&& (
								(
									startRow < planePartition.length - 1
									&& planePartition[startRow][startCol] >
										planePartition[startRow + 1][startCol]
								) || (
									startRow === planePartition.length - 1
									&& planePartition[startRow][startCol] > 0
								)
							)
						)
					) {
						foundCandidate = true;
						break;
					}
				}

				startRow++;
				startCol++;
			}

			if (!foundCandidate)
			{
				break;
			}



			let row = startRow;
			let col = startCol;

			const path = [[row, col, planePartition[row][col] - 1]];

			for (;;)
			{
				const currentContent = col - row;

				if (
					row < planePartition.length - 1
					&& planePartition[row][col] === planePartition[row + 1][col]
					&& (diagonals[currentContent] === 0 || diagonals[currentContent] === 3)
				) {
					row++;
				}

				else if (
					col > rowStarts[row]
					&& (
						row === planePartition.length - 1
						|| (
							row < planePartition.length - 1
							&& planePartition[row][col] > planePartition[row + 1][col]
						)
					)
				) {
					col--;
				}

				else
				{
					break;
				}

				path.push([row, col, planePartition[row][col] - 1]);
			}

			path.forEach(box => planePartition[box[0]][box[1]]--);

			qPaths.push(path);
		}
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



	// Now we'll animate those paths actually decrementing,
	// one-by-one. We're using a for loop because we need to await.
	for (let i = 0; i < qPaths.length; i++)
	{
		const hue = i / qPaths.length * 6 / 7;

		await this.colorCubes(array, qPaths[i], hue);



		// Lift all the cubes up. There's no need to do this if we're in the 2d view.
		await this.raiseCubes(array, qPaths[i], array.height + 1);



		// Now we actually delete the cubes.
		qPaths[i].forEach(box =>
		{
			array.numbers[box[0]][box[1]]--;

			if (this.in2dView)
			{
				this.drawSingleCell2dViewText(array, box[0], box[1]);
			}
		});

		this.recalculateHeights(array);



		await new Promise(resolve => setTimeout(resolve, this.animationTime / 5));

		// Find the pivot and rearrange the shape into a hook.
		// The end of the Q-path is the same as the end of the rim-hook,
		// so it defines the row. To find the column, we need to go row boxes down,
		// and then use the rest of the length to go right.
		const row = qPaths[i][qPaths[i].length - 1][0];

		const startContent = qPaths[i][qPaths[i].length - 1][1] - row;

		// Every step along the rim-hook increases the content by one.
		const endContent = startContent + qPaths[i].length - 1;

		const col = diagonalStarts[endContent][1];



		let targetCoordinates = [];

		const targetHeight = Math.max(array.height + 1, outputArray.height + 1);

		for (let j = columnStarts[col]; j <= row; j++)
		{
			targetCoordinates.push([j, col, targetHeight]);
		}

		for (let j = col - 1; j >= rowStarts[row]; j--)
		{
			targetCoordinates.push([row, j, targetHeight]);
		}

		await this.moveCubes(array, qPaths[i], outputArray, targetCoordinates);



		// Now delete everything but the pivot and move that down.
		// To make the deletion look nice, we'll put these coordinates
		// in a different order and send two lists total.
		targetCoordinates = [];

		for (let j = row - 1; j >= columnStarts[col]; j--)
		{
			targetCoordinates.push([j, col, targetHeight]);
		}

		this.deleteCubes(outputArray, targetCoordinates);

		targetCoordinates = [];

		for (let j = col - 1; j >= rowStarts[row]; j--)
		{
			targetCoordinates.push([row, j, targetHeight]);
		}

		this.deleteCubes(outputArray, targetCoordinates);



		await this.lowerCubes(outputArray, [[row, col, targetHeight]]);



		outputArray.numbers[row][col]++;

		if (this.in2dView)
		{
			this.drawSingleCell2dViewText(outputArray, row, col);
		}

		this.recalculateHeights(outputArray);



		await new Promise(resolve => setTimeout(resolve, this.animationTime));
	}



	await this.removeArray(index);
}



export async function sulzgruberInverse(index)
{
	const array = this.arrays[index];

	const tableau = array.numbers;



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



	// First, find the candidates. This first requires categorizing the diagonals.
	const diagonalStarts = {};

	// First the ones along the left edge.
	for (let i = 0; i < tableau.length; i++)
	{
		diagonalStarts[-i] = [i, 0];
	}

	// Now the ones along the top edge.
	for (let i = 1; i < tableau.length; i++)
	{
		diagonalStarts[i] = [0, i];
	}

	for (let i = -tableau.length + 1; i < tableau.length; i++)
	{
		let row = diagonalStarts[i][0];
		let col = diagonalStarts[i][1];

		while (row < tableau.length && col < tableau.length && tableau[row][col] === Infinity)
		{
			row++;
			col++;
		}

		diagonalStarts[i] = [row, col];
	}



	let numHues = 0;

	const emptyArray = new Array(tableau.length);

	for (let i = 0; i < tableau.length; i++)
	{
		emptyArray[i] = new Array(tableau.length);

		for (let j = 0; j < tableau.length; j++)
		{
			if (tableau[i][j] === Infinity)
			{
				emptyArray[i][j] = Infinity;
			}

			else
			{
				emptyArray[i][j] = 0;

				numHues += tableau[i][j];
			}
		}
	}

	const outputArray = await this.addNewArray(index + 1, emptyArray);



	let currentHueIndex = 0;

	// Loop through the tableau in weirdo lex order and reassemble the paths.
	for (let j = tableau.length - 1; j >= 0; j--)
	{
		for (let i = tableau.length - 1; i >= 0; i--)
		{
			if (tableau[i][j] === Infinity)
			{
				continue;
			}



			while (tableau[i][j] !== 0)
			{
				const hue = currentHueIndex / numHues * 6 / 7;

				const height = Math.max(array.size + 1, outputArray.size + 1);

				await this.colorCubes(array, [[i, j, tableau[i][j] - 1]], hue);

				await this.raiseCubes(array, [[i, j, tableau[i][j] - 1]], height);



				const row = i;
				const col = j;

				// Add a bunch of cubes corresponding to the hook that this thing is a part of.
				for (let k = columnStarts[col]; k < row; k++)
				{
					array.cubes[k][col][height] = this.addCube(array, col, height, k);

					array.cubes[k][col][height].material
						.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				}

				for (let k = rowStarts[row]; k < col; k++)
				{
					array.cubes[row][k][height] = this.addCube(array, k, height, row);

					array.cubes[row][k][height].material
						.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				}



				let coordinates = [];

				for (let k = row - 1; k >= columnStarts[col]; k--)
				{
					coordinates.push([k, col, height]);
				}

				const promise1 = this.revealCubes(array, coordinates);

				coordinates = [];

				for (let k = col - 1; k >= rowStarts[row]; k--)
				{
					coordinates.push([row, k, height]);
				}

				const promise2 = this.revealCubes(array, coordinates);

				await Promise.all([promise1, promise2]);



				// In order to animate this nicely, we won't just jump straight to the Q-path --
				// we'll turn it into a rim-hook first.
				coordinates = [];

				for (let k = rowStarts[row]; k < col; k++)
				{
					coordinates.push([row, k, height]);
				}

				coordinates.push([row, col, array.numbers[row][col] - 1]);

				for (let k = row - 1; k >= columnStarts[col]; k--)
				{
					coordinates.push([k, col, height]);
				}



				const startContent = rowStarts[row] - row;
				const endContent = startContent + coordinates.length - 1;

				const targetCoordinates = [];

				for (let k = startContent; k <= endContent; k++)
				{
					targetCoordinates.push(structuredClone(diagonalStarts[k]));
				}



				tableau[row][col]--;

				this.recalculateHeights(array);

				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(array, row, col);
				}

				await this.moveCubes(array, coordinates, outputArray, targetCoordinates);



				// Now we'll lower one part at a time.
				let currentIndex = 0;

				let currentHeight =
					outputArray.numbers[targetCoordinates[0][0]][targetCoordinates[0][1]];

				for (;;)
				{
					let nextIndex = currentIndex;

					while (
						nextIndex < targetCoordinates.length
						&& targetCoordinates[nextIndex][0]
							=== targetCoordinates[currentIndex][0]
					) {
						nextIndex++;
					}

					coordinates = targetCoordinates.slice(currentIndex, nextIndex);



					// Check if this part can all be inserted at the same height.
					let insertionWorks = true;

					for (let k = 0; k < coordinates.length; k++)
					{
						if (
							outputArray.numbers[coordinates[k][0]][coordinates[k][1]]
								!== currentHeight
						) {
							insertionWorks = false;
							break;
						}
					}



					if (insertionWorks)
					{
						await this.lowerCubes(outputArray, coordinates);

						coordinates.forEach(coordinate =>
						{
							outputArray.numbers[coordinate[0]][coordinate[1]]++;
						});

						this.recalculateHeights(outputArray);

						if (this.in2dView)
						{
							coordinates.forEach(entry =>
							{
								this.drawSingleCell2dViewText(outputArray, entry[0], entry[1]);
							});
						}

						currentIndex = nextIndex;
					}

					else
					{
						const oldTargetCoordinates =
							structuredClone(targetCoordinates.slice(currentIndex));

						// Shift the rest of the coordinates down and right by 1.
						for (let k = currentIndex; k < targetCoordinates.length; k++)
						{
							targetCoordinates[k][0]++;
							targetCoordinates[k][1]++;

							if (
								targetCoordinates[k][0] > outputArray.footprint
								|| targetCoordinates[k][1] > outputArray.footprint
							) {
								console.error("Insertion failed!");
								return;
							}
						}

						const newTargetCoordinates = targetCoordinates.slice(currentIndex);

						await this.moveCubes(
							outputArray,
							oldTargetCoordinates,
							outputArray,
							newTargetCoordinates
						);

						currentHeight =
							outputArray.numbers[
								targetCoordinates[currentIndex][0]
							][
								targetCoordinates[currentIndex][1]
							];
					}



					if (currentIndex === targetCoordinates.length)
					{
						break;
					}
				}



				currentHueIndex++;

				await new Promise(resolve => setTimeout(resolve, this.animationTime / 2));
			}
		}
	}



	await this.removeArray(index);
}