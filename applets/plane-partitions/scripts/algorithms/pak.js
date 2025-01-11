export async function pak(index)
{
	const array = this.arrays[index];

	const planePartition = array.numbers;

	if (!this.in2dView)
	{
		await this.show2dView();
	}



	let rightLegSize = 0;
	let bottomLegSize = 0;

	while (
		rightLegSize < array.footprint
		&& array.numbers[rightLegSize][array.footprint - 1] !== 0
	) {
		rightLegSize++;
	}

	while (
		bottomLegSize < array.footprint
		&& array.numbers[array.footprint - 1][bottomLegSize] !== 0
	) {
		bottomLegSize++;
	}

	// Todo: remove eventually
	rightLegSize = 0;
	bottomLegSize = 0;

	let numCorners = 0;

	for (let row = array.footprint - 1 - bottomLegSize; row >= 0; row--)
	{
		for (let col = array.footprint - 1 - rightLegSize; col >= 0; col--)
		{
			if (planePartition[row][col] !== Infinity)
			{
				numCorners++;
			}
		}
	}



	let hueIndex = 0;

	// Get outer corners by just scanning through the array forwards.
	for (let row = 0; row < array.footprint - bottomLegSize; row++)
	{
		for (let col = 0; col < array.footprint - rightLegSize; col++)
		{
			if (planePartition[row][col] === Infinity)
			{
				continue;
			}

			// Highlight this diagonal.
			const diagonalCoordinates = [];

			let i = 0;

			while (row + i < array.footprint && col + i < array.footprint)
			{
				diagonalCoordinates.push([
					row + i,
					col + i,
					planePartition[row + i][col + i] - 1
				]);

				i++;
			}



			i = diagonalCoordinates[0][0];
			let j = diagonalCoordinates[0][1];

			let coordinatesToColor = [];

			for (let k = planePartition[i][j] - 2; k >= 0; k--)
			{
				coordinatesToColor.push([i, j, k]);
			}

			this.colorCubes(array, coordinatesToColor, hueIndex / numCorners * 6 / 7);



			coordinatesToColor = [];

			diagonalCoordinates.forEach(coordinate =>
			{
				if (coordinate[2] >= 0)
				{
					coordinatesToColor.push(coordinate);
				}
			});

			await this.colorCubes(array, coordinatesToColor, hueIndex / numCorners * 6 / 7);



			// For each coordinate in the diagonal, we need to find the toggled value.
			// The first and last will always be a little different,
			// since they don't have as many neighbors.
			const newDiagonalHeight = new Array(diagonalCoordinates.length);

			diagonalCoordinates.forEach((coordinate, index) =>
			{
				const i = coordinate[0];
				const j = coordinate[1];

				let neighbor1 = 0;
				let neighbor2 = 0;

				if (i < array.footprint - 1)
				{
					neighbor1 = planePartition[i + 1][j];
				}

				if (j < array.footprint - 1)
				{
					neighbor2 = planePartition[i][j + 1];
				}

				newDiagonalHeight[index] = Math.max(neighbor1, neighbor2);



				if (index > 0)
				{
					neighbor1 = planePartition[i - 1][j];
					neighbor2 = planePartition[i][j - 1];

					newDiagonalHeight[index] +=
						Math.min(neighbor1, neighbor2) - planePartition[i][j];
				}

				else
				{
					newDiagonalHeight[index] = planePartition[i][j] - newDiagonalHeight[index];
				}
			});



			// This is async, so we can't use forEach easily.
			for (let index = 0; index < diagonalCoordinates.length; index++)
			{
				i = diagonalCoordinates[index][0];
				j = diagonalCoordinates[index][1];

				if (newDiagonalHeight[index] > planePartition[i][j])
				{
					const coordinatesToReveal = [];

					for (let k = planePartition[i][j]; k < newDiagonalHeight[index]; k++)
					{
						array.cubes[i][j][k] = this.addCube(array, j, k, i);

						coordinatesToReveal.push([i, j, k]);
					}

					if (this.in2dView)
					{
						this.revealCubes(array, coordinatesToReveal);
					}

					else
					{
						await this.revealCubes(array, coordinatesToReveal);
					}
				}



				else if (newDiagonalHeight[index] < planePartition[i][j])
				{
					const coordinatesToDelete = [];

					for (let k = planePartition[i][j] - 1; k >= newDiagonalHeight[index]; k--)
					{
						coordinatesToDelete.push([i, j, k]);
					}

					if (this.in2dView)
					{
						this.deleteCubes(array, coordinatesToDelete);
					}

					else
					{
						await this.deleteCubes(array, coordinatesToDelete);
					}
				}



				planePartition[i][j] = newDiagonalHeight[index];

				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(array, i, j);
				}
			}



			const coordinatesToUncolor = [];

			coordinatesToColor.forEach((coordinate, index) =>
			{
				if (index !== 0 && coordinate[2] < planePartition[coordinate[0]][coordinate[1]])
				{
					coordinatesToUncolor.push(coordinate);
				}
			});

			if (this.in2dView)
			{
				this.uncolorCubes(array, coordinatesToUncolor);
			}

			else
			{
				await this.uncolorCubes(array, coordinatesToUncolor);
			}



			hueIndex++;

			this.recalculateHeights(array);

			if (coordinatesToColor.length !== 0)
			{
				await new Promise(resolve => setTimeout(resolve, this.animationTime));
			}
		}
	}



	this.updateCameraHeight(true);
}



export async function pakInverse(index, rightLegSize = 0, bottomLegSize = 0)
{
	const array = this.arrays[index];

	const tableau = array.numbers;



	if (!this.in2dView)
	{
		await this.show2dView();
	}



	let numCorners = 0;

	for (let row = array.footprint - 1 - bottomLegSize; row >= 0; row--)
	{
		for (let col = array.footprint - 1 - rightLegSize; col >= 0; col--)
		{
			if (tableau[row][col] !== Infinity)
			{
				numCorners++;
			}
		}
	}



	let hueIndex = 0;

	// Get outer corners by just scanning through the array backwards.
	for (let row = array.footprint - 1 - bottomLegSize; row >= 0; row--)
	{
		for (let col = array.footprint - 1 - rightLegSize; col >= 0; col--)
		{
			if (tableau[row][col] === Infinity)
			{
				continue;
			}



			// Highlight this diagonal.
			const diagonalCoordinates = [];

			let i = 0;

			while (row + i < array.footprint && col + i < array.footprint)
			{
				diagonalCoordinates.push([row + i, col + i, tableau[row + i][col + i] - 1]);

				i++;
			}



			i = diagonalCoordinates[0][0];
			let j = diagonalCoordinates[0][1];



			// For each coordinate in the diagonal, we need to find the toggled value.
			// The first and last will always be a little different,
			// since they don't have as many neighbors.
			const newDiagonalHeight = new Array(diagonalCoordinates.length);

			let anyChange = false;

			diagonalCoordinates.forEach((coordinate, index) =>
			{
				const i = coordinate[0];
				const j = coordinate[1];

				let neighbor1 = 0;
				let neighbor2 = 0;

				if (i < array.footprint - 1)
				{
					neighbor1 = tableau[i + 1][j];
				}

				if (j < array.footprint - 1)
				{
					neighbor2 = tableau[i][j + 1];
				}

				newDiagonalHeight[index] = Math.max(neighbor1, neighbor2);



				if (index > 0)
				{
					neighbor1 = tableau[i - 1][j];
					neighbor2 = tableau[i][j - 1];

					newDiagonalHeight[index] += Math.min(neighbor1, neighbor2) - tableau[i][j];
				}

				else
				{
					newDiagonalHeight[index] += tableau[i][j];
				}



				if (!anyChange && newDiagonalHeight[index] !== tableau[i][j])
				{
					anyChange = true;
				}
			});



			if (tableau[i][j] !== 0)
			{
				const coordinatesToColor = [];

				for (let k = tableau[i][j] - 1; k >= 0; k--)
				{
					coordinatesToColor.push([i, j, k]);
				}

				this.colorCubes(array, coordinatesToColor, hueIndex / numCorners * 6 / 7);
			}

			else if (newDiagonalHeight[0] !== 0)
			{
				array.cubes[i][j][0] = this.addCube(
					array,
					j,
					0,
					i,
					hueIndex / numCorners * 6 / 7,
					1,
					this.cubeLightness
				);

				tableau[i][j] = 1;

				this.revealCubes(array, [[i, j, 0]]);
			}

			else if (!anyChange)
			{
				hueIndex++;
				continue;
			}

			await new Promise(resolve => setTimeout(resolve, this.animationTime));



			// This is async, so we can't use forEach easily.
			for (let index = 0; index < diagonalCoordinates.length; index++)
			{
				i = diagonalCoordinates[index][0];
				j = diagonalCoordinates[index][1];

				if (newDiagonalHeight[index] > tableau[i][j])
				{
					const coordinatesToReveal = [];

					for (let k = tableau[i][j]; k < newDiagonalHeight[index]; k++)
					{
						array.cubes[i][j][k] = this.addCube(
							array,
							j,
							k,
							i,
							hueIndex / numCorners * 6 / 7,
							1,
							this.cubeLightness
						);

						coordinatesToReveal.push([i, j, k]);
					}

					if (this.in2dView)
					{
						this.revealCubes(array, coordinatesToReveal);
					}

					else
					{
						await this.revealCubes(array, coordinatesToReveal);
					}
				}



				else if (newDiagonalHeight[index] < tableau[i][j])
				{
					const coordinatesToDelete = [];

					for (let k = tableau[i][j] - 1; k >= newDiagonalHeight[index]; k--)
					{
						coordinatesToDelete.push([i, j, k]);
					}

					if (this.in2dView)
					{
						this.deleteCubes(array, coordinatesToDelete);
					}

					else
					{
						await this.deleteCubes(array, coordinatesToDelete);
					}
				}



				tableau[i][j] = newDiagonalHeight[index];

				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(array, i, j);
				}
			}



			hueIndex++;

			this.recalculateHeights(array);

			await new Promise(resolve => setTimeout(resolve, this.animationTime));
		}
	}



	this.updateCameraHeight(true);
}