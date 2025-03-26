import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class MaurerRoses extends AnimationFrameApplet
{
	resolution = 2000;
	thetaFactor = 2;
	pointFactor = 1;
	numGraphPoints = 4000;
	graphPointsPerFrame = 20;

	pointQueue = [];
	lineQueue = [];

	pointQueuePosition = 0;
	lineQueuePosition = 0;

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,

			worldWidth: 2.1,
			worldHeight: 2.1,

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonCPU(canvas, options);
	}



	run({
		resolution = 2000,
		thetaFactor = 2,
		pointFactor = 1,
		animate = false
	}) {
		this.resolution = resolution;
		this.thetaFactor = thetaFactor;
		this.pointFactor = pointFactor;
		this.animate = animate;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.pointQueue = [];
		this.lineQueue = [];

		this.pointQueuePosition = 0;
		this.lineQueuePosition = 0;

		for (let i = 0; i < this.numGraphPoints; i++)
		{
			const theta = i / this.numGraphPoints * 2 * Math.PI;
			const r = Math.sin(theta * this.thetaFactor);

			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);

			this.pointQueue.push(this.wilson.interpolateWorldToCanvas([x, y]));
		}

		for (let i = 0; i < 360; i++)
		{
			const theta = i / 360 * 2 * Math.PI;
			const r = Math.sin(theta * this.thetaFactor);

			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);

			const [row, col] = this.wilson.interpolateCanvasToWorld([x, y]);
			const rgb = hsvToRgb(i / 360, 1, 1);

			this.lineQueue.push([row, col, rgb]);
		}

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.resume();
	}

	prepareFrame()
	{
		
	}

	drawFrame()
	{
		if (this.animate)
		{
			this.needNewFrame = true;

			if (this.pointQueuePosition < this.pointQueue.length)
			{
				for (
					let i = 0;
					i < this.graphPointsPerFrame
						&& this.pointQueuePosition < this.pointQueue.length;
					i++
				) {
					const [row, col] = this.pointQueue[this.pointQueuePosition];

					this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
					this.wilson.ctx.fillRect(row - 1, col - 1, 3, 3);

					this.pointQueuePosition++;
				}
			}

			else if (this.lineQueuePosition < this.lineQueue.length)
			{
				const [row, col, rgb] = this.pointQueue[this.pointQueuePosition];
				const [nextRow, nextCol, nextRgb] = this.lineQueue[
					(this.lineQueuePosition + 1) % this.lineQueue.length
				];

				this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(row, col);
				this.wilson.ctx.lineTo(nextRow, nextCol);
				this.wilson.ctx.stroke();

				this.lineQueuePosition++;
			}

			else
			{
				this.needNewFrame = false;
			}
		}
	}
}