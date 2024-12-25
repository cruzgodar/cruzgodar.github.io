import { Applet } from "../../../scripts/applets/applet.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class SimulatedAnnealing extends Applet
{
	webWorker;

	resolution = 1000;
	numNodes;
	maximumSpeed;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,
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
		numNodes,
		maximumSpeed
	}) {
		this.resolution = resolution;
		this.numNodes = numNodes;
		this.maximumSpeed = maximumSpeed;

		const scalingFactor = resolution / 1000;

		this.wilson.resizeCanvas({ width: resolution });

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, resolution, resolution);

		this.wilson.ctx.lineWidth = scalingFactor;



		this.webWorker = addTemporaryWorker("/applets/simulated-annealing/scripts/worker.js");

		this.webWorker.onmessage = (e) =>
		{
			// A circle with arguments (x, y, r, color).
			if (e.data[0] === 0)
			{
				this.wilson.ctx.fillStyle = convertColor(...e.data[4]);

				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(e.data[1], e.data[2]);

				this.wilson.ctx.arc(
					e.data[1],
					e.data[2],
					e.data[3] * scalingFactor,
					0,
					2 * Math.PI,
					false
				);

				this.wilson.ctx.fill();
			}

			// A line with arguments (x1, y1, x2, y2, color).
			else if (e.data[0] === 1)
			{
				this.wilson.ctx.strokeStyle = convertColor(...(e.data[5]));

				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(e.data[1], e.data[2]);
				this.wilson.ctx.lineTo(e.data[3], e.data[4]);
				this.wilson.ctx.stroke();
			}

			else
			{
				this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
				this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
			}
		};



		this.webWorker.postMessage([this.resolution, this.numNodes, this.maximumSpeed]);
	}
}