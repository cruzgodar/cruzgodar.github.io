import { Applet, rgbToHsv } from "/scripts/applets/applet.js";
import { pageUrl } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

const hThreshold = 0.075;
const sThreshold = 0.4;
const vThreshold = 0.4;

export class FlagOverlap extends Applet
{
	loadPromise;
	guessCanvases;

	wilsonCorrectFlag;
	// Double the resolution of the flag images.
	resolution = 2048;
	correctFlag = "bw";
	correctPixels;
	correctHsv;
	// Each entry is an object of the form
	// {
	//	 flagId,
	//   matchingPixels: 1D list of booleans per pixel
	//   pixels: matching pixels that can be drawn to the guess canvas
	//   hsvData: same, but hsv
	//   wilson: instance for drawing
	// }
	guesses = [];
	

	constructor({ canvas, guessCanvases })
	{
		super(canvas);

		this.guessCanvases = guessCanvases;

		const options =
		{
			canvasWidth: this.resolution,

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonCPU(canvas, options);

		const hiddenCanvas = this.createHiddenCanvas(true, 1024 / 683);
		this.wilsonCorrectFlag = new WilsonCPU(hiddenCanvas, options);

		this.loadPromise = new Promise(resolve =>
		{
			this.drawFlag(this.wilsonCorrectFlag, this.correctFlag)
				.then(returnValue =>
				{
					this.correctPixels = returnValue.pixels;
					this.correctHsv = returnValue.hsvData;
					resolve();
				});
		});
	}



	// Draws the flag on the given wilson's canvas and parses it as hsv.
	async drawFlag(wilson, flagId)
	{
		let resolve;
		const promise = new Promise(r => resolve = r);

		const img = new Image();
		
		img.onload = () =>
		{
			wilson.ctx.drawImage(img, 0, 0, wilson.canvasWidth, wilson.canvasHeight);
			resolve();
		};

		img.src = `${pageUrl}/graphics/${flagId}.png`;

		await promise;

		const pixels = wilson.ctx.getImageData(
			0,
			0,
			wilson.canvasWidth,
			wilson.canvasHeight,
		).data;

		const hsvData = new Array(wilson.canvasWidth * wilson.canvasHeight * 3);

		for (let i = 0; i < wilson.canvasWidth * wilson.canvasHeight; i++)
		{
			const hsv = rgbToHsv(pixels[4 * i], pixels[4 * i + 1], pixels[4 * i + 2]);

			hsvData[3 * i] = hsv[0];
			hsvData[3 * i + 1] = hsv[1];
			hsvData[3 * i + 2] = hsv[2];
		}

		return {
			pixels,
			hsvData
		};
	}



	// Animates the given wilson to the pixels passed.
	async animateToImageData(wilson, newPixels)
	{
		const pixels = wilson.ctx.getImageData(
			0,
			0,
			wilson.canvasWidth,
			wilson.canvasHeight,
		).data;
	}



	updateMainCanvas()
	{
		const data = new Uint8ClampedArray(this.wilson.canvasWidth * this.wilson.canvasHeight * 4);

		for (let i = 0; i < this.wilson.canvasWidth * this.wilson.canvasHeight; i++)
		{
			data[4 * i] = 32;
			data[4 * i + 1] = 32;
			data[4 * i + 2] = 32;
			data[4 * i + 3] = 255;
			
			for (const guess of this.guesses)
			{
				if (guess.matchingPixels[i])
				{
					data[4 * i] = this.correctPixels[4 * i];
					data[4 * i + 1] = this.correctPixels[4 * i + 1];
					data[4 * i + 2] = this.correctPixels[4 * i + 2];
					break;
				}
			}
		}

		const imageData = new ImageData(
			data,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight
		);
	}



	async guessFlag(flagId)
	{
		const guess = {};
		guess.flagId = flagId;
		guess.matchingPixels = new Array(this.wilson.canvasWidth * this.wilson.canvasHeight);

		const returnValue = await this.drawFlag(this.wilson, flagId);
		guess.pixels = returnValue.pixels;
		guess.hsvData = returnValue.hsvData;

		for (let i = 0; i < this.wilson.canvasWidth * this.wilson.canvasHeight; i++)
		{
			const deltaHTemp = Math.abs(guess.hsvData[3 * i] - this.correctHsv[3 * i]);
			const deltaH = Math.min(deltaHTemp, 1 - deltaHTemp);

			const deltaS = Math.abs(guess.hsvData[3 * i + 1] - this.correctHsv[3 * i + 1]);
			const deltaV = Math.abs(guess.hsvData[3 * i + 2] - this.correctHsv[3 * i + 2]);

			guess.matchingPixels[i] = deltaH < hThreshold
				&& deltaS < sThreshold
				&& deltaV < vThreshold;
			if (!guess.matchingPixels[i])
			{
				guess.pixels[4 * i] = 32;
				guess.pixels[4 * i + 1] = 32;
				guess.pixels[4 * i + 2] = 32;
			}
		}



		const switchFullscreen = () =>
		{
			if (guess.wilson.currentlyFullscreen)
			{
				guess.wilson.exitFullscreen();
			}

			else
			{
				guess.wilson.enterFullscreen();
			}
		};

		const options =
		{
			canvasWidth: this.resolution,

			interactionOptions: {
				callbacks: {
					mousedown: switchFullscreen,
					touchstart: switchFullscreen
				},
			},
		};

		guess.wilson = new WilsonCPU(
			this.guessCanvases[this.guesses.length],
			options
		);

		const imageData = new ImageData(
			guess.pixels,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight
		);

		guess.wilson.ctx.putImageData(imageData, 0, 0);

		this.guesses.push(guess);

		
		

	}
}