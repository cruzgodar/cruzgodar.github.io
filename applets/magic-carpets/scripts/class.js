import { Applet, hsvToRgb } from "../../../scripts/applets/applet.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class MagicCarpets extends Applet
{
	gridSize;
	maxCageSize;
	uniqueSolution;

	cages = [];

	currentlyDrawing = false;

	cellSize = 200;

	delay;
	cagesPerDraw;
	cageIndex;

	webWorker;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: 500,
		};

		this.wilson = new WilsonCPU(canvas, options);

		this.run();
	}



	async run({
		gridSize = 8,
		maxCageSize = 16,
		uniqueSolution = true
	}) {
		if (this.currentlyDrawing)
		{
			return;
		}

		this.gridSize = gridSize;
		this.maxCageSize = maxCageSize;

		this.cellSize = Math.min(200, Math.floor(4000 / this.gridSize));

		const canvasSize = this.gridSize * this.cellSize + 9;

		this.wilson.resizeCanvas({ width: canvasSize });



		this.webWorker = addTemporaryWorker("/applets/magic-carpets/scripts/worker.js");

		this.webWorker.onmessage = (e) =>
		{
			this.cages = e.data[0];

			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);

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
			this.wilson.ctx.fillStyle = convertColor(255, 255, 255);
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
		}

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);



		// Draw the light gridlines (width 4).
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

			// Finally, draw the numbers.
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
			this.wilson.ctx.fillStyle = convertColor(255, 255, 255);
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
		}

		this.drawGrid(rectanglesOnly);

		this.delay = Math.floor(250 / this.cages.length);
		this.cagesPerDraw = Math.ceil(this.cages.length / 250);
		this.cageIndex = 0;

		this.drawCage(0, rectanglesOnly);

	}



	drawCage(index, rectanglesOnly)
	{
		if (index === this.cages.length)
		{
			this.currentlyDrawing = false;

			return;
		}



		let rgb = hsvToRgb(index / this.cages.length * 6 / 7, 1, 1);

		this.wilson.ctx.fillStyle = convertColor(...rgb, rectanglesOnly ? .5 : .2);

		const row = this.cages[index][0] * this.cellSize;
		const col = this.cages[index][1] * this.cellSize;
		const height = this.cages[index][2] * this.cellSize;
		const width = this.cages[index][3] * this.cellSize;

		this.wilson.ctx.fillRect(col + 10, row + 10, width - 10, height - 10);



		rgb = hsvToRgb(index / this.cages.length * 6 / 7, 1, .9);

		this.wilson.ctx.fillStyle = convertColor(...rgb);

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

		
		this.cageIndex++;

		if (this.cageIndex % this.cagesPerDraw === 0)
		{
			setTimeout(() => this.drawCage(index + 1, rectanglesOnly), this.delay);
		}

		else
		{
			this.drawCage(index + 1, rectanglesOnly);
		}
	}
}