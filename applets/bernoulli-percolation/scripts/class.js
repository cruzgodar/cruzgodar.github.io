import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { Wilson } from "/scripts/wilson.js";

export class BernoulliPercolation extends AnimationFrameApplet
{
	// This stores the connections indexed by location. Specifcying a row and column
	// indicates the top-left vertex from which the edges emanate, and then the first element
	// is the horizontal edge and the second one is the vertical edge.
	connections;
	// On the other hand, this is a dictionary that holds arrays of the coordinates of
	// the corresponding edges.
	connectionsByValue;
	gridSize = 50;
	resolution = 500;

	threshhold = 0.5;
	lastThreshhold = 0.5;

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

		this.run();
	}



	run({ resolution = 500, gridSize = 50 })
	{
		this.resolution = resolution;
		this.gridSize = gridSize;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.resume();
	}



	generateGrid()
	{
		this.connectionsByValue = {};

		for (let i = 0; i < 1; i += .001)
		{
			this.connectionsByValue[i] = [];
		}

		this.connections = new Array(this.gridSize);

		for (let i = 0; i < this.gridSize; i++)
		{
			this.connections[i] = new Array(this.gridSize);

			for (let j = 0; j < this.gridSize; j++)
			{
				this.connections[i][j] = [
					Math.floor(Math.random() * 1000) / 1000,
					Math.floor(Math.random() * 1000) / 1000
				];

				this.connectionsByValue[this.connections[i][j][0]].push([i, j, 0]);
				this.connectionsByValue[this.connections[i][j][1]].push([i, j, 1]);
			}
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