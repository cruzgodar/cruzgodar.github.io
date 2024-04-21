import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { convertColor } from "/scripts/src/browser.js";
import { Wilson } from "/scripts/wilson.js";

export class BernoulliPercolation extends AnimationFrameApplet
{
	// Each dot gets a color --- this is just a standard 2D array.
	colors;
	// This stores the connections indexed by location. Specifcying a row and column
	// indicates the top-left vertex from which the edges emanate, and then the first element
	// is the horizontal edge and the second one is the vertical edge.
	connections;
	// On the other hand, this is an array that holds arrays of the coordinates of
	// the corresponding edges. The values are scaled up by a factor of 1000
	// (and incremented by 1 since 0 never appears).
	connectionsByValue;

	// This stores lists of dots that belong to each connected component.
	components;

	// Meanwhile, this stores a look table of component index by dot coordinate.
	componentsByLocation;

	gridSize = 50;
	resolution = 2000;

	threshhold = 0;
	lastThreshhold = 0;

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

		this.resume();
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
		this.components = new Array(this.gridSize * this.gridSize);
		this.componentsByLocation = new Array(this.gridSize);

		for (let i = 0; i < this.gridSize; i++)
		{
			this.colors[i] = new Array(this.gridSize);
			this.connections[i] = new Array(this.gridSize);
			this.componentsByLocation[i] = new Array(this.gridSize);

			for (let j = 0; j < this.gridSize; j++)
			{
				this.colors[i][j] = this.wilson.utils.hsvToRgb(
					Math.random(),
					0.4 + 0.25 * Math.random(),
					0.5 + 0.5 * Math.random()
				);

				this.drawDot(i, j);



				this.connections[i][j] = [
					Math.ceil(Math.random() * 1000),
					Math.ceil(Math.random() * 1000)
				];

				if (j !== this.gridSize - 1)
				{
					this.connectionsByValue[Math.floor(this.connections[i][j][0] - 1)]
						.push([i, j, 0]);
				}

				if (i !== this.gridSize - 1)
				{
					this.connectionsByValue[Math.floor(this.connections[i][j][1] - 1)]
						.push([i, j, 1]);
				}



				this.components[this.gridSize * i + j] = [[i, j]];
				this.componentsByLocation[i][j] = this.gridSize * i + j;
			}
		}
	}

	drawDot(i, j)
	{
		this.wilson.ctx.fillStyle = convertColor(...this.colors[i][j]);

		const x = (j + .5) / this.gridSize * this.resolution;
		const y = (i + .5) / this.gridSize * this.resolution;

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

	drawEdge(i, j, index, remove = false)
	{
		this.wilson.ctx.fillStyle = convertColor(...(remove ? [0, 0, 0] : this.colors[i][j]));

		const x = (j + .5) / this.gridSize * this.resolution;
		const y = (i + .5) / this.gridSize * this.resolution;

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

	addEdge(i, j, index)
	{
		// The larger connected component size determines the new color.
		const component1Index = this.componentsByLocation[i][j];
		const dot1Size = this.components[component1Index].length;

		const row2 = i + (index === 0 ? 0 : 1);
		const col2 = j + (index === 0 ? 1 : 0);

		const component2Index = this.componentsByLocation[row2][col2];
		const dot2Size = this.components[component2Index].length;

		const biggerRow = dot1Size > dot2Size ? i : row2;
		const biggerCol = dot1Size > dot2Size ? j : col2;
		const biggerComponentIndex = dot1Size > dot2Size ? component1Index : component2Index;
		const smallerComponentIndex = dot1Size > dot2Size ? component2Index : component1Index;

		if (smallerComponentIndex === biggerComponentIndex)
		{
			this.drawEdge(i, j, index);
			return;
		}

		// Merge the two components.
		for (let k = 0; k < this.components[smallerComponentIndex].length; k++)
		{
			const [row, col] = this.components[smallerComponentIndex][k];

			this.colors[row][col] = [...this.colors[biggerRow][biggerCol]];
			this.componentsByLocation[row][col] = biggerComponentIndex;

			this.drawDot(row, col);

			if (col !== this.gridSize - 1 && this.connections[row][col][0] <= this.threshhold)
			{
				this.drawEdge(row, col, 0);
			}

			if (row !== this.gridSize - 1 && this.connections[row][col][1] <= this.threshhold)
			{
				this.drawEdge(row, col, 1);
			}
		}

		this.components[biggerComponentIndex] = this.components[biggerComponentIndex]
			.concat(this.components[smallerComponentIndex]);
		
		this.components[smallerComponentIndex] = [];

		this.drawEdge(i, j, index);
	}

	removeEdge(i, j, index)
	{
		this.drawEdge(i, j, index, true);

		this.drawDot(i, j);

		if (index === 0)
		{
			this.drawDot(i, j + 1);
		}

		else
		{
			this.drawDot(i + 1, j);
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
		if (this.threshhold > this.lastThreshhold)
		{
			for (let i = this.lastThreshhold + 1; i <= this.threshhold; i++)
			{
				for (let j = 0; j < this.connectionsByValue[i - 1].length; j++)
				{
					this.addEdge(...this.connectionsByValue[i - 1][j]);
				}
			}
		}

		else
		{
			for (let i = this.lastThreshhold; i > this.threshhold; i--)
			{
				for (let j = 0; j < this.connectionsByValue[i - 1].length; j++)
				{
					this.removeEdge(...this.connectionsByValue[i - 1][j]);
				}
			}
		}

		this.lastThreshhold = this.threshhold;
	}
}