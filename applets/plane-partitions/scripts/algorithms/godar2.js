import { pak } from "./pak.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { sleep } from "/scripts/src/utils.js";

export function godar2(index)
{
	const array = this.arrays[index];

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

	// Extraordinary hack to make this work with Lapsa builds.
	const step1 = async () =>
	{
		await pak.bind(this)(index, false);

		this.in2dView = true;
	};
	
	const ppSize = array.footprint - Math.max(rightLegSize, bottomLegSize);
	
	const step2 = async () =>
	{
		// Pull apart the PP stuff from the RPP.

		const ppNumbers = new Array(ppSize);
		for (let i = 0; i < ppSize; i++)
		{
			ppNumbers[i] = new Array(ppSize);
			for (let j = 0; j < ppSize; j++)
			{
				ppNumbers[i][j] = 0;
			}
		}

		// ?!
		await changeOpacity({
			element: this.wilsonNumbers.canvas,
			opacity: 0,
			duration: this.animationTime / 5
		});

		const ppArray = await this.addNewArray({ index: index + 1, numbers: ppNumbers });

		await sleep(this.animationTime);

		await changeOpacity({
			element: this.wilsonNumbers.canvas,
			opacity: 1,
			duration: this.animationTime / 5
		});

		// Move the PP cubes to the PP array.

		for (let i = 0; i < ppSize; i++)
		{
			for (let j = 0; j < ppSize; j++)
			{
				if (array.numbers[i][j] !== 0)
				{
					const heights = Array.from({ length: array.numbers[i][j] }, (_, i) => i);
					const cubes = heights.map(height => [i, j, height]);

					await this.moveCubes(
						array,
						cubes,
						ppArray,
						cubes,
					);

					ppNumbers[i][j] = array.numbers[i][j];
					array.numbers[i][j] = 0;

					this.drawAll2dViewText();
				}
			}
		}

		await sleep(this.animationTime);

		// Replace the zeros in the RPP with infinity.

		for (let i = 0; i < ppSize; i++)
		{
			for (let j = 0; j < ppSize; j++)
			{
				array.numbers[i][j] = Infinity;

				array.cubes[i][j] = new Array(this.infiniteHeight);

				const cubes = [[i, j, 0]];

				for (let k = 0; k < 1; k++)
				{
					array.cubes[i][j][k] = this.addCube(
						array,
						j,
						k,
						i,
						0,
						0,
						this.asymptoteLightness
					);
				}

				this.revealCubes(array, cubes);
			}
		}

		this.drawAll2dViewText();
	};

	const step3 = async () =>
	{
		// Run pak inverse on the PP.
		await this.runAlgorithm("pakInverse", index + 1, true);

		// Uncolor all the cubes.
		const coordinatesToUncolor = [];

		for (let i = 0; i < ppSize; i++)
		{
			for (let j = 0; j < ppSize; j++)
			{
				for (let k = 0; k < this.arrays[index + 1].numbers[i][j]; k++)
				{
					coordinatesToUncolor.push([i, j, k]);
				}
			}
		}

		await this.uncolorCubes(this.arrays[index + 1], coordinatesToUncolor);
	};



	const step4 = async () =>
	{
		// Palindromically toggle the RPP.

		const rppSize = array.footprint;

		let hueIndex = 0;
		const numToggles = (rppSize - rightLegSize) * (rppSize - rightLegSize + 1) / 2
			+ (rppSize - bottomLegSize) * (rppSize - bottomLegSize + 1) / 2;

		// - (rightLegSize - 1) to avoid going out of bounds,
		// and -1 more since we don't toggle the corner diagonal.
		for (let i = 1; i < rppSize - rightLegSize; i++)
		{
			for (let j = rppSize - rightLegSize - 1; j >= i; j--)
			{
				await toggleDiagonal.bind(this)(
					array,
					j,
					rppSize - rightLegSize,
					hueIndex / numToggles * 6 / 7
				);

				hueIndex++;
			}
		}

		for (let i = 1; i < rppSize - bottomLegSize; i++)
		{
			for (let j = rppSize - bottomLegSize - 1; j >= i; j--)
			{
				await toggleDiagonal.bind(this)(
					array,
					rppSize - bottomLegSize,
					j,
					hueIndex / numToggles * 6 / 7
				);

				hueIndex++;
			}
		}
	};

	return [
		step1,
		step2,
		step3,
		step4
	];
}



// row and col are the top-left corner.
async function toggleDiagonal(array, row, col, hue)
{
	const planePartition = array.numbers;

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

	console.log(row, col, diagonalCoordinates);

	i = diagonalCoordinates[0][0];
	let j = diagonalCoordinates[0][1];

	let coordinatesToColor = [];

	for (let k = planePartition[i][j] - 2; k >= 0; k--)
	{
		coordinatesToColor.push([i, j, k]);
	}

	this.colorCubes(array, coordinatesToColor, hue);



	coordinatesToColor = [];

	for (const coordinate of diagonalCoordinates)
	{
		if (coordinate[2] >= 0)
		{
			coordinatesToColor.push(coordinate);
		}
	}

	await this.colorCubes(array, coordinatesToColor, hue);



	// For each coordinate in the diagonal, we need to find the toggled value.
	// The first and last will always be a little different,
	// since they don't have as many neighbors.
	const newDiagonalHeight = new Array(diagonalCoordinates.length);

	for (const [index, coordinate] of diagonalCoordinates.entries())
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



		neighbor1 = planePartition[i - 1][j];
		neighbor2 = planePartition[i][j - 1];

		newDiagonalHeight[index] +=
			Math.min(neighbor1, neighbor2) - planePartition[i][j];
	}



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



	if (this.in2dView)
	{
		this.uncolorCubes(array, coordinatesToColor);
	}

	else
	{
		await this.uncolorCubes(array, coordinatesToColor);
	}



	this.recalculateHeights(array);

	if (coordinatesToColor.length !== 0)
	{
		await sleep(this.animationTime);
	}
}