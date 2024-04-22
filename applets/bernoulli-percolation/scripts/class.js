import anime from "/scripts/anime.js";
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

	threshold;
	lastthreshold;

	doDrawDots;

	hueRangeStart;
	hueRangeLength;

	// As fractions of the box with side length resolution/gridSize;
	// 1/2 makes all the dots tangent.
	dotRadiusFraction = .35;
	dotRadiusPixels;

	edgeWidthFraction = .2;
	edgeWidthPixels;
	edgeLengthPixels;

	// Helps the animation run smoother.
	roundRectFudgePixels = 2;

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilson = new Wilson(canvas, options);
	}



	run({
		resolution = 2000,
		gridSize = 50,
		threshold = 500,
		doDrawDots = false
	}) {
		this.resolution = resolution;
		this.gridSize = gridSize;
		this.lastthreshold = 0;
		this.threshold = threshold;
		this.doDrawDots = doDrawDots;

		// Check for roundRect support.
		if (this.wilson.ctx.roundRect)
		{
			this.drawDot = this.drawDotRoundRect;
			this.drawEdge = this.drawEdgeRectangle;

			this.roundRectFudgePixels = 0;

			this.dotRadiusFraction = this.doDrawDots ? .35 : .5;
			this.edgeWidthFraction = this.doDrawDots ? .2 : 0;
		}

		else
		{
			this.drawDot = this.doDrawDots ? this.drawDotCircle : this.drawDotRectangle;
			this.drawEdge = this.doDrawDots ? this.drawEdgeRectangle : this.drawEdgeNone;
		}

		this.dotRadiusPixels = Math.floor(this.resolution / this.gridSize * this.dotRadiusFraction);
		this.edgeWidthPixels = Math.floor(this.resolution / this.gridSize * this.edgeWidthFraction);
		this.edgeLengthPixels = Math.floor(this.resolution / this.gridSize);

		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.hueRangeStart = Math.random();
		this.hueRangeLength = .45;

		this.generateGrid();

		if (!this.doDrawDots)
		{
			this.redrawEverything(true);
		}

		this.resume();
	}

	getRandomColor()
	{
		return this.wilson.utils.hsvToRgb(
			(this.hueRangeStart + Math.random() * this.hueRangeLength) % 1,
			0.3 + 0.1 * Math.random(),
			0.7 + 0.3 * Math.random()
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
					&& this.connections[row][col][1] <= this.threshold
				) {
					futureActive.add(`${row + 1},${col}`);
				}

				// Right.
				if (
					col !== this.gridSize - 1
					&& !active.has(`${row},${col + 1}`)
					&& !explored.has(`${row},${col + 1}`)
					&& this.connections[row][col][0] <= this.threshold
				) {
					futureActive.add(`${row},${col + 1}`);
				}

				// Up.
				if (
					row !== 0
					&& !active.has(`${row - 1},${col}`)
					&& !explored.has(`${row - 1},${col}`)
					&& this.connections[row - 1][col][1] <= this.threshold
				) {
					futureActive.add(`${row - 1},${col}`);
				}

				// Left.
				if (
					col !== 0
					&& !active.has(`${row},${col - 1}`)
					&& !explored.has(`${row},${col - 1}`)
					&& this.connections[row][col - 1][0] <= this.threshold
				) {
					futureActive.add(`${row},${col - 1}`);
				}
			});

			explored = explored.union(active);

			active = new Set(futureActive);
		}

		return explored;
	}

	drawDotRoundRect(i, j)
	{
		const x = (j + .5 - this.dotRadiusFraction) / this.gridSize * this.resolution;
		const y = (i + .5 - this.dotRadiusFraction) / this.gridSize * this.resolution;

		this.wilson.ctx.fillStyle = convertColor(...this.colors[i][j]);

		this.wilson.ctx.beginPath();

		const borderRadius = (.5 - this.dotRadiusFraction) / (.5 - .35) * .35
			* this.resolution / this.gridSize;

		this.wilson.ctx.roundRect(
			x - this.roundRectFudgePixels / 2,
			y - this.roundRectFudgePixels / 2,
			this.dotRadiusPixels * 2 + this.roundRectFudgePixels,
			this.dotRadiusPixels * 2 + this.roundRectFudgePixels,
			borderRadius,
		);

		this.wilson.ctx.fill();
	}

	drawDotCircle(i, j)
	{
		const x = (j + .5) / this.gridSize * this.resolution;
		const y = (i + .5) / this.gridSize * this.resolution;

		this.wilson.ctx.fillStyle = convertColor(...this.colors[i][j]);

		this.wilson.ctx.beginPath();

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

	drawDotRectangle(i, j)
	{
		const x = j / this.gridSize * this.resolution;
		const y = i / this.gridSize * this.resolution;

		this.wilson.ctx.fillStyle = convertColor(...this.colors[i][j]);

		this.wilson.ctx.fillRect(
			x - this.roundRectFudgePixels / 2,
			y - this.roundRectFudgePixels / 2,
			this.edgeLengthPixels + this.roundRectFudgePixels,
			this.edgeLengthPixels + this.roundRectFudgePixels
		);
	}

	drawEdgeRectangle(i, j, index, remove = false)
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

	drawEdgeNone() {}

	addEdge(i, j, index)
	{
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

	joinComponents()
	{
		const oldComponents = structuredClone(this.components);
		const oldComponentsByLocation = structuredClone(this.componentsByLocation);

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

		// Now the hard part. We need to compare these to the previous components and join together
		// the ones that have changed.

		for (let i = 0; i < this.components.length; i++)
		{
			if (this.components[i].length === 0)
			{
				continue;
			}

			const fragmentIndicesSet = new Set();

			for (let j = 0; j < this.components[i].length; j++)
			{
				const [row, col] = this.components[i][j];

				fragmentIndicesSet.add(oldComponentsByLocation[row][col]);
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
				if (oldComponents[fragmentIndices[j]].length > biggestComponentSize)
				{
					biggestComponentSize = oldComponents[fragmentIndices[j]].length;
					biggestFragmentIndex = j;
				}
			}

			// At this point, biggestFragmentIndex is the unique component
			// that propogates its color.

			const sourceColorDot = oldComponents[fragmentIndices[biggestFragmentIndex]][0];
			const newColor = this.colors[sourceColorDot[0]][sourceColorDot[1]];

			this.components[i].forEach(dot =>
			{
				const [row, col] = dot;

				this.colors[row][col] = [...newColor];

				this.drawDot(row, col);

				if (
					col !== this.gridSize - 1
					&& this.connections[row][col][0] <= this.threshold
				) {
					this.drawEdge(row, col, 0);
				}

				if (
					row !== this.gridSize - 1
					&& this.connections[row][col][1] <= this.threshold
				) {
					this.drawEdge(row, col, 1);
				}
			});
		}
	}

	splitComponents()
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
						&& this.connections[row][col][0] <= this.threshold
					) {
						this.drawEdge(row, col, 0);
					}

					if (
						row !== this.gridSize - 1
						&& this.connections[row][col][1] <= this.threshold
					) {
						this.drawEdge(row, col, 1);
					}
				});
			}
		}
	}

	redrawEverything(forceRectangles = false)
	{
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.dotRadiusPixels = Math.floor(this.resolution / this.gridSize * this.dotRadiusFraction);
		this.edgeWidthPixels = Math.floor(this.resolution / this.gridSize * this.edgeWidthFraction);
		this.edgeLengthPixels = Math.floor(this.resolution / this.gridSize);

		const oldDrawDot = this.drawDot;
		const oldDrawEdge = this.drawEdge;
		
		if (forceRectangles)
		{
			this.drawDot = this.drawDotRectangle;
			this.drawEdge = this.drawEdgeNone;

			this.roundRectFudgePixels = 2 * Math.ceil(this.resolution / 2000);
		}

		for (let i = 0; i < this.gridSize; i++)
		{
			for (let j = 0; j < this.gridSize; j++)
			{
				this.drawDot(i, j);

				if (
					j !== this.gridSize - 1
					&& this.connections[i][j][0] <= this.threshold
				) {
					this.drawEdge(i, j, 0);
				}

				if (
					i !== this.gridSize - 1
					&& this.connections[i][j][1] <= this.threshold
				) {
					this.drawEdge(i, j, 1);
				}
			}
		}

		this.drawDot = oldDrawDot;
		this.drawEdge = oldDrawEdge;
	}

	async switchDrawEdges()
	{
		if (!this.wilson.ctx.roundRect)
		{
			this.doDrawDots = !this.doDrawDots;

			this.drawDot = this.doDrawDots ? this.drawDotCircle : this.drawDotRectangle;
			this.drawEdge = this.doDrawDots ? this.drawEdgeRectangle : this.drawEdgeNone;

			this.roundRectFudgePixels = 0;

			this.redrawEverything();

			return;
		}

		const dummy = { t: 0 };

		if (this.doDrawDots)
		{
			this.doDrawDots = false;

			this.roundRectFudgePixels = 2 * Math.ceil(this.resolution / 2000);

			await anime({
				targets: dummy,
				t: 1,
				duration: 250,
				easing: "easeOutQuint",
				update: () =>
				{
					this.dotRadiusFraction = .35 * (1 - dummy.t) + .5 * dummy.t;
					this.edgeWidthFraction = .2 * (1 - dummy.t) + .5 * dummy.t;
					this.redrawEverything();
				},
				complete: () =>
				{
					this.roundRectFudgePixels = 0;
					this.redrawEverything(true);
				}
			}).finished;
		}

		else
		{
			this.doDrawDots = true;

			await anime({
				targets: dummy,
				t: 1,
				duration: 250,
				easing: "easeOutQuint",
				update: () =>
				{
					this.dotRadiusFraction = .5 * (1 - dummy.t) + .35 * dummy.t;
					this.edgeWidthFraction = .5 * (1 - dummy.t) + .2 * dummy.t;
					this.redrawEverything();
				},
				complete: () =>
				{
					this.dotRadiusFraction = .35;
					this.edgeWidthFraction = .2;
					this.redrawEverything();
				}
			}).finished;
		}
	}

	prepareFrame()
	{
		if (this.threshold !== this.lastthreshold)
		{
			this.needNewFrame = true;
		}
	}

	drawFrame()
	{
		const newthreshold = this.threshold;

		if (this.threshold > this.lastthreshold)
		{
			for (let i = this.lastthreshold + 1; i <= newthreshold; i++)
			{
				for (let j = 0; j < this.connectionsByValue[i - 1].length; j++)
				{
					this.addEdge(...this.connectionsByValue[i - 1][j]);
				}
			}

			this.joinComponents();
		}

		else
		{
			for (let i = this.lastthreshold; i > newthreshold; i--)
			{
				for (let j = 0; j < this.connectionsByValue[i - 1].length; j++)
				{
					this.removeEdge(...this.connectionsByValue[i - 1][j]);
				}
			}

			this.splitComponents();
		}

		this.threshold = newthreshold;
		this.lastthreshold = this.threshold;
	}
}