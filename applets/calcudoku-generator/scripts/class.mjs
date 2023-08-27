import { changeOpacity, opacityAnimationTime } from "/scripts/src/animation.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { addTemporaryWorker } from "/scripts/src/main.mjs";
import { siteSettings } from "/scripts/src/settings.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class CalcudokuGenerator extends Applet
{
	gridSize = null;

	grid = [];
	cages = [];
	cagesByLocation = [];

	animateNextDraw = false;

	webWorker = null;



	constructor(canvas)
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: 500,
			canvasHeight: 500
		};

		this.wilson = new Wilson(canvas, options);
	}



	async run({ gridSize, maxCageSize })
	{
		if (this.canvas.style.opacity == 1)
		{
			await changeOpacity(this.canvas, 0);
		}



		this.gridSize = gridSize;

		this.maxCageSize = maxCageSize;



		for (let i = 0; i < this.gridSize; i++)
		{
			this.cagesByLocation.push([]);

			for (let j = 0; j < this.gridSize; j++)
			{
				this.cagesByLocation[i].push(0);
			}
		}



		const timeoutId = setTimeout(() =>
		{
			const canvasSize = this.gridSize * 200 + 9;

			this.wilson.changeCanvasSize(canvasSize, canvasSize);

			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
		}, opacityAnimationTime);

		this.timeoutIds.push(timeoutId);



		this.webWorker = addTemporaryWorker("/applets/calcudoku-generator/scripts/worker.js");



		this.animateNextDraw = true;

		this.webWorker.onmessage = (e) =>
		{
			this.grid = e.data[0];
			this.cages = e.data[1];
			this.cagesByLocation = e.data[2];

			this.drawGrid(false);


			if (this.animateNextDraw)
			{
				this.animateNextDraw = false;

				changeOpacity(this.canvas, 1);
			}
		};

		const timeoutId2 = setTimeout(() =>
		{
			this.webWorker.postMessage([this.gridSize, this.maxCageSize]);
		}, opacityAnimationTime);

		this.timeoutIds.push(timeoutId2);
	}



	drawGrid(printMode)
	{
		const canvasSize = this.gridSize * 200 + 9;

		if (printMode)
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		}

		else
		{
			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);

			if (siteSettings.darkTheme)
			{
				this.wilson.ctx.fillStyle = "rgb(192, 192, 192)";
			}

			else
			{
				this.wilson.ctx.fillStyle = "rgb(64, 64, 64)";
			}
		}



		//Draw the light gridlines (width 2).
		for (let i = 0; i <= this.gridSize; i++)
		{
			this.wilson.ctx.fillRect(200 * i + 4, 0, 2, canvasSize + 9);
			this.wilson.ctx.fillRect(0, 200 * i + 4, canvasSize + 9, 2);
		}



		//Now draw the cages. For each cell of the grid, we draw a line with width 10 if an adjacent cell is part of a
		//different cage.
		for (let i = 0; i < this.gridSize; i++)
		{
			for (let j = 0; j < this.gridSize; j++)
			{
				if (i === 0 || this.cagesByLocation[i - 1][j] !== this.cagesByLocation[i][j])
				{
					this.wilson.ctx.fillRect(200 * j, 200 * i, 210, 10);
				}

				if (i === this.gridSize - 1 || this.cagesByLocation[i + 1][j] !== this.cagesByLocation[i][j])
				{
					this.wilson.ctx.fillRect(200 * j, 200 * (i + 1), 210, 10);
				}

				if (j === 0 || this.cagesByLocation[i][j - 1] !== this.cagesByLocation[i][j])
				{
					this.wilson.ctx.fillRect(200 * j, 200 * i, 10, 210);
				}

				if (j === this.gridSize - 1 || this.cagesByLocation[i][j + 1] !== this.cagesByLocation[i][j])
				{
					this.wilson.ctx.fillRect(200 * (j + 1), 200 * i, 10, 210);
				}
			}
		}



		//Finally, draw the numbers.
		for (let i = 0; i < this.cages.length; i++)
		{
			//Find the leftmost cell in the top row of the cage.
			let topLeftCell = [this.gridSize, this.gridSize];

			for (let j = 0; j < this.cages[i][2].length; j++)
			{
				const row = this.cages[i][2][j][0];
				const col = this.cages[i][2][j][1];

				if (row < topLeftCell[0])
				{
					topLeftCell = [row, col];
				}

				else if (row === topLeftCell[0] && col < topLeftCell[1])
				{
					topLeftCell = [row, col];
				}
			}



			let label = "";

			if (this.cages[i][0] === "+")
			{
				label = this.cages[i][1] + "+";
			}

			else if (this.cages[i][0] === "x")
			{
				label = this.cages[i][1] + "\u00D7";
			}

			else if (this.cages[i][0] === "-")
			{
				label = this.cages[i][1] + "\u2013";
			}

			else if (this.cages[i][0] === ":")
			{
				label = this.cages[i][1] + ":";
			}

			else
			{
				label = this.cages[i][1] + "";
			}



			let fontSize = null;

			if (label.length <= 6)
			{
				this.wilson.ctx.font = "50px sans-serif";

				fontSize = 50;
			}

			else
			{
				this.wilson.ctx.font = (300 / label.length) + "px sans-serif";

				fontSize = 300 / label.length;
			}

			this.wilson.ctx.fillText(label, 200 * topLeftCell[1] + 15, 200 * topLeftCell[0] + fontSize + 5);
		}
	}
}