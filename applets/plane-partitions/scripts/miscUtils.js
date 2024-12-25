import anime from "/scripts/anime.js";
import { convertColor } from "/scripts/src/browser.js";

export async function showFloor(opacity = 1)
{
	const targets = [];

	this.arrays.forEach(array =>
	{
		array.floor.forEach(row =>
		{
			row.forEach(floor =>
			{
				floor.material.forEach(material => targets.push(material));
			});
		});
	});

	return anime({
		targets,
		opacity,
		duration: this.animationTime / 2,
		easing: "easeOutQuad",
	}).finished;
}

export function hideFloor()
{
	return this.showFloor(0);
}



// Removes the floor from right to left in each row until
// a box with positive size is reached --- used to make RPPs display a little better.
export function removeOutsideFloor(array)
{
	const targets = [];
	const removals = [];

	for (let i = 0; i < array.footprint; i++)
	{
		for (let j = array.footprint - 1; j >= 0; j--)
		{
			if (array.numbers[i][j] !== 0)
			{
				break;
			}

			array.floor[i][j].material.forEach(material => targets.push(material));
			removals.push([i, j]);
		}
	}

	removals.forEach(coordinates =>
	{
		array.floor[coordinates[0]][coordinates[1]].material
			.forEach(material => material.dispose());

		array.cubeGroup.remove(array.floor[coordinates[0]][coordinates[1]]);

		array.floor[coordinates[0]][coordinates[1]] = undefined;
	});

	if (this.in2dView)
	{
		this.drawAll2dViewText();
	}
}



// Goes through and recomputes the sizes of array and then the total array sizes.
export function recalculateHeights(array)
{
	array.height = 0;

	array.numbers.forEach(row =>
	{
		row.forEach(entry =>
		{
			if (entry !== Infinity)
			{
				array.height = Math.max(entry, array.height);
			}
		});
	});

	array.size = Math.max(array.footprint, array.height);



	this.totalArrayHeight = 0;

	this.arrays.forEach(array => this.totalArrayHeight = Math.max(
		array.height,
		this.totalArrayHeight
	));



	this.totalArraySize = Math.max(this.totalArrayFootprint, this.totalArrayHeight);

	if (this.totalArrayHeight !== this.oldTotalArrayHeight)
	{
		this.updateCameraHeight();
	}
}



export function drawAll2dViewText()
{
	this.fontSize = this.wilsonNumbers.canvasWidth / (this.totalArrayFootprint + 1);

	const numCharacters = Math.max(`${this.totalArrayHeight}`.length, 2);

	this.wilsonNumbers.ctx.font = `${this.fontSize / numCharacters}px monospace`;

	this.wilsonNumbers.ctx.fillStyle = convertColor(255, 255, 255);

	this.wilsonNumbers.ctx.clearRect(
		0,
		0,
		this.wilsonNumbers.canvasWidth,
		this.wilsonNumbers.canvasHeight
	);

	this.arrays.forEach(array =>
	{
		// Show the numbers in the right places.
		for (let i = 0; i < array.footprint; i++)
		{
			for (let j = 0; j < array.footprint; j++)
			{
				if (array.floor[i][j])
				{
					this.drawSingleCell2dViewText(array, i, j);
				}
			}
		}
	});
}



export function drawSingleCell2dViewText(array, row, col)
{
	const top = (this.totalArrayFootprint - array.footprint - 1) / 2;
	const left = array.partialFootprintSum - array.footprint;

	this.wilsonNumbers.ctx.clearRect(
		this.fontSize * (col + left + 1),
		this.fontSize * (row + top + 1),
		this.fontSize,
		this.fontSize
	);

	if (
		array.numbers[row][col] !== Infinity
		&& (array.numbers[row][col] !== 0 || this.floorLightness !== 0)
	) {
		const textMetrics = this.wilsonNumbers.ctx.measureText(array.numbers[row][col]);

		// The height adjustment is an annoying spacing computation.
		this.wilsonNumbers.ctx.fillText(
			array.numbers[row][col],
			this.fontSize * (col + left + 1) + (this.fontSize - textMetrics.width) / 2,
			this.fontSize * (row + top + 1) + (
				this.fontSize
				+ textMetrics.actualBoundingBoxAscent
				- textMetrics.actualBoundingBoxDescent
			) / 2
		);
	}
}