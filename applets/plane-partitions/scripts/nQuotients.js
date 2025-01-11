import anime from "/scripts/anime.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";

// A demonstration of the n-quotient, not currently public-facing in the applet.
// It uses the numbers canvas to draw the appropriate edges and move them around.
// To call this function, the canvas should be in 2d mode but the numbers should be gone.
export async function drawBoundary(index, n)
{
	if (!this.in2dView)
	{
		await this.show2dView();
	}

	if (this.wilsonNumbers.canvas.style.opacity !== "0")
	{
		await changeOpacity({
			element: this.wilsonNumbers.canvas,
			opacity: 0,
			duration: this.animationTime / 3
		});
	}

	this.wilsonNumbers.ctx.clearRect(
		0,
		0,
		this.wilsonNumbers.canvasWidth,
		this.wilsonNumbers.canvasHeight
	);



	const array = this.arrays[index];
	const planePartition = array.numbers;

	const rects = [];

	let hueIndex = 0;

	let j = 0;

	for (let i = array.footprint - 1; i >= 0; i--)
	{
		while (j < array.footprint && planePartition[i][j] === Infinity)
		{
			// Add horizontal edges.
			if (i === array.footprint - 1 || planePartition[i + 1][j] !== Infinity)
			{
				const h = (hueIndex % n) / n;

				const rgb = hsvToRgb(h, 1, 1);

				rects.push([i, j, true, rgb]);

				hueIndex++;
			}

			j++;
		}

		// Add a vertical edge.
		const h = (hueIndex % n) / n;

		const rgb = hsvToRgb(h, 1, 1);

		rects.push([i, j, false, rgb]);

		hueIndex++;
	}

	// Add all the horizontal edges we missed.
	const i = -1;

	while (j < array.footprint)
	{
		if (i === array.footprint - 1 || planePartition[i + 1][j] !== Infinity)
		{
			const h = (hueIndex % n) / n;

			const rgb = hsvToRgb(h, 1, 1);

			rects.push([i, j, true, rgb]);

			hueIndex++;
		}

		j++;
	}

	rects.forEach(rect =>
	{
		this.drawBoundaryRect(array, rect[0], rect[1], rect[2], rect[3]);
	});



	await changeOpacity({
		element: this.wilsonNumbers.canvas,
		opacity: 1,
		duration: this.animationTime / 3
	});

	this.wilsonNumbers.ctx.fillStyle = convertColor(255, 255, 255);

	return rects;
}



export async function drawNQuotient(index, n, m, rects)
{
	const array = this.arrays[index];

	// Fade out the ones we don't care about.

	const dummy = { t: 1 };

	let update = () =>
	{
		this.wilsonNumbers.ctx.clearRect(
			0,
			0,
			this.wilsonNumbers.canvasWidth,
			this.wilsonNumbers.canvasHeight
		);

		rects.forEach((rect, index) =>
		{
			const opacity = index % n === m ? 1 : dummy.t;

			this.drawBoundaryRect(
				array,
				rect[0],
				rect[1],
				rect[2],
				[...(rect[3]), opacity]
			);
		});
	};

	await anime({
		targets: dummy,
		t: 0,
		duration: this.animationTime,
		easing: "easeOutQuad",
		update,
		complete: update
	}).finished;

	this.wilsonNumbers.ctx.clearRect(
		0,
		0,
		this.wilsonNumbers.canvasWidth,
		this.wilsonNumbers.canvasHeight
	);

	rects.forEach((rect, index) =>
	{
		const opacity = index % n === m ? 1 : 0;

		this.drawBoundaryRect(
			array,
			rect[0],
			rect[1],
			rect[2],
			[...(rect[3]), opacity]
		);
	});



	// Collapse the remaining ones. This assumes that the
	// first and last rectangles are part of the endless border.
	rects = rects.filter((rect, index) => index % n === m);

	// If we start from the bottom-left, the only difficult thing to do
	// is figure out the correct starting column. Thankfully, that's easy:
	// it's just the number of vertical edges total.

	const numVerticalEdges = rects.filter(rect => !rect[2]).length;

	const targetRects = new Array(rects.length);

	let row = numVerticalEdges - 1;
	let col = 0;

	rects.forEach((rect, index) =>
	{
		targetRects[index] = [row, col];

		if (rect[2])
		{
			col++;
		}

		else
		{
			row--;
		}
	});



	dummy.t = 0;

	update = () =>
	{
		this.wilsonNumbers.ctx.clearRect(
			0,
			0,
			this.wilsonNumbers.canvasWidth,
			this.wilsonNumbers.canvasHeight
		);

		rects.forEach((rect, index) =>
		{
			this.drawBoundaryRect(
				array,
				(1 - dummy.t) * rect[0] + dummy.t * targetRects[index][0],
				(1 - dummy.t) * rect[1] + dummy.t * targetRects[index][1],
				rect[2],
				rect[3]
			);
		});
	};

	await anime({
		targets: dummy,
		t: 1,
		duration: this.animationTime,
		easing: "easeInOutQuad",
		update,
		complete: update
	}).finished;

	this.wilsonNumbers.ctx.clearRect(
		0,
		0,
		this.wilsonNumbers.canvasWidth,
		this.wilsonNumbers.canvasHeight
	);

	rects.forEach((rect, index) =>
	{
		this.drawBoundaryRect(
			array,
			targetRects[index][0],
			targetRects[index][1],
			rect[2],
			rect[3]
		);
	});



	// We'll start the next animation without waiting for it
	// so that it plays concurrently: any asymptotes where there
	// should no longer be any need to be removed.

	const cubesToDelete = [];

	targetRects.forEach((rect, index) =>
	{
		if (!rects[index][2])
		{
			for (let j = rect[1]; j < array.footprint; j++)
			{
				if (array.numbers[rect[0]][j] === Infinity)
				{
					for (let k = 0; k < this.infiniteHeight; k++)
					{
						cubesToDelete.push([rect[0], j, k]);
					}
				}
			}
		}
	});

	this.deleteCubes(array, cubesToDelete, true);



	// Now we'll go through and add more edges to make the whole thing look nicer.
	const bonusRects = [];

	for (let i = array.footprint - 1; i > targetRects[0][0]; i--)
	{
		bonusRects.push([i, 0, false]);
	}

	for (let j = targetRects[targetRects.length - 1][1]; j < array.footprint; j++)
	{
		bonusRects.push([-1, j, true]);
	}

	dummy.t = 0;

	update = () =>
	{
		this.wilsonNumbers.ctx.clearRect(
			0,
			0,
			this.wilsonNumbers.canvasWidth,
			this.wilsonNumbers.canvasHeight
		);

		rects.forEach((rect, index) =>
		{
			this.drawBoundaryRect(
				array,
				targetRects[index][0],
				targetRects[index][1],
				rect[2],
				rect[3]);
		});

		bonusRects.forEach(rect =>
		{
			this.drawBoundaryRect(
				array,
				rect[0],
				rect[1],
				rect[2],
				[...(rects[0][3]), dummy.t]
			);
		});
	};

	await anime({
		targets: dummy,
		t: 1,
		duration: this.animationTime / 2,
		easing: "easeInQuad",
		update,
		complete: update
	}).finished;

	this.wilsonNumbers.ctx.clearRect(
		0,
		0,
		this.wilsonNumbers.canvasWidth,
		this.wilsonNumbers.canvasHeight
	);

	rects.forEach((rect, index) =>
	{
		this.drawBoundaryRect(
			array,
			targetRects[index][0],
			targetRects[index][1],
			rect[2],
			rect[3]
		);
	});

	bonusRects.forEach(rect =>
	{
		this.drawBoundaryRect(
			array,
			rect[0],
			rect[1],
			rect[2],
			rect[3]
		);
	});

	this.wilsonNumbers.ctx.fillStyle = convertColor(255, 255, 255);
}



export function drawBoundaryRect(array, i, j, horizontal, rgba)
{
	const top = (this.totalArrayFootprint - array.footprint - 1) / 2;
	const left = array.partialFootprintSum - array.footprint;

	this.wilsonNumbers.ctx.fillStyle = convertColor(...rgba);

	if (horizontal)
	{
		this.wilsonNumbers.ctx.fillRect(
			this.wilsonNumbers.canvasWidth * (j + left + 1) / (this.totalArrayFootprint + 1),

			this.wilsonNumbers.canvasHeight
				* (i + top + 1 + 15 / 16) / (this.totalArrayFootprint + 1) + 1,

			this.wilsonNumbers.canvasWidth / (this.totalArrayFootprint + 1),
			
			this.wilsonNumbers.canvasHeight * (1 / 16) / (this.totalArrayFootprint + 1)
		);
	}

	else
	{
		this.wilsonNumbers.ctx.fillRect(
			this.wilsonNumbers.canvasWidth
				* (j + left + 15 / 16) / (this.totalArrayFootprint + 1),

			this.wilsonNumbers.canvasHeight
				* (i + top + 1) / (this.totalArrayFootprint + 1) + 1,

			this.wilsonNumbers.canvasWidth * (1 / 16) / (this.totalArrayFootprint + 1),

			this.wilsonNumbers.canvasHeight / (this.totalArrayFootprint + 1)
		);
	}
}