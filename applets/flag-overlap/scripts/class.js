import { Applet, rgbToHsv } from "/scripts/applets/applet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { pageUrl } from "/scripts/src/main.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonCPU } from "/scripts/wilson.js";

const hThreshold = 0.075;
const sThreshold = 0.4;
const vThreshold = 0.4;

export class FlagOverlap extends Applet
{
	loadPromise;
	guessCanvases;
	overlayCanvases;
	progressBars;
	winOverlay;

	wilsonOverlay;

	wilsonCorrectFlag;
	// Double the resolution of the flag images.
	resolution = 2048;
	correctFlag = "us";
	correctPixels;
	correctHsv;

	// Each entry is an object of the form
	// {
	//	 flagId,
	//   matchingPixels: 1D list of booleans per pixel
	//   pixels: matching pixels that can be drawn to the guess canvas
	//   hsvData: same, but hsv
	//   wilson: instance for drawing
	//   wilsonOverlay: instance for drawing the overlay flag
	// }
	guesses = [];

	showDiffs = true;
	

	constructor({
		canvas,
		overlayCanvas,
		guessCanvases,
		overlayCanvases,
		progressBars,
		winOverlay
	}) {
		super(canvas);

		this.guessCanvases = guessCanvases;
		this.overlayCanvases = overlayCanvases;
		this.progressBars = progressBars;
		this.winOverlay = winOverlay;

		const switchFullscreen = () =>
		{
			if (this.wilson.currentlyFullscreen)
			{
				this.wilson.exitFullscreen();
			}

			else
			{
				this.wilson.enterFullscreen();
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

		this.wilson = new WilsonCPU(canvas, options);
		this.wilsonOverlay = new WilsonCPU(overlayCanvas, options);



		const optionsHidden =
		{
			canvasWidth: this.resolution,
		};

		const hiddenCanvas = this.createHiddenCanvas(true, 1024 / 683);
		this.wilsonCorrectFlag = new WilsonCPU(hiddenCanvas, optionsHidden);

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



	updateMainCanvas()
	{
		const pixels = new Uint8ClampedArray(
			this.wilson.canvasWidth * this.wilson.canvasHeight * 4
		);

		for (let i = 0; i < this.wilson.canvasWidth * this.wilson.canvasHeight; i++)
		{
			pixels[4 * i] = 32;
			pixels[4 * i + 1] = 32;
			pixels[4 * i + 2] = 32;
			pixels[4 * i + 3] = 255;
			
			for (const guess of this.guesses)
			{
				if (guess.matchingPixels[i])
				{
					pixels[4 * i] = this.correctPixels[4 * i];
					pixels[4 * i + 1] = this.correctPixels[4 * i + 1];
					pixels[4 * i + 2] = this.correctPixels[4 * i + 2];
					break;
				}
			}
		}

		this.wilson.ctx.putImageData(new ImageData(
			pixels,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight
		), 0, 0);
	}



	async guessFlag(flagId)
	{
		const guess = {};
		guess.flagId = flagId;
		guess.matchingPixels = new Array(this.wilson.canvasWidth * this.wilson.canvasHeight);

		const switchFullscreen = () =>
		{
			if (guess.wilsonOverlay.currentlyFullscreen)
			{
				guess.wilsonOverlay.exitFullscreen();
			}

			else if (guess.wilson.currentlyFullscreen)
			{
				guess.wilson.exitFullscreen();
			}

			else
			{
				if (this.showDiffs)
				{
					guess.wilson.enterFullscreen();
				}

				else
				{
					guess.wilsonOverlay.enterFullscreen();
				}
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

		guess.wilsonOverlay = new WilsonCPU(
			this.overlayCanvases[this.guesses.length],
			options
		);

		const [returnValue] = await Promise.all([
			this.drawFlag(guess.wilsonOverlay, flagId),
			this.drawFlag(this.wilsonOverlay, flagId)
		]);
		guess.pixels = returnValue.pixels;
		guess.hsvData = returnValue.hsvData;
		let numMatchingPixels = 0;

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

			else
			{
				numMatchingPixels++;
			}
		}

		await Promise.all([
			changeOpacity({
				element: guess.wilsonOverlay.canvas,
				opacity: 1,
				duration: 500
			}),

			changeOpacity({
				element: this.wilsonOverlay.canvas,
				opacity: 1,
				duration: 500
			})
		]);

		guess.wilson.ctx.putImageData(new ImageData(
			guess.pixels,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight
		), 0, 0);

		this.guesses.push(guess);

		this.updateMainCanvas();

		await sleep(100);



		// Animate the progress bar.

		const progressBar = this.progressBars[this.guesses.length - 1];
		const fillProportion = numMatchingPixels
			/ (this.wilson.canvasWidth * this.wilson.canvasHeight);

		await animate((t) =>
		{
			progressBar.style.width = `${t * fillProportion * 100}%`;
			progressBar.style.background = `hsl(${t * fillProportion * 120}, 70%, 50%)`;
		}, 500 + fillProportion * 500, "easeInOutQuad");



		if (flagId === this.correctFlag)
		{
			this.win();
			return;
		}



		if (this.showDiffs)
		{
			await sleep(400);

			await Promise.all([
				changeOpacity({
					element: guess.wilsonOverlay.canvas,
					opacity: 0,
					duration: 300
				}),

				changeOpacity({
					element: this.wilsonOverlay.canvas,
					opacity: 0,
					duration: 300
				})
			]);
		}
	}



	async win()
	{
		await sleep(500);

		this.wilsonOverlay.canvas.style.padding = "24px";
		this.wilsonOverlay.canvas.style.borderColor = "transparent";
		this.wilsonOverlay.canvas.style.marginTop = "-22px";
		this.wilsonOverlay.canvas.style.marginLeft = "-22px";
		this.wilsonOverlay.canvas.style.borderRadius = "32px";
		
		this.winOverlay.style.zIndex = 1;
	
		changeOpacity({
			element: this.winOverlay,
			opacity: 1,
			duration: 300
		});
	}



	setShowDiffs(showDiffs)
	{
		this.showDiffs = showDiffs;

		for (const guess of this.guesses)
		{
			changeOpacity({
				element: guess.wilsonOverlay.canvas,
				opacity: this.showDiffs ? 0 : 1,
				duration: 150
			});
		}
	}
}