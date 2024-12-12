import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class BrownianTree extends AnimationFrameApplet
{
	resolution = 500;
	imageData;
	webWorker;



	constructor({ canvas })
	{
		super(canvas);

		const options = {
			canvasWidth: this.resolution,
			reduceMotion: siteSettings.reduceMotion,

			fullscreenOptions: {
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonCPU(canvas, options);
	}



	run({ resolution })
	{
		this.resolution = resolution;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.imageData = new Uint8ClampedArray(this.resolution * this.resolution * 4);

		for (let i = 0; i < this.resolution * this.resolution; i++)
		{
			this.imageData[4 * i + 3] = 255;
		}

		this.wilson.drawFrame(this.imageData);

		

		if (this.webWorker)
		{
			this.webWorker.terminate();
		}

		this.webWorker = addTemporaryWorker("/applets/brownian-trees/scripts/worker.js");

		this.webWorker.onmessage = (e) =>
		{
			const index = e.data[0] * this.resolution + e.data[1];
			this.imageData[4 * index] = e.data[2][0];
			this.imageData[4 * index + 1] = e.data[2][1];
			this.imageData[4 * index + 2] = e.data[2][2];
			this.needNewFrame = true;
		};

		this.webWorker.postMessage([this.resolution]);

		this.resume();
	}

	drawFrame()
	{
		this.wilson.drawFrame(this.imageData);
	}
}