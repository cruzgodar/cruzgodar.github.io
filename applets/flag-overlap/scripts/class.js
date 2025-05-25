import { Applet, rgbToHsv } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

const hThreshold = 0.25;
const sThreshold = 0.25;
const vThreshold = 0.25;

export class FlagOverlap extends Applet
{
	loadPromise;

	wilsonCorrectFlag;
	// Double the resolution of the flag images.
	resolution = 2048;
	correctFlag = "md";
	correctPixels;
	correctHsv;
	guesses = [];
	

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,

			interactionOptions: {
				callbacks: {
					// mousedown: this.onGrabCanvas.bind(this),
					// touchstart: this.onGrabCanvas.bind(this),
					// mousedrag: this.onGrabCanvas.bind(this),
					// touchmove: this.onGrabCanvas.bind(this),
					// mouseup: this.onReleaseCanvas.bind(this),
					// touchend: this.onReleaseCanvas.bind(this),
				},
			},

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonCPU(canvas, options);

		const hiddenCanvas = this.createHiddenCanvas(false);
		hiddenCanvas.style.setProperty("aspect-ratio", "1024 / 683", "important");
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

		img.src = `graphics/${flagId}.png`;

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
				guess.pixels[4 * i] = 0;
				guess.pixels[4 * i + 1] = 0;
				guess.pixels[4 * i + 2] = 0;
			}
		}

		const imageData = new ImageData(
			guess.pixels,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight
		);
		this.wilson.ctx.putImageData(imageData, 0, 0);
	}
}