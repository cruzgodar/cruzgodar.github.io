import { Applet } from "/scripts/src/applets.js";
import { Wilson } from "/scripts/wilson.js";

export class VoronoiDiagram extends Applet
{
	lastTimestamp = -1;

	numPoints = 20;
	metric = 2;
	resolution = 500;

	pointRadius;

	points;

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

		this.wilson = new Wilson(this.canvas, options);
	}



	run({
		resolution = 500,
		numPoints = 20,
		metric = 2
	}) {
		this.resolution = resolution;
		this.numPoints = numPoints;
		this.metric = metric;

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.pointRadius = this.resolution * 0.01;

		this.points = new Array(this.numPoints);

		for (let i = 0; i < this.numPoints; i++)
		{
			this.points[i] = [
				0.9 * (Math.random() - 0.5) * this.wilson.worldWidth + this.wilson.worldCenterX,
				0.9 * (Math.random() - 0.5) * this.wilson.worldHeight + this.wilson.worldCenterY,
			];
		}

		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.drawPoints();



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}

	drawPoints()
	{
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";

		for (let i = 0; i < this.numPoints; i++)
		{
			const canvasCoordinates = this.wilson.utils.interpolate.worldToCanvas(
				...this.points[i]
			);
			
			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(...canvasCoordinates);

			this.wilson.ctx.arc(
				...canvasCoordinates,
				this.pointRadius,
				0,
				2 * Math.PI,
				false
			);

			this.wilson.ctx.fill();
		}
	}
}