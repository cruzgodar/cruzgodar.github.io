import anime from "/scripts/anime.js";
import { convertColor } from "/scripts/src/browser.js";

export async function showFloor(opacity = 1)
{
	const targets = [];

	for (const array of this.arrays)
	{
		for (const row of array.floor)
		{
			for (const floor of row)
			{
				for (const material of floor.material)
				{
					targets.push(material);
				}
			}
		}
	}

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



export async function showWalls(opacity = 1)
{
	this.wilsonHidden3.ctx._alpha = 1;

	this.wilsonHidden3.ctx.clearRect(0, 0, 64, 64);

	this.wilsonHidden3.ctx.fillStyle = convertColor(
		32,
		32,
		32,
		this.addWalls ? this.wilsonHidden3.ctx._alpha : 0
	);
	this.wilsonHidden3.ctx.fillRect(0, 0, 64, 64);

	this.wilsonHidden3.ctx.fillStyle = convertColor(
		64,
		64,
		64,
		this.addWalls ? this.wilsonHidden3.ctx._alpha : 0
	);
	this.wilsonHidden3.ctx.fillRect(4, 4, 56, 56);

	this.floorTexture.needsUpdate = true;



	this.wilsonHidden4.ctx._alpha = 1;

	this.wilsonHidden4.ctx.clearRect(0, 0, 64, 64);

	this.wilsonHidden4.ctx.fillStyle = convertColor(
		32,
		32,
		32,
		this.addWalls ? this.wilsonHidden4.ctx._alpha : 0
	);
	this.wilsonHidden4.ctx.fillRect(0, 0, 64, 64);

	this.wilsonHidden4.ctx.fillStyle = convertColor(
		64,
		64,
		64,
		this.addWalls ? this.wilsonHidden4.ctx._alpha : 0
	);
	this.wilsonHidden4.ctx.fillRect(4, 4, 56, 56);

	this.floorTexture2.needsUpdate = true;

	this.needNewFrame = true;


	const targets = [];

	for (const array of this.arrays)
	{
		for (const row of array.leftWall.concat(array.rightWall))
		{
			for (const floor of row)
			{
				for (const material of floor.material)
				{
					targets.push(material);
				}
			}
		}
	}

	return anime({
		targets,
		opacity,
		duration: this.animationTime / 2,
		easing: "easeOutQuad",
	}).finished;
}

export function hideWalls()
{
	return this.hideFloor(0);
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

			for (const material of array.floor[i][j].material)
			{
				targets.push(material);
			}

			removals.push([i, j]);
		}
	}

	for (const coordinates of removals)
	{
		for (const material of array.floor[coordinates[0]][coordinates[1]].material)
		{
			material.dispose();
		}

		array.cubeGroup.remove(array.floor[coordinates[0]][coordinates[1]]);

		array.floor[coordinates[0]][coordinates[1]] = undefined;
	}

	if (this.in2dView)
	{
		this.drawAll2dViewText();
	}
}



// Goes through and recomputes the sizes of array and then the total array sizes.
export function recalculateHeights(array)
{
	array.height = 0;

	for (const row of array.numbers)
	{
		for (const entry of row)
		{
			if (entry !== Infinity)
			{
				array.height = Math.max(entry, array.height);
			}
		}
	}

	array.size = Math.max(array.footprint, array.height);



	this.totalArrayHeight = 0;

	for (const array of this.arrays)
	{
		this.totalArrayHeight = Math.max(
			array.height,
			this.totalArrayHeight
		);
	}



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

	for (const array of this.arrays)
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
	}
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