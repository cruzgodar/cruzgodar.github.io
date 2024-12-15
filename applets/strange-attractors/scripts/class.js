import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonCPU } from "/scripts/wilson.js";

const brightnessScale = 10;

export class StrangeAttractors extends AnimationFrameApplet
{
	webWorker;
	brightnesses;
	imageData;
	pixels;



	constructor({ canvas })
	{
		super(canvas);

		const options = {
			canvasWidth: 500,
			reduceMotion: siteSettings.reduceMotion,

			fullscreenOptions: {
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonCPU(canvas, options);
	}



	run({
		resolution,
		sigma,
		rho,
		beta,
		maximumSpeed,
	}) {
		this.resolution = resolution;
		this.maximumSpeed = maximumSpeed;
		
		this.wilson.resizeCanvas({ width: this.resolution });

		this.pixels = [];
		this.imageData = new Uint8ClampedArray(this.resolution * this.resolution * 4);

		for (let i = 0; i < this.resolution * this.resolution; i++)
		{
			this.imageData[4 * i + 3] = 255;
		}

		this.brightnesses = new Uint8ClampedArray(this.resolution * this.resolution);



		this.webWorker = addTemporaryWorker("/applets/strange-attractors/scripts/worker.js");

		this.webWorker.onmessage = e =>
		{
			this.pixels.push(...e.data);

			this.needNewFrame = true;
		};

		this.webWorker.postMessage([resolution, sigma, rho, beta]);
		this.resume();
	}

	drawFrame()
	{
		const numPixelsToDraw = this.maximumSpeed
			? this.pixels.length
			: Math.min(Math.ceil(this.resolution * this.resolution / 100), this.pixels.length);

		for (let i = 0; i < numPixelsToDraw; i++)
		{
			const index = this.pixels[i][0] * this.resolution + this.pixels[i][1];

			this.brightnesses[index]++;
			const brightnessAdjust = this.brightnesses[index] / brightnessScale;
			
			this.imageData[4 * index] = this.pixels[i][2][0] * brightnessAdjust;
			this.imageData[4 * index + 1] = this.pixels[i][2][1] * brightnessAdjust;
			this.imageData[4 * index + 2] = this.pixels[i][2][2] * brightnessAdjust;
		}

		this.pixels.splice(0, numPixelsToDraw);

		this.wilson.drawFrame(this.imageData);

		if (this.pixels.length !== 0)
		{
			this.needNewFrame = true;
		}
	}
}