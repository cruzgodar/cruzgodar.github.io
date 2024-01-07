import { Applet } from "/scripts/src/applets.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class MagicCarpet extends Applet
{
	gridSize = null;
	maxCageSize = null;
	uniqueSolution = null;

	cages = [];

	currentlyDrawing = false;

	cellSize = 200;

	webWorker = null;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: 500,
			canvasHeight: 500
		};

		this.wilson = new Wilson(canvas, options);

		this.run();
	}



	async run({
		gridSize = 8,
		maxCageSize = 16,
		uniqueSolution = true
	})
	{
		if (this.currentlyDrawing)
		{
			return;
		}

		this.gridSize = gridSize;
		this.maxCageSize = maxCageSize;

		this.cellSize = Math.min(200, Math.floor(4000 / this.gridSize));

		const canvasSize = this.gridSize * this.cellSize + 9;

		this.wilson.changeCanvasSize(canvasSize, canvasSize);

		this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);



		this.webWorker = addTemporaryWorker("/applets/magic-carpets/scripts/worker.js");



		this.webWorker.onmessage = (e) =>
		{
			this.cages = e.data[0];

			this.drawGrid();
		};

		this.webWorker.postMessage([this.gridSize, this.maxCageSize, uniqueSolution]);
	}



	drawGrid(rectanglesOnly = false)
	{
		const canvasSize = this.gridSize * this.cellSize + 9;

		if (rectanglesOnly)
		{
			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
		}

		else
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
		}

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";



		//Draw the light gridlines (width 4).
		if (!rectanglesOnly)
		{
			for (let i = 0; i <= this.gridSize; i++)
			{
				this.wilson.ctx.fillRect(this.cellSize * i + 3, 0, 4, canvasSize + 9);
				this.wilson.ctx.fillRect(0, this.cellSize * i + 3, canvasSize + 9, 4);
			}
		}



		this.wilson.ctx.fillRect(
			0,
			0,
			this.cellSize * this.gridSize + 10,
			10
		);

		this.wilson.ctx.fillRect(
			0,
			this.cellSize * this.gridSize,
			this.cellSize * this.gridSize + 10,
			10
		);

		this.wilson.ctx.fillRect(
			0,
			0,
			10,
			this.cellSize * this.gridSize + 10
		);

		this.wilson.ctx.fillRect(
			this.cellSize * this.gridSize,
			0,
			10,
			this.cellSize * this.gridSize + 10
		);



		if (!rectanglesOnly)
		{
			this.wilson.ctx.font = `${this.cellSize * .6}px sans-serif`;

			//Finally, draw the numbers.
			for (let i = 0; i < this.cages.length; i++)
			{
				this.drawNumber(i);
			}
		}

		this.currentlyDrawing = false;
	}



	drawNumber(i)
	{
		const row = this.cages[i][0] + this.cages[i][4];
		const col = this.cages[i][1] + this.cages[i][5];
		const entry = `${this.cages[i][2] * this.cages[i][3]}`;

		const measurement = this.wilson.ctx.measureText(entry);

		this.wilson.ctx.fillText(entry,
			this.cellSize * col + (this.cellSize - measurement.width) / 2 + 5,
			this.cellSize * (row + 1) - (
				this.cellSize - measurement.actualBoundingBoxAscent
				- measurement.actualBoundingBoxDescent
			) / 2 + 4
		);
	}



	drawSolution(rectanglesOnly = false)
	{
		if (this.currentlyDrawing)
		{
			return;
		}

		this.currentlyDrawing = true;

		const canvasSize = this.gridSize * this.cellSize + 9;

		if (rectanglesOnly)
		{
			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
		}

		else
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
		}

		this.drawGrid(rectanglesOnly);

		const delay = 500 / this.cages.length;

		this.drawCage(0, delay, rectanglesOnly);
	}



	drawCage(index, delay, rectanglesOnly)
	{
		if (index === this.cages.length)
		{
			this.currentlyDrawing = false;

			return;
		}



		let rgb = this.wilson.utils.hsvToRgb(index / this.cages.length * 6 / 7, 1, 1);

		this.wilson.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rectanglesOnly ? .5 : .2})`;

		const row = this.cages[index][0] * this.cellSize;
		const col = this.cages[index][1] * this.cellSize;
		const height = this.cages[index][2] * this.cellSize;
		const width = this.cages[index][3] * this.cellSize;

		this.wilson.ctx.fillRect(col + 10, row + 10, width - 10, height - 10);



		rgb = this.wilson.utils.hsvToRgb(index / this.cages.length * 6 / 7, 1, .9);

		this.wilson.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;

		const rowAdjust = this.cages[index][0] === 0 ? 0 : 5;
		const colAdjust = this.cages[index][1] === 0 ? 0 : 5;

		const heightAdjust = (this.cages[index][0] + this.cages[index][2] === this.gridSize)
			|| this.cages[index][0] === 0
			? 0
			: 5;
		
		const widthAdjust = (this.cages[index][1] + this.cages[index][3] === this.gridSize)
			|| this.cages[index][1] === 0
			? 0
			: 5;

		const heightAdjust2 = (this.cages[index][0] + this.cages[index][2] === this.gridSize)
			&& this.cages[index][0] === 0
			? 5
			: 0;
		
		const widthAdjust2 = (this.cages[index][1] + this.cages[index][3] === this.gridSize)
			&& this.cages[index][1] === 0
			? 5
			: 0;

		this.wilson.ctx.fillRect(
			col + 10 - colAdjust,
			row + 10 - rowAdjust,
			width - 5 + widthAdjust - widthAdjust2,
			10
		);

		this.wilson.ctx.fillRect(
			col + 10 - colAdjust,
			row + 10 - rowAdjust,
			10,
			height - 5 + heightAdjust - heightAdjust2
		);
		
		this.wilson.ctx.fillRect(
			col + width - 5 - colAdjust + widthAdjust - widthAdjust2,
			row + 10 - rowAdjust,
			10,
			height - 5 + heightAdjust - heightAdjust2
		);

		this.wilson.ctx.fillRect(
			col + 10 - colAdjust + widthAdjust,
			row + height - 5 - rowAdjust + heightAdjust - heightAdjust2,
			width - 5 - widthAdjust2,
			10
		);



		setTimeout(() => this.drawCage(index + 1, delay, rectanglesOnly), delay);
	}
}