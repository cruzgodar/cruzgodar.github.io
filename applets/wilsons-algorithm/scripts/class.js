import { Applet } from "/scripts/src/applets.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";


export class WilsonsAlgorithm extends Applet
{
	webWorker = null;



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
		gridSize,
		maximumSpeed,
		noBorders,
		reverseGenerateSkeleton = false
	}) {
		let timeoutId = null;



		const canvasDim = noBorders ? gridSize : 2 * gridSize + 1;

		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		const canvasPixels = Math.min(window.innerWidth, window.innerHeight);

		const canvasScaleFactor = Math.ceil(canvasPixels / canvasDim);



		this.wilson.changeCanvasSize(canvasDim * canvasScaleFactor, canvasDim * canvasScaleFactor);

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(
			0,
			0,
			canvasDim * canvasScaleFactor,
			canvasDim * canvasScaleFactor
		);



		this.webWorker = addTemporaryWorker("/applets/wilsons-algorithm/scripts/worker.js");



		this.webWorker.onmessage = e =>
		{
			clearTimeout(timeoutId);
			this.wilson.ctx.fillStyle = e.data[4];

			this.wilson.ctx.fillRect(
				e.data[0] * canvasScaleFactor,
				e.data[1] * canvasScaleFactor,
				e.data[2] * canvasScaleFactor,
				e.data[3] * canvasScaleFactor
			);
		};



		//The worker has three seconds to draw its initial line.
		//If it can't do that, we cancel it and spawn a new worker
		//that reverse-generates a skeleton.
		if (!reverseGenerateSkeleton)
		{
			timeoutId = setTimeout(() =>
			{
				if (this.webWorker?.terminate)
				{
					this.webWorker.terminate();
				}

				this.run({
					gridSize,
					maximumSpeed,
					noBorders,
					reverseGenerateSkeleton: true
				});
			}, 3000);
		}



		this.webWorker.postMessage([gridSize, maximumSpeed, noBorders, reverseGenerateSkeleton]);
	}
}