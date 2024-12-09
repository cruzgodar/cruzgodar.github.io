import { Applet } from "../../../scripts/applets/applet.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonCPU } from "/scripts/wilson.js";


export class WilsonsAlgorithm extends Applet
{
	webWorker;
	resolution = 1000;

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
		this.canvas.style.imageRendering = "pixelated";
	}

	run({
		gridSize,
		maximumSpeed,
		noBorders,
		reverseGenerateSkeleton = false
	}) {
		let timeoutId;

		this.resolution = noBorders ? gridSize : 2 * gridSize + 1;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(
			0,
			0,
			this.resolution,
			this.resolution
		);

		this.webWorker = addTemporaryWorker("/applets/wilsons-algorithm/scripts/worker.js");

		this.webWorker.onmessage = e =>
		{
			clearTimeout(timeoutId);
			this.wilson.ctx.fillStyle = convertColor(...(e.data[4] ?? [255, 255, 255]));

			this.wilson.ctx.fillRect(
				e.data[0],
				e.data[1],
				e.data[2],
				e.data[3]
			);
		};

		// The worker has three seconds to draw its initial line.
		// If it can't do that, we cancel it and spawn a new worker
		// that reverse-generates a skeleton.
		if (!reverseGenerateSkeleton)
		{
			timeoutId = setTimeout(() =>
			{
				this.webWorker?.terminate && this.webWorker.terminate();

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