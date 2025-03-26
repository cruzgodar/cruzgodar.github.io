import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class MaurerRoses extends AnimationFrameApplet
{
	resolution = 2000;
	thetaFactor = 2;
	pointFactor = 1;
	numGraphPoints = 4000;
	graphPointsPerFrame = 30;
	linesPerFrame = 1;
	curveThickness = 1;
	lineThickness = 1;

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

		this.numGraphPoints = 30000;

		this.graphPointsPerFrame = this.animate
			? this.numGraphPoints / (300 * this.thetaFactor)
			: this.numGraphPoints;

		this.linesPerFrame = this.animate ? 1 : 360;

		this.curveThickness = Math.max(this.resolution / 500, 1);
		this.lineThickness = Math.max(this.resolution / 1000, 1);
		this.wilson.ctx.lineWidth = this.lineThickness;

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
			const theta = i / 360 * 2 * Math.PI * this.pointFactor;
			const r = Math.sin(theta * this.thetaFactor);

			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);

			const [row, col] = this.wilson.interpolateWorldToCanvas([x, y]);
			const rgb = hsvToRgb(i / 360, 1, 1);

			this.lineQueue.push([row, col, rgb]);
		}

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.resume();
	}

	drawFrame()
	{
		this.needNewFrame = true;

		if (this.pointQueuePosition < this.pointQueue.length)
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";

			for (
				let i = 0;
				i < this.graphPointsPerFrame
					&& this.pointQueuePosition < this.pointQueue.length;
				i++
			) {
				const [row, col] = this.pointQueue[this.pointQueuePosition];

				// Draw a circle of radius lineThickness here.
				this.wilson.ctx.beginPath();
				this.wilson.ctx.arc(row, col, this.curveThickness, 0, 2 * Math.PI);
				this.wilson.ctx.fill();

				this.pointQueuePosition++;
			}
		}

		else if (this.lineQueuePosition < this.lineQueue.length)
		{
			for (
				let i = 0;
				i < this.linesPerFrame
					&& this.lineQueuePosition < this.lineQueue.length;
				i++
			) {
				const [row, col, rgb] = this.lineQueue[this.lineQueuePosition];
				const [nextRow, nextCol] = this.lineQueue[
					(this.lineQueuePosition + 1) % this.lineQueue.length
				];

				this.wilson.ctx.strokeStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(row, col);
				this.wilson.ctx.lineTo(nextRow, nextCol);
				this.wilson.ctx.stroke();

				this.lineQueuePosition++;
			}
		}

		else
		{
			this.needNewFrame = false;
		}
	}
}