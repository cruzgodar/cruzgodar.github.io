import { Applet } from "/scripts/src/applets.js";
import { Wilson } from "/scripts/wilson.js";

export class VoronoiDiagram extends Applet
{
	lastTimestamp = -1;

	numPoints = 20;
	metric = 2;
	resolution = 1000;

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

		this.generatePoints();

		window.requestAnimationFrame(this.drawFrame.bind(this));
	}

	generatePoints()
	{
		this.points = new Array(this.numPoints);

		for (let i = 0; i < this.numPoints; i++)
		{
			this.points[i] = [
				0.8 * (Math.random() - 0.5) * this.wilson.worldWidth + this.wilson.worldCenterX,
				0.8 * (Math.random() - 0.5) * this.wilson.worldHeight + this.wilson.worldCenterY,
			];
		}

		// Balance the points by repelling nearby ones.
		const forces = new Array(this.numPoints);
		const forceFactor = 0.1 / this.numPoints;

		for (let i = 0; i < this.numPoints; i++)
		{
			forces[i] = [0, 0];

			for (let j = 0; j < this.numPoints; j++)
			{
				if (j === i)
				{
					continue;
				}

				const distance2 =
					(this.points[j][0] - this.points[i][0]) ** 2
					+ (this.points[j][1] - this.points[i][1]) ** 2;
				
				forces[i][0] += (this.points[i][0] - this.points[j][0]) / distance2;
				forces[i][1] += (this.points[i][1] - this.points[j][1]) / distance2;
			}
		}
		
		for (let i = 0; i < this.numPoints; i++)
		{
			this.points[i][0] += forceFactor * forces[i][0];
			this.points[i][1] += forceFactor * forces[i][1];

			this.points[i][0] = Math.min(
				Math.max(
					this.points[i][0],
					this.wilson.worldCenterX - this.wilson.worldWidth / 2
				),
				this.wilson.worldCenterX + this.wilson.worldWidth / 2
			);

			this.points[i][1] = Math.min(
				Math.max(
					this.points[i][1],
					this.wilson.worldCenterY - this.wilson.worldHeight / 2
				),
				this.wilson.worldCenterY + this.wilson.worldHeight / 2
			);
		}
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