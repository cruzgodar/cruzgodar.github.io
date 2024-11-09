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

	polygons;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,


			useDraggables: true,

			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),

			draggablesMouseupCallback: this.onReleaseDraggable.bind(this),
			draggablesTouchendCallback: this.onReleaseDraggable.bind(this),


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
		try {this.webWorker.terminate();}
		catch(ex) {/* No web worker */}

		this.numVertices = numVertices;
		this.numIterations = Math.min(numIterations, 9);

		this.resolution = 3000;

		this.maximumSpeed = maximumSpeed;



		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilson.ctx.lineWidth = 10 - this.numIterations;



		for (const draggable of this.wilson.draggables.draggables)
		{
			draggable.remove();
		}

		this.wilson.draggables.numDraggables = 0;
		this.wilson.draggables.draggables = [];

		this.polygons = this.getDefaultPolygons();

		for (const vertex of this.polygons[0])
		{
			this.wilson.draggables.add(
				...this.wilson.utils.interpolate.canvasToWorld(vertex[0], vertex[1])
			);
		}

		this.drawOuterPolygon();

		this.onReleaseDraggable();
	}

	onDragDraggable(activeDraggable, x, y)
	{
		try {this.webWorker.terminate();}
		catch(ex) {/* No web worker */}

		this.polygons[0][activeDraggable] = this.wilson.utils.interpolate.worldToCanvas(x, y);

		this.drawOuterPolygon();
	}

	onReleaseDraggable()
	{
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
			this.numIterations,
			this.maximumSpeed,
			this.polygons
		]);
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

	drawOuterPolygon()
	{
		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		for (let j = 0; j < this.numVertices; j++)
		{
			const rgb = this.wilson.utils.hsvToRgb((2 * j + 1) / (2 * this.numVertices), 1, 1);

			this.wilson.ctx.strokeStyle = convertColor(...rgb);

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(this.polygons[0][j][1], this.polygons[0][j][0]);
			this.wilson.ctx.lineTo(
				this.polygons[0][(j + 1) % this.numVertices][1],
				this.polygons[0][(j + 1) % this.numVertices][0]
			);
			this.wilson.ctx.stroke();
		}
	}
}