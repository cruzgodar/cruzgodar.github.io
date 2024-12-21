import { hsvToRgb } from "../../../scripts/applets/applet.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { convertColor } from "/scripts/src/browser.js";
import { addTemporaryWorker } from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class FiniteSubdivisions extends AnimationFrameApplet
{
	resolution = 3000;

	numVertices;
	numIterations;

	webWorker;
	polygons;
	linesToDraw = [];



	constructor({ canvas })
	{
		super(canvas);

		const options = {
			canvasWidth: this.resolution,
			draggableOptions: {
				callbacks: {
					drag: this.onDragDraggable.bind(this),
				}
			},

			fullscreenOptions: {
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonCPU(canvas, options);
	}



	run({
		numVertices,
		numIterations,
	}) {
		this.webWorker?.terminate && this.webWorker.terminate();
		this.pause();

		this.numVertices = numVertices;

		const vertexIds = Array(this.numVertices).fill(0).map((_, i) => `vertex${i}`);

		const draggableIdsToRemove = Object.keys(this.wilson.draggables)
			.filter(id => !vertexIds.includes(id));
		this.wilson.removeDraggables(draggableIdsToRemove);
		
		
		
		this.polygons = this.getDefaultPolygons();

		const vertices = Object.fromEntries(
			vertexIds.map((id, index) =>
			{
				return [id, this.wilson.interpolateCanvasToWorld(this.polygons[0][index])];
			})
		);

		this.wilson.setDraggables(vertices);

		this.numIterations = numIterations;
		this.wilson.ctx.lineWidth = Math.max(10 - this.numIterations, 1);

		this.drawPreviewPolygon();
	}

	animate()
	{
		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		this.linesToDraw = [];

		this.webWorker = addTemporaryWorker("/applets/finite-subdivisions/scripts/worker.js");
		
		this.webWorker.onmessage = (e) =>
		{
			this.linesToDraw.push(e.data);
			this.needNewFrame = true;
		};

		this.webWorker.postMessage([
			this.numVertices,
			this.numIterations,
			this.polygons
		]);

		this.resume();
	}

	drawFrame()
	{
		for (const line of this.linesToDraw)
		{
			this.wilson.ctx.strokeStyle = convertColor(...line[4]);

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(line[1], line[0]);
			this.wilson.ctx.lineTo(line[3], line[2]);
			this.wilson.ctx.stroke();
		}

		this.linesToDraw = [];
	}



	onDragDraggable({ id, x, y })
	{
		this.webWorker?.terminate && this.webWorker.terminate();

		const index = id.slice(6);
		this.polygons[0][index] = this.wilson.interpolateWorldToCanvas([x, y]);

		this.drawPreviewPolygon();
	}



	getDefaultPolygons()
	{
		const polygons = [[]];

		// This makes the size of the black bars on the top and bottom equal.
		const middleAngle = Math.floor(this.numVertices / 2) * 2 * Math.PI / this.numVertices;

		const topRow = this.resolution / 2 - this.resolution / 2.5;
		const bottomRow = this.resolution / 2 - this.resolution / 2.5 * Math.cos(middleAngle);

		const totalMargin = topRow + (this.resolution - bottomRow);

		const centerRow = Math.floor(totalMargin / 2 + this.resolution / 2.5);
		const centerCol = Math.floor(this.resolution / 2);

		for (let i = 0; i < this.numVertices; i++)
		{
			const angle = i / this.numVertices * 2 * Math.PI;

			const row = Math.floor(-Math.cos(angle) * this.resolution / 2.5 + centerRow);
			const col = Math.floor(Math.sin(angle) * this.resolution / 2.5 + centerCol);

			polygons[0].push([row, col]);
		}

		return polygons;
	}

	drawPreviewPolygon()
	{
		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		for (let j = 0; j < this.numVertices; j++)
		{
			const rgb = hsvToRgb((2 * j + 1) / (2 * this.numVertices), 1, 1);

			this.wilson.ctx.strokeStyle = convertColor(...rgb);

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(this.polygons[0][j][1], this.polygons[0][j][0]);
			this.wilson.ctx.lineTo(
				this.polygons[0][(j + 1) % this.numVertices][1],
				this.polygons[0][(j + 1) % this.numVertices][0]
			);
			this.wilson.ctx.stroke();
		}

		let polygons = structuredClone(this.polygons);

		for (let i = 0; i < this.numIterations; i++)
		{
			polygons = this.drawLines(polygons);
		}
	}



	drawLines(polygons)
	{
		const newLines = [];

		const newPolygons = [];

		for (let i = 0; i < polygons.length; i++)
		{
			let barycenterRow = 0;
			let barycenterCol = 0;

			for (let j = 0; j < polygons[i].length; j++)
			{
				barycenterRow += polygons[i][j][0];
				barycenterCol += polygons[i][j][1];
			}

			barycenterRow /= polygons[i].length;
			barycenterCol /= polygons[i].length;

			for (let j = 0; j < polygons[i].length; j++)
			{
				newLines.push([polygons[i][j], [barycenterRow, barycenterCol]]);

				newPolygons.push([
					[barycenterRow, barycenterCol],
					polygons[i][j],
					polygons[i][(j + 1) % polygons[i].length]
				]);
			}
		}

		for (let j = 0; j < newLines.length; j++)
		{
			const rgb = hsvToRgb(j / newLines.length, 1, 1);

			this.wilson.ctx.strokeStyle = convertColor(...rgb);

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(newLines[j][0][1], newLines[j][0][0]);
			this.wilson.ctx.lineTo(
				newLines[j][1][1],
				newLines[j][1][0]
			);
			this.wilson.ctx.stroke();
		}

		return newPolygons;
	}
}