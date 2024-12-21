import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";


export class WilsonsAlgorithm extends AnimationFrameApplet
{
	webWorker;
	maximumSpeed = false;
	gridSize;
	resolution = 1000;
	imageData;
	pixels = [];

	constructor({ canvas })
	{
		super(canvas);

		const options = {
			canvasWidth: this.resolution,
			fullscreenOptions: {
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonCPU(canvas, options);
		this.canvas.style.imageRendering = "pixelated";
	}

	run({
		gridSize,
		maximumSpeed,
		noBorders,
		reverseGenerateSkeleton = false
	}) {
		let timeoutId;

		this.gridSize = gridSize;
		this.resolution = noBorders ? gridSize : 2 * gridSize + 1;
		this.maximumSpeed = maximumSpeed;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.imageData = new Uint8ClampedArray(this.resolution * this.resolution * 4);
		for (let i = 0; i < this.resolution * this.resolution; i++)
		{
			this.imageData[4 * i + 3] = 255;
		}

		this.pixels = [];

		this.webWorker = addTemporaryWorker("/applets/wilsons-algorithm/scripts/worker.js");

		this.webWorker.onmessage = e =>
		{
			clearTimeout(timeoutId);

			this.pixels.push(...e.data);

			this.needNewFrame = true;
		};

		// The worker has three seconds to draw its initial line.
		// If it can't do that, we cancel it and spawn a new worker
		// that reverse-generates a skeleton.
		if (!reverseGenerateSkeleton)
		{
			timeoutId = setTimeout(() =>
			{
				this.run({
					gridSize,
					maximumSpeed,
					noBorders,
					reverseGenerateSkeleton: true
				});
			}, 3000);
		}

		this.webWorker.postMessage([gridSize, noBorders, reverseGenerateSkeleton]);

		this.resume();
	}

	drawFrame()
	{
		const numPixelsToDraw = this.maximumSpeed
			? this.pixels.length
			: Math.min(Math.ceil(this.gridSize * this.gridSize / 200), this.pixels.length);

		for (let i = 0; i < numPixelsToDraw; i++)
		{
			const index = this.pixels[i][0] * this.resolution + this.pixels[i][1];
			this.imageData[4 * index] = this.pixels[i][2][0];
			this.imageData[4 * index + 1] = this.pixels[i][2][1];
			this.imageData[4 * index + 2] = this.pixels[i][2][2];
		}

		this.pixels.splice(0, numPixelsToDraw);

		this.wilson.drawFrame(this.imageData);

		if (this.pixels.length !== 0)
		{
			this.needNewFrame = true;
		}
	}
}