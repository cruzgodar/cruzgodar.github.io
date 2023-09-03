import { Applet } from "/scripts/src/applets.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class DominoShuffling extends Applet
{
	resolution = 2000;
	diamondSize = 20;

	useSmoothColors = true;

	//As a fraction of domino size
	marginSize = .05;

	aztecDiamond = [];
	newDiamond = [];

	hue = [];
	newHue = [];

	age = [];
	newAge = [];

	currentDiamondSize = 1;
	frame = 0;
	framesPerAnimationStep = 1;
	drawDiamondWithHoles = true;

	lastTimestamp = -1;



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

		this.wilson = new Wilson(this.canvas, options);
	}



	run({
		resolution,
		diamondSize,
		useSmoothColors
	})
	{
		this.resolution = resolution;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.diamondSize = diamondSize;

		this.framesPerAnimationStep = Math.ceil(100 / this.diamondSize);

		if (this.diamondSize > 30)
		{
			this.drawDiamondWithHoles = false;
		}

		else
		{
			this.drawDiamondWithHoles = true;
		}

		this.useSmoothColors = useSmoothColors;



		this.aztecDiamond = new Array(this.diamondSize * 2);
		this.newDiamond = new Array(this.diamondSize * 2);

		this.age = new Array(this.diamondSize * 2);
		this.newAge = new Array(this.diamondSize * 2);

		this.hue = new Array(this.diamondSize * 2);
		this.newHue = new Array(this.diamondSize * 2);

		for (let i = 0; i < this.diamondSize * 2; i++)
		{
			this.aztecDiamond[i] = new Array(this.diamondSize * 2);
			this.newDiamond[i] = new Array(this.diamondSize * 2);

			this.age[i] = new Array(this.diamondSize * 2);
			this.newAge[i] = new Array(this.diamondSize * 2);

			this.hue[i] = new Array(this.diamondSize * 2);
			this.newHue[i] = new Array(this.diamondSize * 2);

			for (let j = 0; j < this.diamondSize * 2; j++)
			{
				this.aztecDiamond[i][j] = 0;
				this.age[i][j] = 0;
				this.hue[i][j] = 0;
			}
		}

		//Initialize the size 1 diamond.
		if (Math.random() < .5)
		{
			//Horizontal
			this.aztecDiamond[this.diamondSize - 1][this.diamondSize - 1] = -1;
			this.aztecDiamond[this.diamondSize][this.diamondSize - 1] = 1;

			this.age[this.diamondSize - 1][this.diamondSize - 1] = 1;
			this.age[this.diamondSize][this.diamondSize - 1] = 1;

			if (this.useSmoothColors)
			{
				this.hue[this.diamondSize - 1][this.diamondSize - 1] =
					.75 - Math.atan2(-.5, -.5) / (2 * Math.PI);

				this.hue[this.diamondSize][this.diamondSize - 1] =
					.75 - Math.atan2(.5, -.5) / (2 * Math.PI);
			}

			else
			{
				this.hue[this.diamondSize - 1][this.diamondSize - 1] = 0;
				this.hue[this.diamondSize][this.diamondSize - 1] = .5;
			}
		}

		else
		{
			//Vertical
			this.aztecDiamond[this.diamondSize - 1][this.diamondSize - 1] = -2;
			this.aztecDiamond[this.diamondSize - 1][this.diamondSize] = 2;

			this.age[this.diamondSize - 1][this.diamondSize - 1] = 1;
			this.age[this.diamondSize - 1][this.diamondSize] = 1;

			if (this.useSmoothColors)
			{
				this.hue[this.diamondSize - 1][this.diamondSize - 1] =
					.75 - Math.atan2(-.5, -.5) / (2 * Math.PI);

				this.hue[this.diamondSize - 1][this.diamondSize] =
					.75 - Math.atan2(-.5, .5) / (2 * Math.PI);
			}

			else
			{
				this.hue[this.diamondSize - 1][this.diamondSize - 1] = .25;
				this.hue[this.diamondSize - 1][this.diamondSize] = .75;
			}
		}



		this.currentDiamondSize = 1;

		this.frame = this.framesPerAnimationStep - 1;

		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}



		this.frame++;

		if (this.frame === this.framesPerAnimationStep)
		{
			this.frame = 0;

			this.moveDominos();

			this.fillSpaces();

			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

			this.drawDiamond();
		}



		if (this.animationPaused)
		{
			return;
		}



		if (this.frame === 0 && this.currentDiamondSize === this.diamondSize - 1)
		{
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

			this.drawDiamond();

			return;
		}

		else
		{
			if (!this.animationPaused)
			{
				window.requestAnimationFrame(this.drawFrame.bind(this));
			}
		}
	}



	drawDiamond()
	{
		for (let i = -this.currentDiamondSize; i < this.currentDiamondSize; i++)
		{
			for (let j = -this.currentDiamondSize; j < this.currentDiamondSize; j++)
			{
				const row = i + this.diamondSize;
				const col = j + this.diamondSize;

				if (this.aztecDiamond[row][col] !== 0)
				{
					if (Math.abs(this.aztecDiamond[row][col]) === 1)
					{
						this.drawDomino(row, col, true);
					}

					else
					{
						this.drawDomino(row, col, false);
					}
				}
			}
		}
	}



	drawDomino(row, col, isHorizontal)
	{
		const h = this.hue[row][col];

		const s = 1 - .8 * Math.pow((this.age[row][col] - 1) / this.currentDiamondSize, 4);

		const rgb = this.wilson.utils.hsvToRgb(h, s, 1);

		this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;



		const x = this.resolution * (.1 + (col + this.marginSize) / (this.diamondSize * 2) * .8);
		const y = this.resolution * (.1 + (row + this.marginSize) / (this.diamondSize * 2) * .8);

		if (isHorizontal)
		{
			this.wilson.ctx.fillRect(
				x,
				y,
				this.resolution * (2 - 2 * this.marginSize) / (this.diamondSize * 2) * .8,
				this.resolution * (1 - 2 * this.marginSize) / (this.diamondSize * 2) * .8
			);
		}

		else
		{
			this.wilson.ctx.fillRect(
				x,
				y,
				this.resolution * (1 - 2 * this.marginSize) / (this.diamondSize * 2) * .8,
				this.resolution * (2 - 2 * this.marginSize) / (this.diamondSize * 2) * .8
			);
		}
	}



	moveDominos()
	{
		for (let i = 0; i < this.diamondSize * 2; i++)
		{
			for (let j = 0; j < this.diamondSize * 2; j++)
			{
				this.newDiamond[i][j] = 0;
				this.newAge[i][j] = 0;
				this.newHue[i][j] = 0;
			}
		}



		//First deal with cancellations.
		for (let i = 0; i < 2 * this.diamondSize; i++)
		{
			for (let j = 0; j < 2 * this.diamondSize; j++)
			{
				if (this.aztecDiamond[i][j] !== 0)
				{
					if (Math.abs(this.aztecDiamond[i][j]) === 1)
					{
						//If there's something there already, delete it.
						if (
							this.aztecDiamond[i + this.aztecDiamond[i][j]][j]
								=== -this.aztecDiamond[i][j]
						)
						{
							this.aztecDiamond[i + this.aztecDiamond[i][j]][j] = 0;
							this.aztecDiamond[i][j] = 0;
						}
					}

					else
					{
						//If there's something there already, delete it.
						if (
							this.aztecDiamond[i][j + Math.sign(this.aztecDiamond[i][j])]
								=== -this.aztecDiamond[i][j]
						)
						{
							this.aztecDiamond[i][j + Math.sign(this.aztecDiamond[i][j])] = 0;
							this.aztecDiamond[i][j] = 0;
						}
					}
				}
			}
		}



		//Now it's safe to move the dominos that can move.
		for (let i = 0; i < 2 * this.diamondSize; i++)
		{
			for (let j = 0; j < 2 * this.diamondSize; j++)
			{
				if (this.aztecDiamond[i][j] !== 0)
				{
					if (Math.abs(this.aztecDiamond[i][j]) === 1)
					{
						this.newDiamond[i + this.aztecDiamond[i][j]][j] = this.aztecDiamond[i][j];
						this.newAge[i + this.aztecDiamond[i][j]][j] = this.age[i][j];
						this.newHue[i + this.aztecDiamond[i][j]][j] = this.hue[i][j];
					}

					else
					{
						this.newDiamond[i][j + Math.sign(this.aztecDiamond[i][j])]
							= this.aztecDiamond[i][j];

						this.newAge[i][j + Math.sign(this.aztecDiamond[i][j])] = this.age[i][j];
						this.newHue[i][j + Math.sign(this.aztecDiamond[i][j])] = this.hue[i][j];
					}
				}
			}
		}



		for (let i = 0; i < this.diamondSize * 2; i++)
		{
			for (let j = 0; j < this.diamondSize * 2; j++)
			{
				this.aztecDiamond[i][j] = this.newDiamond[i][j];
				this.age[i][j] = this.newAge[i][j];
				this.hue[i][j] = this.newHue[i][j];
			}
		}

		this.currentDiamondSize++;
	}



	fillSpaces()
	{
		//Now the diamond has a bunch of 2x2 holes in it,
		//and we need to fill them with two parallel dominos each.
		for (let i = -this.currentDiamondSize; i < this.currentDiamondSize; i++)
		{
			for (let j = -this.currentDiamondSize; j < this.currentDiamondSize; j++)
			{
				if (
					Math.abs(i + .5) + Math.abs(j + .5) <= this.currentDiamondSize
					&& Math.abs(i + 1.5) + Math.abs(j + .5) <= this.currentDiamondSize
					&& Math.abs(i + .5) + Math.abs(j + 1.5) <= this.currentDiamondSize
					&& Math.abs(i + 1.5) + Math.abs(j + 1.5) <= this.currentDiamondSize
				)
				{
					const row = i + this.diamondSize;
					const col = j + this.diamondSize;

					//The extra checks are needed because
					//we only record the top/bottom square of a domino.
					if (
						this.aztecDiamond[row][col] === 0
						&& this.aztecDiamond[row + 1][col] === 0
						&& this.aztecDiamond[row][col + 1] === 0
						&& this.aztecDiamond[row + 1][col + 1] === 0
						&& Math.abs(this.aztecDiamond[row - 1][col]) !== 2
						&& Math.abs(this.aztecDiamond[row - 1][col + 1]) !== 2
						&& Math.abs(this.aztecDiamond[row][col - 1]) !== 1
						&& Math.abs(this.aztecDiamond[row + 1][col - 1]) !== 1
					)
					{
						this.fillSpace(row, col);
					}
				}
			}
		}
	}



	fillSpace(row, col)
	{
		if (Math.random() < .5)
		{
			//Horizontal
			this.aztecDiamond[row][col] = -1;
			this.aztecDiamond[row + 1][col] = 1;

			this.age[row][col] = this.currentDiamondSize;
			this.age[row + 1][col] = this.currentDiamondSize;

			if (this.useSmoothColors)
			{
				this.hue[row][col] = .75 - Math.atan2(
					row + .5 - this.diamondSize, col + .5 - this.diamondSize
				) / (2 * Math.PI);

				this.hue[row + 1][col] = .75 - Math.atan2(
					row + 1.5 - this.diamondSize, col + .5 - this.diamondSize
				) / (2 * Math.PI);
			}

			else
			{
				this.hue[row][col] = 0;
				this.hue[row + 1][col] = .5;
			}
		}

		else
		{
			//Vertical
			this.aztecDiamond[row][col] = -2;
			this.aztecDiamond[row][col + 1] = 2;

			this.age[row][col] = this.currentDiamondSize;
			this.age[row][col + 1] = this.currentDiamondSize;

			if (this.useSmoothColors)
			{
				this.hue[row][col] = .75 - Math.atan2(
					row + .5 - this.diamondSize, col + .5 - this.diamondSize
				) / (2 * Math.PI);
				
				this.hue[row][col + 1] = .75 - Math.atan2(
					row + .5 - this.diamondSize, col + 1.5 - this.diamondSize
				) / (2 * Math.PI);
			}

			else
			{
				this.hue[row][col] = .25;
				this.hue[row][col + 1] = .75;
			}
		}
	}
}