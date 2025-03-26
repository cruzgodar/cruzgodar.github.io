import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class MaurerRoses extends AnimationFrameApplet
{
	resolution = 2000;
	thetaFactor = 2;
	pointFactor = 1;
	numPoints = 4000;
	numPointsPerFrame = 30;
	// How long it takes to draw a full line.
	numPointsPerLine = 60;
	curveThickness = 1;
	lineThickness = 1;

	drawLinesSequentially = false;

	points = [];
	lines = [];

	drawPosition = 0;

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
		drawLinesSequentially = false,
		animate = false
	}) {
		this.resolution = resolution;
		this.thetaFactor = thetaFactor;
		this.pointFactor = pointFactor;
		this.drawLinesSequentially = drawLinesSequentially;
		this.animate = animate;

		this.numPoints = 30000;
		this.numPointsPerFrame = this.numPoints / (300 * this.thetaFactor);
		this.numPointsPerLine = this.numPointsPerFrame * 120;
		this.drawPosition = this.animate ? 0 : this.numPoints + this.numPointsPerLine;

		this.linesPerFrame = this.animate ? 1 : 360;

		this.curveThickness = Math.max(this.resolution / 500, 1);
		this.lineThickness = Math.max(this.resolution / 500, 1);
		this.wilson.ctx.lineWidth = this.lineThickness;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.points = [];
		this.lines = [];

		for (let i = 0; i < this.numPoints; i++)
		{
			const theta = i / this.numPoints * 2 * Math.PI;
			const r = Math.sin(theta * this.thetaFactor);

			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);

			this.points.push(this.wilson.interpolateWorldToCanvas([x, y]));
		}

		for (let i = 0; i < 360; i++)
		{
			const theta = i / 360 * 2 * Math.PI * this.pointFactor;
			const r = Math.sin(theta * this.thetaFactor);

			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);

			const [row, col] = this.wilson.interpolateWorldToCanvas([x, y]);
			const rgb = hsvToRgb(i / 360, 1, 1);

			this.lines.push([row, col, rgb]);
		}

		this.lines.push([
			this.lines[0][0],
			this.lines[0][1],
			[...this.lines[0][2]]
		]);

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.resume();
	}

	drawFrame()
	{
		for (let i = 0; i < 360; i++)
		{
			const t = Math.min(
				Math.max(
					(this.drawPosition - (
						((i * (
							this.drawLinesSequentially ? this.pointFactor : 1
						)) % 360) / 360 * this.numPoints
					)) / this.numPointsPerLine,
					0
				),
				1
			);

			if (t > 0)
			{
				const [row, col, rgb] = this.lines[i];
				const [nextRow, nextCol] = this.lines[i + 1];

				const endRow = row + t * (nextRow - row);
				const endCol = col + t * (nextCol - col);

				this.wilson.ctx.strokeStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(row, col);
				this.wilson.ctx.lineTo(endRow, endCol);
				this.wilson.ctx.stroke();
			}
		}

		this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";

		for (let i = 0; i < this.numPoints; i++)
		{
			if (i >= this.drawPosition)
			{
				break;
			}

			const [row, col] = this.points[i];

			// Draw a circle of radius lineThickness here.
			this.wilson.ctx.beginPath();
			this.wilson.ctx.arc(row, col, this.curveThickness, 0, 2 * Math.PI);
			this.wilson.ctx.fill();
		}

		this.drawPosition += this.numPointsPerFrame;

		if (this.drawPosition < this.numPoints + this.numPointsPerLine)
		{
			this.needNewFrame = true;
		}
	}
}