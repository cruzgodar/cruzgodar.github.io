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

	gridSize;
	resolution = 500;

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

	getRandomColor()
	{
		return this.wilson.utils.hsvToRgb(
			Math.random(),
			0.4 + 0.25 * Math.random(),
			0.5 + 0.5 * Math.random()
		);
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
				this.colors[i][j] = this.getRandomColor();

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

	getComponent(i, j)
	{
		// Can't store arrays properly in sets, so we'll store
		// [a, b] as "a,b".
		let explored = new Set();
		let active = new Set();
		active.add(`${i},${j}`);

		while (active.size !== 0)
		{
			const futureActive = new Set();

			active.forEach(dot =>
			{
				const pieces = dot.split(",");
				const [row, col] = [parseInt(pieces[0]), parseInt(pieces[1])];

				// Down.
				if (
					row !== this.gridSize - 1
					&& !active.has(`${row + 1},${col}`)
					&& !explored.has(`${row + 1},${col}`)
					&& this.connections[row][col][1] <= this.threshhold
				) {
					futureActive.add(`${row + 1},${col}`);
				}

				// Right.
				if (
					col !== this.gridSize - 1
					&& !active.has(`${row},${col + 1}`)
					&& !explored.has(`${row},${col + 1}`)
					&& this.connections[row][col][0] <= this.threshhold
				) {
					futureActive.add(`${row},${col + 1}`);
				}

				// Up.
				if (
					row !== 0
					&& !active.has(`${row - 1},${col}`)
					&& !explored.has(`${row - 1},${col}`)
					&& this.connections[row - 1][col][1] <= this.threshhold
				) {
					futureActive.add(`${row - 1},${col}`);
				}

				// Left.
				if (
					col !== 0
					&& !active.has(`${row},${col - 1}`)
					&& !explored.has(`${row},${col - 1}`)
					&& this.connections[row][col - 1][0] <= this.threshhold
				) {
					futureActive.add(`${row},${col - 1}`);
				}
			});

			explored = explored.union(active);

			active = new Set(futureActive);
		}

		return explored;
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
				y - this.edgeWidthPixels / 2 - (remove ? 1 : 0),
				this.edgeLengthPixels,
				this.edgeWidthPixels + (remove ? 2 : 0)
			);
		}

		else
		{
			this.wilson.ctx.fillRect(
				x - this.edgeWidthPixels / 2 - (remove ? 1 : 0),
				y,
				this.edgeWidthPixels + (remove ? 2 : 0),
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
		const row2 = i + (index === 0 ? 0 : 1);
		const col2 = j + (index === 0 ? 1 : 0);

		// const dot1Component = this.getComponent(i, j);
		// const dot2Component = this.getComponent(row2, col2);

		// if (dot1Component.has(`${row2},${col2}`))
		// {
		// 	this.drawEdge(i, j, index, true);

		// 	this.drawDot(i, j);

		// 	if (index === 0)
		// 	{
		// 		this.drawDot(i, j + 1);
		// 	}

		// 	else
		// 	{
		// 		this.drawDot(i + 1, j);
		// 	}

		// 	return;
		// }
/*
		const biggerComponentIndex = dot1Component.size > dot2Component.size
			? this.componentsByLocation[i][j]
			: this.componentsByLocation[row2][col2];

		const smallerComponentIndex = this.components
			.findIndex(component => component.length === 0);

		const biggerComponent = dot1Component.size > dot2Component.size
			? dot1Component
			: dot2Component;

		const smallerComponent = dot1Component.size > dot2Component.size
			? dot2Component
			: dot1Component;

		this.components[biggerComponentIndex] = Array.from(biggerComponent).map(dot =>
		{
			const pieces = dot.split(",");
			return [parseInt(pieces[0]), parseInt(pieces[1])];
		});
		// console.log(biggerComponent, this.components[biggerComponentIndex].length);
		
		const newColor = this.getRandomColor();

		smallerComponent.forEach(dot =>
		{
			const pieces = dot.split(",");
			const [row, col] = [parseInt(pieces[0]), parseInt(pieces[1])];

			this.colors[row][col] = [...newColor];
			this.componentsByLocation[row][col] = smallerComponentIndex;
			this.components[smallerComponentIndex].push([row, col]);

			this.drawDot(row, col);

			if (col !== this.gridSize - 1 && this.connections[row][col][0] <= this.threshhold)
			{
				this.drawEdge(row, col, 0);
			}

			if (row !== this.gridSize - 1 && this.connections[row][col][1] <= this.threshhold)
			{
				this.drawEdge(row, col, 1);
			}
		});
*/
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

	updateComponents()
	{
		const oldComponents = structuredClone(this.components);

		// First of all, we'll classify all the components anew.
		this.components = new Array(this.gridSize * this.gridSize);
		this.componentsByLocation = new Array(this.gridSize);

		for (let i = 0; i < this.gridSize; i++)
		{
			this.componentsByLocation[i] = new Array(this.gridSize);

			for (let j = 0; j < this.gridSize; j++)
			{
				this.components[this.gridSize * i + j] = [];
				this.componentsByLocation[i][j] = -1;
			}
		}

		let currentComponentIndex = 0;

		for (let i = 0; i < this.gridSize; i++)
		{
			for (let j = 0; j < this.gridSize; j++)
			{
				if (this.componentsByLocation[i][j] === -1)
				{
					this.components[currentComponentIndex] = Array.from(this.getComponent(i, j))
						.map(dot =>
						{
							const pieces = dot.split(",");
							
							this.componentsByLocation[pieces[0]][pieces[1]] = currentComponentIndex;

							return [parseInt(pieces[0]), parseInt(pieces[1])];
						});

					currentComponentIndex++;
				}
			}
		}

		// Now the hard part. We need to compare these to the previous components and split apart
		// the ones that have changed.

		for (let i = 0; i < oldComponents.length; i++)
		{
			if (oldComponents[i].length === 0)
			{
				continue;
			}

			const fragmentIndicesSet = new Set();

			for (let j = 0; j < oldComponents[i].length; j++)
			{
				const [row, col] = oldComponents[i][j];

				fragmentIndicesSet.add(this.componentsByLocation[row][col]);
			}

			if (fragmentIndicesSet.size === 1)
			{
				continue;
			}

			const fragmentIndices = Array.from(fragmentIndicesSet);

			let biggestFragmentIndex = 0;
			let biggestComponentSize = 0;

			for (let j = 0; j < fragmentIndices.length; j++)
			{
				if (this.components[fragmentIndices[j]].length > biggestComponentSize)
				{
					biggestComponentSize = this.components[fragmentIndices[j]].length;
					biggestFragmentIndex = j;
				}
			}

			// At this point, biggestFragmentIndex is the unique component that keeps its color.

			for (let j = 0; j < fragmentIndices.length; j++)
			{
				if (j === biggestFragmentIndex)
				{
					continue;
				}

				const newColor = this.getRandomColor();

				this.components[fragmentIndices[j]].forEach(dot =>
				{
					const [row, col] = dot;

					this.colors[row][col] = [...newColor];

					this.drawDot(row, col);

					if (
						col !== this.gridSize - 1
						&& this.connections[row][col][0] <= this.threshhold
					) {
						this.drawEdge(row, col, 0);
					}

					if (
						row !== this.gridSize - 1
						&& this.connections[row][col][1] <= this.threshhold
					) {
						this.drawEdge(row, col, 1);
					}
				});
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
		const newThreshhold = this.threshhold;

		if (this.threshhold > this.lastThreshhold)
		{
			for (let i = this.lastThreshhold + 1; i <= newThreshhold; i++)
			{
				this.threshhold = i - 1;

				for (let j = 0; j < this.connectionsByValue[i - 1].length; j++)
				{
					this.addEdge(...this.connectionsByValue[i - 1][j]);
				}
			}
		}

		else
		{
			for (let i = this.lastThreshhold; i > newThreshhold; i--)
			{
				this.threshhold = i - 1;

				for (let j = 0; j < this.connectionsByValue[i - 1].length; j++)
				{
					this.removeEdge(...this.connectionsByValue[i - 1][j]);
				}
			}

			this.updateComponents();
		}
		

		this.threshhold = newThreshhold;
		this.lastThreshhold = this.threshhold;

		const filtered = this.components.map(c => c.length).filter(l => l !== 0);

		let total = 0;
		filtered.forEach(l => total += l);

		console.log(total);
	}
}