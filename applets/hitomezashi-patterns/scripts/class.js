import { Applet } from "/scripts/src/applets.js";
import { Wilson } from "/scripts/wilson.js";

export class HitomezashiPattern extends Applet
{
	doDrawBoundaries = true;
	doDrawRegions = true;
	maximumSpeed = false;

	resolution = null;
	gridSize = null;
	rowProb = null;
	colProb = null;

	patternRows = [];
	patternCols = [];
	regions = [];
	regionsOrdered = [];
	regionSizes = [];
	numRegions = 0;
	numUniqueRegionSizes = 0;
	cellsByRadius = [];

	currentRow = 1;
	currentCol = 1;
	currentRegion = 0;

	lineWidth = null;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: 1000,
			canvasHeight: 1000,



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
		rowProb = .5,
		colProb = .5,
		doDrawBoundaries = true,
		doDrawRegions = true,
		maximumSpeed = false
	})
	{
		this.resolution = resolution;
		this.gridSize = gridSize;
		this.rowProb = rowProb;
		this.colProb = colProb;
		this.doDrawBoundaries = doDrawBoundaries;
		this.doDrawRegions = doDrawRegions;
		this.maximumSpeed = maximumSpeed;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);



		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.wilson.ctx.strokeStyle = "rgb(127, 127, 127)";

		this.lineWidth = this.resolution / this.gridSize / 20;

		this.wilson.ctx.lineWidth = this.lineWidth;



		//These are 0 if there is not a row/col in that position, and 1 if there is.
		this.patternRows = new Array(this.gridSize + 1);
		this.patternCols = new Array(this.gridSize + 1);
		this.regions = new Array(this.gridSize);
		this.regionsOrdered = [];
		this.regionSizes = [];
		this.numRegions = 0;
		this.cellsByRadius = new Array(this.gridSize + 1);

		for (let i = 0; i < this.gridSize + 1; i++)
		{
			this.patternRows[i] = new Array(this.gridSize + 1);
			this.patternCols[i] = new Array(this.gridSize + 1);

			for (let j = 0; j < this.gridSize + 1; j++)
			{
				this.patternRows[i][j] = 0;
				this.patternCols[i][j] = 0;
			}
		}

		for (let i = 0; i < this.gridSize; i++)
		{
			this.regions[i] = new Array(this.gridSize);

			for (let j = 0; j < this.gridSize; j++)
			{
				this.regions[i][j] = -1;
			}
		}

		for (let i = 0; i < this.gridSize + 1; i++)
		{
			this.cellsByRadius[i] = [];
		}



		const middleRow = Math.floor(this.gridSize / 2);

		for (let i = 0; i < this.gridSize; i++)
		{
			for (let j = 0; j < this.gridSize; j++)
			{
				this.cellsByRadius[Math.abs(i - middleRow) + Math.abs(j - middleRow)].push([i, j]);
			}
		}



		//Place the rows.
		for (let i = 0; i < this.gridSize + 1; i++)
		{
			const offset = Math.random() < this.rowProb ? 1 : 0;

			for (let j = offset; j < this.gridSize; j += 2)
			{
				this.patternRows[i][j] = 1;
			}
		}



		//Place the columns.
		for (let i = 0; i < this.gridSize + 1; i++)
		{
			const offset = Math.random() < this.colProb ? 1 : 0;

			for (let j = offset; j < this.gridSize; j += 2)
			{
				this.patternCols[j][i] = 1;
			}
		}



		if (this.maximumSpeed)
		{
			if (this.doDrawBoundaries)
			{
				this.drawBoundaries();
			}

			if (this.doDrawRegions)
			{
				this.identifyRegions();

				this.drawRegions();
			}
		}



		else
		{
			if (this.doDrawBoundaries)
			{
				this.currentRow = 1;
				this.currentCol = 1;

				this.drawBoundaryRowStep();
			}

			else if (this.doDrawRegions)
			{
				this.identifyRegions();

				this.currentRegion = 0;

				this.drawRegionsStep();
			}
		}
	}



	drawBoundaries()
	{
		//We don't include things on the boundary, since they don't
		//play nice with the lines already drawn there.
		for (let i = 1; i < this.gridSize; i++)
		{
			for (let j = 0; j < this.gridSize; j++)
			{
				if (this.patternRows[i][j])
				{
					this.wilson.ctx.beginPath();
					
					this.wilson.ctx.moveTo(
						(this.resolution / this.gridSize) * j,
						(this.resolution / this.gridSize) * i
					);

					this.wilson.ctx.lineTo(
						(this.resolution / this.gridSize) * (j + 1),
						(this.resolution / this.gridSize) * i
					);

					this.wilson.ctx.stroke();
				}
			}
		}



		for (let i = 0; i < this.gridSize; i++)
		{
			for (let j = 1; j < this.gridSize; j++)
			{
				if (this.patternCols[i][j])
				{
					this.wilson.ctx.beginPath();

					this.wilson.ctx.moveTo(
						(this.resolution / this.gridSize) * j,
						(this.resolution / this.gridSize) * i
					);

					this.wilson.ctx.lineTo(
						(this.resolution / this.gridSize) * j,
						(this.resolution / this.gridSize) * (i + 1)
					);

					this.wilson.ctx.stroke();
				}
			}
		}
	}



	drawBoundaryRowStep()
	{
		for (let j = 0; j < this.gridSize; j++)
		{
			if (this.patternRows[this.currentRow][j])
			{
				this.wilson.ctx.beginPath();

				this.wilson.ctx.moveTo(
					(this.resolution / this.gridSize) * j,
					(this.resolution / this.gridSize) * this.currentRow
				);

				this.wilson.ctx.lineTo(
					(this.resolution / this.gridSize) * (j + 1),
					(this.resolution / this.gridSize) * this.currentRow
				);

				this.wilson.ctx.stroke();
			}
		}

		this.currentRow++;

		if (this.currentRow < this.gridSize)
		{
			if (!this.animationPaused)
			{
				window.requestAnimationFrame(this.drawBoundaryRowStep.bind(this));
			}
		}

		else
		{
			if (!this.animationPaused)
			{
				window.requestAnimationFrame(this.drawBoundaryColStep.bind(this));
			}
		}

	}

	drawBoundaryColStep()
	{
		for (let i = 0; i < this.gridSize; i++)
		{
			if (this.patternCols[i][this.currentCol])
			{
				this.wilson.ctx.beginPath();

				this.wilson.ctx.moveTo(
					(this.resolution / this.gridSize) * this.currentCol,
					(this.resolution / this.gridSize) * i
				);

				this.wilson.ctx.lineTo(
					(this.resolution / this.gridSize) * this.currentCol,
					(this.resolution / this.gridSize) * (i + 1)
				);

				this.wilson.ctx.stroke();
			}
		}

		this.currentCol++;

		if (this.currentCol < this.gridSize)
		{
			if (!this.animationPaused)
			{
				window.requestAnimationFrame(this.drawBoundaryColStep.bind(this));
			}
		}

		else if (this.doDrawRegions)
		{
			this.identifyRegions();

			this.currentRegion = 0;

			setTimeout(this.drawRegionsStep.bind(this), 1000);
		}
	}



	identifyRegions()
	{
		//This is kind of a mess, but we're just going to floodfill one region at a time
		//and just use constant colors that range from red in the top left to magenta
		//in the bottom right. That's the goal at least.

		let startRow = 0;
		let startCol = 0;

		for (;;)
		{
			const activeSquares = [[startRow, startCol]];

			this.regions[startRow][startCol] = this.numRegions;

			this.regionsOrdered.push([[startRow, startCol]]);



			while (activeSquares.length !== 0)
			{
				const numActiveSquares = activeSquares.length;

				for (let i = 0; i < numActiveSquares; i++)
				{
					const row = activeSquares[i][0];
					const col = activeSquares[i][1];

					if (
						row > 0
						&& this.regions[row - 1][col] === -1
						&& !(this.patternRows[row][col])
					)
					{
						activeSquares.push([row - 1, col]);

						this.regions[row - 1][col] = this.numRegions;

						this.regionsOrdered[this.numRegions].push([row - 1, col]);
					}

					if (
						row < this.gridSize - 1
						&& this.regions[row + 1][col] === -1
						&& !(this.patternRows[row + 1][col])
					)
					{
						activeSquares.push([row + 1, col]);

						this.regions[row + 1][col] = this.numRegions;

						this.regionsOrdered[this.numRegions].push([row + 1, col]);
					}

					if (
						col > 0
						&& this.regions[row][col - 1] === -1
						&& !(this.patternCols[row][col])
					)
					{
						activeSquares.push([row, col - 1]);

						this.regions[row][col - 1] = this.numRegions;

						this.regionsOrdered[this.numRegions].push([row, col - 1]);
					}

					if (
						col < this.gridSize - 1
						&& this.regions[row][col + 1] === -1
						&& !(this.patternCols[row][col + 1])
					)
					{
						activeSquares.push([row, col + 1]);

						this.regions[row][col + 1] = this.numRegions;

						this.regionsOrdered[this.numRegions].push([row, col + 1]);
					}
				}

				activeSquares.splice(0, numActiveSquares);
			}



			this.regionSizes.push(this.regionsOrdered[this.numRegions].length);



			//Now search radially outward from the center for the next starting square.

			let foundNewStart = false;

			for (let radius = 0; radius <= this.gridSize; radius++)
			{
				for (let i = 0; i < this.cellsByRadius[radius].length; i++)
				{
					const row = this.cellsByRadius[radius][i][0];
					const col = this.cellsByRadius[radius][i][1];

					if (this.regions[row][col] === -1)
					{
						startRow = row;
						startCol = col;

						foundNewStart = true;

						break;
					}
				}

				if (foundNewStart)
				{
					break;
				}
			}

			this.numRegions++;

			if (!foundNewStart)
			{
				break;
			}
		}



		//Get unique values.
		this.regionSizes = [...new Set(this.regionSizes)];

		//Sort descending.
		this.regionSizes.sort((a, b) => b - a);

		this.numUniqueRegionSizes = this.regionSizes.length;
	}



	drawRegions()
	{
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);



		for (let i = 0; i < this.numRegions; i++)
		{
			const regionLength = this.regionsOrdered[i].length;

			//Cycle colors every 2 * gridSize regions (this is just an experimentally good value).
			const h = (i % (2 * this.gridSize)) / (2 * this.gridSize);

			//Color the largest regions darkest, but linearly according to the list of lengths,
			//so that all the medium regions aren't extremely bright
			//when there's a very large region.
			const v = regionLength === 1
				? .5
				: Math.sqrt(
					this.regionSizes.indexOf(regionLength) / (this.numUniqueRegionSizes - 2)
				);

			const rgb = this.wilson.utils.hsvToRgb(h, 1, v);

			this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;



			for (let j = 0; j < regionLength; j++)
			{
				const row = this.regionsOrdered[i][j][0];
				const col = this.regionsOrdered[i][j][1];

				this.wilson.ctx.fillRect(
					(this.resolution / this.gridSize) * col + this.lineWidth / 2,
					(this.resolution / this.gridSize) * row + this.lineWidth / 2,
					this.resolution / this.gridSize - this.lineWidth,
					this.resolution / this.gridSize - this.lineWidth
				);
			}
		}
	}



	drawRegionsStep()
	{
		for (let i = 0; i < Math.ceil(this.gridSize / 50); i++)
		{
			const regionLength = this.regionsOrdered[this.currentRegion].length;

			//Cycle colors every gridSize regions (this is just an experimentally good value).
			const h = (this.currentRegion % (2 * this.gridSize)) / (2 * this.gridSize);

			//Color the largest regions darkest, but linearly according to the list of lengths,
			//so that all the medium regions aren't extremely bright when there's
			//a very large region.
			const v = regionLength === 1
				? .5
				: Math.sqrt(
					this.regionSizes.indexOf(regionLength) / (this.numUniqueRegionSizes - 2)
				);

			const rgb = this.wilson.utils.hsvToRgb(h, 1, v);


			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";

			for (let j = 0; j < regionLength; j++)
			{
				const row = this.regionsOrdered[this.currentRegion][j][0];
				const col = this.regionsOrdered[this.currentRegion][j][1];

				this.wilson.ctx.fillRect(
					(this.resolution / this.gridSize) * col,
					(this.resolution / this.gridSize) * row,
					this.resolution / this.gridSize,
					this.resolution / this.gridSize
				);
			}


			this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

			for (let j = 0; j < regionLength; j++)
			{
				const row = this.regionsOrdered[this.currentRegion][j][0];
				const col = this.regionsOrdered[this.currentRegion][j][1];

				this.wilson.ctx.fillRect(
					(this.resolution / this.gridSize) * col + this.lineWidth / 2,
					(this.resolution / this.gridSize) * row + this.lineWidth / 2,
					this.resolution / this.gridSize - this.lineWidth,
					this.resolution / this.gridSize - this.lineWidth
				);
			}



			this.currentRegion++;

			if (this.currentRegion === this.numRegions)
			{
				return;
			}
		}

		if (this.currentRegion < this.numRegions)
		{
			if (!this.animationPaused)
			{
				window.requestAnimationFrame(this.drawRegionsStep.bind(this));
			}
		}
	}
}