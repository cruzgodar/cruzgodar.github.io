import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { normalize } from "/scripts/applets/raymarchApplet.js";
import { sleep } from "/scripts/src/utils.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class JuliaSetCpu extends AnimationFrameApplet
{
	imageData;

	maxWorldSize;
	bailoutRadius;

	numIterations = 500;
	c = [0, 0];
	
	resolution;



	constructor({
		canvas,
		maxWorldSize = 4,
		bailoutRadius = 4,
		c = [0, 0],
		resolution = 500,
	}) {
		super(canvas);

		const options = {
			canvasWidth: resolution,

			worldWidth: 4,
			worldCenterX: 0,
			worldCenterY: 0,

			minWorldX: -maxWorldSize / 2,
			maxWorldX: maxWorldSize / 2,
			minWorldY: -maxWorldSize / 2,
			maxWorldY: maxWorldSize / 2,
			minWorldWidth: 0.00001,
			minWorldHeight: 0.00001,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: () => this.needNewFrame = true,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			fullscreenOptions: {
				onSwitch: this.switchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonCPU(canvas, options);

		this.run({
			maxWorldSize,
			bailoutRadius,
			c,
			resolution
		});
	}

	

	async run({
		maxWorldSize = this.maxWorldSize,
		bailoutRadius = this.bailoutRadius,
		c = [0, 0],
		resolution = this.resolution,
	}) {
		this.c = c;
		this.maxWorldSize = maxWorldSize;
		this.bailoutRadius = bailoutRadius;
		this.resolution = resolution;

		this.imageData = new Uint8ClampedArray(this.resolution * this.resolution * 4);
		for (let i = 0; i < this.resolution * this.resolution; i++)
		{
			this.imageData[4 * i + 3] = 255;
		}

		this.needNewFrame = true,
		this.resume();
	}

	

	drawFrame()
	{
		for (let i = 0; i < this.resolution; i++)
		{
			for (let j = 0; j < this.resolution; j++)
			{
				const index = (this.resolution * (this.resolution - i - 1) + j) * 4;

				let z = [
					(j / this.resolution - 0.5) * this.wilson.worldWidth + this.wilson.worldCenterX,
					// eslint-disable-next-line max-len
					(i / this.resolution - 0.5) * this.wilson.worldHeight + this.wilson.worldCenterY,
				];

				const colorAdjust = 0.1 / Math.sqrt(z[0] * z[0] + z[1] * z[1]);

				const color = normalize([
					Math.abs(z[0] + z[1]) / 2 + colorAdjust,
					Math.abs(z[0]) / 2 + colorAdjust,
					Math.abs(z[1]) / 2 + colorAdjust,
				]);

				let r = Math.sqrt(z[0] * z[0] + z[1] * z[1]);

				let brightness = Math.exp(-r);
				
				let iteration;

				for (iteration = 0; iteration < this.numIterations; iteration++)
				{
					if (r >= this.bailoutRadius)
					{
						break;
					}
					
					z = [
						z[0] * z[0] - z[1] * z[1] + this.c[0],
						2 * z[0] * z[1] + this.c[1]
					];

					r = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
					
					brightness += Math.exp(-r);
				}

				if (iteration == this.numIterations)
				{
					brightness = 0;
				}

				this.imageData[index + 0] = brightness / 5.5 * 255 * color[0];
				this.imageData[index + 1] = brightness / 5.5 * 255 * color[1];
				this.imageData[index + 2] = brightness / 5.5 * 255 * color[2];
			}
		}

		this.wilson.drawFrame(this.imageData);
	}

	switchFullscreen()
	{
		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.animationPaused = true;

		await sleep(33);
	}
}