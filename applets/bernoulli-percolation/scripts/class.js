import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { convertColor } from "/scripts/src/browser.js";
import { Wilson } from "/scripts/wilson.js";

export class BernoulliPercolation extends AnimationFrameApplet
{
	colors;
	// This stores the connections indexed by location. Specifcying a row and column
	// indicates the top-left vertex from which the edges emanate, and then the first element
	// is the horizontal edge and the second one is the vertical edge.
	connections;
	// On the other hand, this is an array that holds arrays of the coordinates of
	// the corresponding edges. The values are scaled up by a factor of 1000
	// (and incremented by 1 since 0 never appears).
	connectionsByValue;
	gridSize = 50;
	resolution = 2000;

	threshhold = 0.5;
	lastThreshhold = 0.5;

	// As fractions of the box with side length resolution/gridSize;
	// 1/2 makes all the dots tangent.
	dotRadiusFraction = .25;
	dotRadiusPixels;

	edgeWidthFraction = .1;
	edgeWidthPixels;
	edgeLengthPixels;

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution
		};

		this.wilson = new Wilson(canvas, options);

		this.run({});
	}



	run({ resolution = 2000, gridSize = 50 })
	{
		this.resolution = resolution;
		this.gridSize = gridSize;

		this.dotRadiusPixels = Math.floor(this.resolution / this.gridSize * this.dotRadiusFraction);
		this.edgeWidthPixels = Math.floor(this.resolution / this.gridSize * this.edgeWidthFraction);
		this.edgeLengthPixels = Math.floor(this.resolution / this.gridSize);

		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.generateGrid();
	}



	generateGrid()
	{
		this.connectionsByValue = new Array(1000);

		for (let i = 0; i < 1000; i++)
		{
			this.connectionsByValue[i] = [];
		}

		this.colors = new Array(this.gridSize);
		this.connections = new Array(this.gridSize);

		for (let i = 0; i < this.gridSize; i++)
		{
			this.colors[i] = new Array(this.gridSize);
			this.connections[i] = new Array(this.gridSize);

			for (let j = 0; j < this.gridSize; j++)
			{
				this.colors[i][j] = this.wilson.utils.hsvToRgb(
					Math.random(),
					0.4 + 0.25 * Math.random(),
					0.5 + 0.5 * Math.random()
				);

				this.drawDot(i, j);



				this.connections[i][j] = [
					Math.ceil(Math.random() * 1000) / 1000,
					Math.ceil(Math.random() * 1000) / 1000
				];

				this.connectionsByValue[Math.floor(this.connections[i][j][0] * 1000 - 1)]
					.push([i, j, 0]);
				this.connectionsByValue[Math.floor(this.connections[i][j][1] * 1000 - 1)]
					.push([i, j, 1]);

				if (this.connections[i][j][0] < 0.5 && j !== this.gridSize - 1)
				{
					this.drawEdge(i, j, 0);
				}

				if (this.connections[i][j][1] < 0.5 && i !== this.gridSize - 1)
				{
					this.drawEdge(i, j, 1);
				}
			}
		}
	}

	drawDot(i, j)
	{
		this.wilson.ctx.fillStyle = convertColor(...this.colors[i][j]);

		const x = (j + .5) / this.gridSize * this.resolution;
		const y = (this.gridSize - i - 1 + .5) / this.gridSize * this.resolution;

		this.wilson.ctx.beginPath();
		this.wilson.ctx.moveTo(x, y);

		this.wilson.ctx.arc(
			x,
			y,
			this.dotRadiusPixels,
			0,
			2 * Math.PI,
			false
		);

		this.wilson.ctx.fill();
	}

	drawEdge(i, j, index)
	{
		this.wilson.ctx.fillStyle = convertColor(...this.colors[i][j]);

		const x = (j + .5) / this.gridSize * this.resolution;
		const y = (this.gridSize - i - 1 + .5) / this.gridSize * this.resolution;

		if (index === 0)
		{
			this.wilson.ctx.fillRect(
				x,
				y - this.edgeWidthPixels / 2,
				this.edgeLengthPixels,
				this.edgeWidthPixels
			);
		}

		else
		{
			this.wilson.ctx.fillRect(
				x - this.edgeWidthPixels / 2,
				y,
				this.edgeWidthPixels,
				this.edgeLengthPixels
			);
		}
	}

	prepareFrame()
	{
		if (this.threshhold !== this.lastThreshhold)
		{
			this.needNewFrame = true;
		}
	}

	drawFrame()
	{
		this.needNewFrame = true;
	}
}