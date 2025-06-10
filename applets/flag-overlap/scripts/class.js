import { Applet, rgbToHsv } from "/scripts/applets/applet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonCPU } from "/scripts/wilson.js";

const hThreshold = 0.05;
const sThreshold = 0.45;
const vThreshold = 0.4;

export class FlagOverlap extends Applet
{
	possibleFlags = [];
	won = false;
	currentlyAnimating = false;

	guessCanvases;
	overlayCanvases;
	progressBars;
	winOverlay;

	wilsonOverlay;

	wilsonCorrectFlag;
	// Double the resolution of the flag images.
	resolution = 2048;
	correctFlag;
	correctPixels;
	correctHsv;
	lastGuessFlagId;

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
	}



	chooseCorrectFlag()
	{
		this.correctFlag = this.possibleFlags[
			Math.floor(Math.random() * this.possibleFlags.length)
		];
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

		img.src = `/applets/flag-overlap/graphics/${flagId}.webp`;

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
		if (this.won || this.currentlyAnimating)
		{
			console.log(this.won);
			return;
		}

		this.currentlyAnimating = true;

		if (this.correctFlag === undefined)
		{
			this.chooseCorrectFlag();

			const returnValue = await this.drawFlag(this.wilsonCorrectFlag, this.correctFlag);
			this.correctPixels = returnValue.pixels;
			this.correctHsv = returnValue.hsvData;
		}

		const guess = {};
		this.lastGuessFlagId = flagId;
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

		console.log(this.guessCanvases[this.guesses.length]);

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

			guess.matchingPixels[i] = guess.hsvData[3 * i + 2] === 0
				? deltaV === 0 // Black guesses only overlap with black pixels.
				: (deltaH < hThreshold && deltaS < sThreshold && deltaV < vThreshold);

			if (!guess.matchingPixels[i])
			{
				guess.pixels[4 * i] = 32;
				guess.pixels[4 * i + 1] = 32;
				guess.pixels[4 * i + 2] = 32;
				guess.pixels[4 * i + 3] = 255;
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
				duration: 250
			}),

			changeOpacity({
				element: this.wilsonOverlay.canvas,
				opacity: 1,
				duration: 250
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
			await sleep(100);

			await Promise.all([
				changeOpacity({
					element: guess.wilsonOverlay.canvas,
					opacity: 0,
					duration: 250
				}),

				changeOpacity({
					element: this.wilsonOverlay.canvas,
					opacity: 0,
					duration: 250
				})
			]);
		}

		this.currentlyAnimating = false;
	}



	async win()
	{
		this.currentlyAnimating = true;
		this.won = true;

		await sleep(200);

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

		this.currentlyAnimating = false;
	}

	

	async replaceGuessCanvas(index)
	{
		this.guesses[index].wilson.destroy();
		this.guesses[index].wilsonOverlay.destroy();

		const newGuessCanvas = document.createElement("canvas");
		newGuessCanvas.classList.add("guess-canvas");
		newGuessCanvas.style.position = "absolute";
		newGuessCanvas.style.top = "0";
		newGuessCanvas.style.left = "0";

		this.guessCanvases[index].parentNode.insertBefore(
			newGuessCanvas,
			this.guessCanvases[index]
		);

		const newOverlayCanvasContainer = document.createElement("div");
		newOverlayCanvasContainer.classList.add("overlay-canvas-container");

		this.guessCanvases[index].parentNode.insertBefore(
			newOverlayCanvasContainer,
			this.overlayCanvases[index].parentNode
		);

		const newOverlayCanvas = document.createElement("canvas");
		newOverlayCanvas.classList.add("overlay-canvas");

		newOverlayCanvasContainer.appendChild(newOverlayCanvas);

		await Promise.all([
			changeOpacity({
				element: this.guessCanvases[index],
				opacity: 0,
				duration: 250
			}),
			changeOpacity({
				element: this.overlayCanvases[index],
				opacity: 0,
				duration: 250
			})
		]);

		newGuessCanvas.style.position = "";
		this.guessCanvases[index].remove();
		this.overlayCanvases[index].parentNode.remove();

		this.guessCanvases[index] = newGuessCanvas;
		this.overlayCanvases[index] = newOverlayCanvas;
	}

	async replaceMainCanvas()
	{
		// this.wilsonOverlay.canvas.style.transition = "";
		// await new Promise(resolve =>
		// {
		// 	requestAnimationFrame(() => resolve());
		// });

		// this.wilsonOverlay.canvas.style.margin = "0";
		// this.wilsonOverlay.canvas.style.padding = "0";
		// this.wilsonOverlay.canvas.style.borderRadius = "8px";

		this.wilson.destroy();
		this.wilsonOverlay.destroy();

		const newGuessCanvas = document.createElement("canvas");
		newGuessCanvas.id = "output-canvas";
		newGuessCanvas.classList.add("output-canvas");
		newGuessCanvas.style.position = "absolute";
		newGuessCanvas.style.top = "0";
		newGuessCanvas.style.left = "0";

		this.wilson.canvas.parentNode.insertBefore(
			newGuessCanvas,
			this.wilson.canvas
		);

		const newOverlayCanvas = document.createElement("canvas");
		newOverlayCanvas.id = "overlay-canvas";
		newOverlayCanvas.classList.add("output-canvas");
		newOverlayCanvas.style.position = "absolute";
		newOverlayCanvas.style.top = "0";
		newOverlayCanvas.style.left = "0";

		this.wilsonOverlay.canvas.parentNode.insertBefore(
			newOverlayCanvas,
			this.wilsonOverlay.canvas
		);

		await Promise.all([
			changeOpacity({
				element: this.wilson.canvas,
				opacity: 0,
				duration: 250
			}),
			changeOpacity({
				element: this.wilsonOverlay.canvas,
				opacity: 0,
				duration: 250
			})
		]);

		newGuessCanvas.style.position = "";
		newGuessCanvas.style.top = "";
		newGuessCanvas.style.left = "";
		newOverlayCanvas.style.position = "";
		newOverlayCanvas.style.top = "";
		newOverlayCanvas.style.left = "";

		this.wilson.canvas.remove();
		this.wilsonOverlay.canvas.remove();

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

		await new Promise(resolve =>
		{
			requestAnimationFrame(() => resolve());
		});

		this.wilson = new WilsonCPU(newGuessCanvas, options);
		this.wilsonOverlay = new WilsonCPU(newOverlayCanvas, options);
	}

	async replay()
	{
		if (this.currentlyAnimating)
		{
			return;
		}

		this.currentlyAnimating = true;

		for (const progressBar of this.progressBars)
		{
			const width = progressBar.getBoundingClientRect().width;
			animate((t) =>
			{
				progressBar.style.width = `${(1 - t) * width}px`;
			}, 250, "easeInOutQuad");
		}

		for (let i = 0; i < this.guesses.length; i++)
		{
			this.replaceGuessCanvas(i);
		}

		this.replaceMainCanvas();


		await changeOpacity({
			element: this.winOverlay,
			opacity: 0,
			duration: 250
		});

		this.winOverlay.display = "none";
		this.winOverlay.style.zIndex = -1;

		this.guesses = [];
		this.correctFlag = undefined;
		this.won = false;
		this.currentlyAnimating = false;
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