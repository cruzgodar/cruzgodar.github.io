import { Applet } from "../../../scripts/applets/applet.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class ChaosGame extends Applet
{
	resolution = 500;

	webWorker;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "hybrid",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,



			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilson = new Wilson(canvas, options);
	}



	run({ resolution, numVertices })
	{
		this.resolution = resolution;
		this.numVertices = numVertices;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.webWorker = addTemporaryWorker("/applets/chaos-game/scripts/worker.js");

		this.webWorker.onmessage = (e) => this.wilson.render.drawFrame(e.data[0]);

		this.webWorker.postMessage([this.numVertices, this.resolution]);
	}
}