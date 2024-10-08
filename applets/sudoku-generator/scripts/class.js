import { Applet } from "../../../scripts/applets/applet.js";
import { opacityAnimationTime } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Wilson } from "/scripts/wilson.js";

export class SudokuGenerator extends Applet
{
	grid = [];

	webWorker;

	generatedFirstPuzzle = false;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: 1000,
			canvasHeight: 1000
		};

		this.wilson = new Wilson(canvas, options);

	}



	run()
	{
		this.grid = new Array(9);

		for (let i = 0; i < 9; i++)
		{
			this.grid[i] = new Array(9);

			for (let j = 0; j < 9; j++)
			{
				this.grid[i][j] = 0;
			}
		}



		if (this.generatedFirstPuzzle)
		{
			this.wilson.canvas.style.opacity = 0;

			setTimeout(() =>
			{
				const canvasSize = 9 * 200 + 9;

				this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
			}, opacityAnimationTime);
		}

		else
		{
			const canvasSize = 9 * 200 + 9;

			this.wilson.canvas.setAttribute("width", canvasSize);
			this.wilson.canvas.setAttribute("height", canvasSize);

			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
		}



		this.webWorker = addTemporaryWorker("/applets/sudoku-generator/scripts/worker.js");



		this.webWorker.onmessage = e =>
		{
			this.grid = e.data[0];

			this.drawGrid(false);

			this.wilson.canvas.style.opacity = 1;

			this.generatedFirstPuzzle = true;
		};



		if (this.generatedFirstPuzzle)
		{
			setTimeout(() =>
			{
				this.webWorker.postMessage([]);
			}, opacityAnimationTime);
		}

		else
		{
			this.webWorker.postMessage([]);
		}
	}



	drawGrid(printMode)
	{
		const canvasSize = 9 * 200 + 9;



		if (printMode)
		{
			this.wilson.ctx.fillStyle = convertColor(255, 255, 255);
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
			this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		}

		else
		{
			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);

			if (siteSettings.darkTheme)
			{
				this.wilson.ctx.fillStyle = convertColor(192, 192, 192);
			}

			else
			{
				this.wilson.ctx.fillStyle = convertColor(64, 64, 64);
			}
		}



		// Draw the inner gridlines (width 2).
		for (let i = 0; i <= 9; i++)
		{
			if (i % 3 === 0)
			{
				this.wilson.ctx.fillRect(200 * i, 0, 10, canvasSize + 9);
				this.wilson.ctx.fillRect(0, 200 * i, canvasSize + 9, 10);
			}

			this.wilson.ctx.fillRect(200 * i + 4, 0, 2, canvasSize + 9);
			this.wilson.ctx.fillRect(0, 200 * i + 4, canvasSize + 9, 2);
		}



		// Finally, draw the numbers.
		for (let i = 0; i < 9; i++)
		{
			for (let j = 0; j < 9; j++)
			{
				this.wilson.ctx.font = "150px sans-serif";

				if (this.grid[i][j] !== 0)
				{
					this.wilson.ctx.fillText(this.grid[i][j], 200 * j + 64, 200 * i + 156);
				}
			}
		}
	}
}