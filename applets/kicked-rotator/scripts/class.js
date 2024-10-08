import { Applet } from "../../../scripts/applets/applet.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class KickedRotator extends Applet
{
	webWorker;

	hues = [];
	values = [];
	numWrites = [];



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
		resolution,
		K,
		orbitSeparation
	}) {
		const values = new Array(resolution * resolution);

		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				values[resolution * i + j] = 0;
			}
		}



		this.wilson.changeCanvasSize(resolution, resolution);

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, resolution, resolution);



		this.webWorker = addTemporaryWorker("/applets/kicked-rotator/scripts/worker.js");



		this.webWorker.onmessage = (e) =>
		{
			const valueDelta = e.data[0];
			const hue = e.data[1];

			for (let i = 0; i < resolution; i++)
			{
				for (let j = 0; j < resolution; j++)
				{
					if (valueDelta[resolution * i + j] > values[resolution * i + j])
					{
						const rgb = this.wilson.utils.hsvToRgb(
							hue,
							1,
							valueDelta[resolution * i + j] / 255
						);

						this.wilson.ctx.fillStyle = convertColor(...rgb);

						this.wilson.ctx.fillRect(j, i, 1, 1);

						values[resolution * i + j] = valueDelta[resolution * i + j];
					}
				}
			}
		};



		this.webWorker.postMessage([resolution, K, orbitSeparation]);
	}
}