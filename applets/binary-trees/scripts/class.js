import { opacityAnimationTime } from "/scripts/src/animation.js";
import { Applet } from "/scripts/src/applets.js";
import { aspectRatio } from "/scripts/src/layout.js";
import {
	$$,
	addTemporaryInterval,
	addTemporaryWorker
} from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class BinaryTree extends Applet
{
	root = [];
	branchPoints = [];

	numPreviewIterations = 5;

	webWorker = null;



	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",

			canvasWidth: 2000,
			canvasHeight: 2000,



			useDraggables: true,

			draggablesMousedownCallback: this.onGrabDraggable.bind(this),
			draggablesTouchstartCallback: this.onGrabDraggable.bind(this),

			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),

			draggablesMouseupCallback: this.onReleaseDraggable.bind(this),
			draggablesTouchendCallback: this.onReleaseDraggable.bind(this),



			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: () => this.changeAspectRatio()
		};

		this.wilson = new Wilson(canvas, options);

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);

		this.initBranchMarkers();
	}



	preview(root, branchPoints)
	{
		this.root = root;
		this.branchPoints = branchPoints;



		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);



		let angles = [
			Math.atan2(
				this.branchPoints[0][0] - this.root[0],
				this.branchPoints[0][1] - this.root[1]
			),
			Math.atan2(
				this.branchPoints[1][0] - this.root[0],
				this.branchPoints[1][1] - this.root[1]
			)
		];

		const angleStep = (angles[0] - angles[1]) / 2;



		const distances = [
			Math.sqrt(
				(this.branchPoints[0][0] - this.root[0])
					* (this.branchPoints[0][0] - this.root[0])
				+ (this.branchPoints[0][1] - this.root[1])
					* (this.branchPoints[0][1] - this.root[1])
			),
			Math.sqrt(
				(this.branchPoints[1][0] - this.root[0])
					* (this.branchPoints[1][0] - this.root[0])
				+ (this.branchPoints[1][1] - this.root[1])
					* (this.branchPoints[1][1] - this.root[1])
			)
		];

		let startingPoints = [this.root];

		let scale = 1;



		for (let iteration = 0; iteration < this.numPreviewIterations; iteration++)
		{
			const newStartingPoints = [];

			const newAngles = [];



			this.wilson.ctx.lineWidth = 20 * scale + 1;

			const r = Math.sqrt(scale) * 139;
			const g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
			const b = Math.sqrt(scale) * 19;
			this.wilson.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;



			for (let i = 0; i < startingPoints.length; i++)
			{
				let startX = startingPoints[i][1];
				let startY = startingPoints[i][0];
				let endX = startingPoints[i][1] + distances[0] * scale * Math.cos(angles[2 * i]);
				let endY = startingPoints[i][0] + distances[0] * scale * Math.sin(angles[2 * i]);

				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(startX, startY);
				this.wilson.ctx.lineTo(endX, endY);
				this.wilson.ctx.stroke();

				newStartingPoints.push([endY, endX]);

				newAngles.push(angles[2 * i] - angleStep);
				newAngles.push(angles[2 * i] + angleStep);



				startX = startingPoints[i][1];
				startY = startingPoints[i][0];
				endX = startingPoints[i][1] + distances[1] * scale * Math.cos(angles[2 * i + 1]);
				endY = startingPoints[i][0] + distances[1] * scale * Math.sin(angles[2 * i + 1]);

				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(startX, startY);
				this.wilson.ctx.lineTo(endX, endY);
				this.wilson.ctx.stroke();

				newStartingPoints.push([endY, endX]);

				newAngles.push(angles[2 * i + 1] - angleStep);
				newAngles.push(angles[2 * i + 1] + angleStep);
			}



			startingPoints = newStartingPoints;

			angles = newAngles;

			scale *= .675;
		}
	}



	animate(root, branchPoints)
	{
		this.root = root;
		this.branchPoints = branchPoints;

		this.webWorker = addTemporaryWorker("/applets/binary-trees/scripts/worker.js");



		this.webWorker.onmessage = (e) =>
		{
			if (e.data[0] === "done")
			{
				const timeoutId = setTimeout(() =>
				{
					$$(".wilson-draggable").forEach(element => element.style.opacity = 1);
				}, 500);

				this.timeoutIds.push(timeoutId);

				return;
			}



			this.wilson.ctx.strokeStyle = e.data[4];
			this.wilson.ctx.lineWidth = e.data[5];

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(e.data[0], e.data[1]);
			this.wilson.ctx.lineTo(e.data[2], e.data[3]);
			this.wilson.ctx.stroke();
		};



		this.webWorker.postMessage([this.root, this.branchPoints]);
	}



	initBranchMarkers()
	{
		this.wilson.draggables.add(-1 / 7, -1 / 3);
		this.wilson.draggables.add(1 / 7, -1 / 3);



		this.root = this.wilson.utils.interpolate.worldToCanvas(0, -4 / 5);

		this.branchPoints[0] = this.wilson.utils.interpolate.worldToCanvas(-1 / 7, -1 / 3);
		this.branchPoints[1] = this.wilson.utils.interpolate.worldToCanvas(1 / 7, -1 / 3);



		this.preview(this.root, this.branchPoints);
	}



	onGrabDraggable()
	{
		if (this.webWorker?.terminate)
		{
			this.webWorker.terminate();
		}

		$$(".wilson-draggable").forEach(element => element.style.opacity = 1);

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);

		this.preview(this.root, this.branchPoints);
	}



	onDragDraggable(activeDraggable, x, y)
	{
		this.branchPoints[activeDraggable] = this.wilson.utils.interpolate.worldToCanvas(x, y);

		this.preview(this.root, this.branchPoints);
	}



	onReleaseDraggable()
	{
		document.body.style.WebkitUserSelect = "";

		$$(".wilson-draggable").forEach(element => element.style.opacity = 0);



		let step = 0;

		const that = this;

		const callback = () =>
		{
			const alpha = step / 37;
			that.wilson.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
			that.wilson.ctx.fillRect(0, 0, that.wilson.canvasWidth, that.wilson.canvasHeight);

			step++;
		};

		const refreshId = addTemporaryInterval({ callback, delay: 8 });



		const timeoutId = setTimeout(() =>
		{
			clearInterval(refreshId);

			that.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			that.wilson.ctx.fillRect(0, 0, that.wilson.canvasWidth, that.wilson.canvasHeight);

			that.animate(that.root, that.branchPoints);
		}, opacityAnimationTime);

		this.timeoutIds.push(timeoutId);
	}



	changeAspectRatio()
	{
		if (this.webWorker?.terminate)
		{
			this.webWorker.terminate();
		}

		$$(".wilson-draggable").forEach(element => element.style.opacity = 1);



		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.wilson.changeCanvasSize(2000, 2000 / aspectRatio);
			}

			else
			{
				this.wilson.changeCanvasSize(2000 * aspectRatio, 2000);
			}
		}

		else
		{
			this.wilson.changeCanvasSize(2000, 2000);
		}

		this.wilson.draggables.recalculateLocations();



		this.root = this.wilson.utils.interpolate.worldToCanvas(0, -4 / 5);

		this.branchPoints[0] = this.wilson.utils.interpolate.worldToCanvas(
			...this.wilson.draggables.worldCoordinates[0]
		);
		
		this.branchPoints[1] = this.wilson.utils.interpolate.worldToCanvas(
			...this.wilson.draggables.worldCoordinates[1]
		);

		this.preview(this.root, this.branchPoints);
	}
}