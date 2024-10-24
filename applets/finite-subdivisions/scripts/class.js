import { Applet } from "../../../scripts/applets/applet.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class FiniteSubdivision extends Applet
{
	resolution = 1000;

	numVertices = 6;
	numIterations = 5;

	webWorker;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,



			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilson = new Wilson(canvas, options);
	}



	run({
		numVertices,
		numIterations,
		maximumSpeed
	}) {
		this.numVertices = numVertices;
		this.numIterations = Math.min(numIterations, 9);

		this.resolution = 3000;

		this.maximumSpeed = maximumSpeed;



		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);



		this.wilson.ctx.lineWidth = 10 - this.numIterations;



		this.webWorker = addTemporaryWorker("/applets/finite-subdivisions/scripts/worker.js");



		this.webWorker.onmessage = (e) =>
		{
			this.wilson.ctx.strokeStyle = convertColor(...e.data[4]);

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(e.data[1], e.data[0]);
			this.wilson.ctx.lineTo(e.data[3], e.data[2]);
			this.wilson.ctx.stroke();
		};



		this.webWorker.postMessage([
			this.numVertices,
			this.numIterations,
			this.resolution,
			this.maximumSpeed
		]);
	}
}