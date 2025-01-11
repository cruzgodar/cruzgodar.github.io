import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { changeOpacity, opacityAnimationTime } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import {
	addTemporaryInterval,
	addTemporaryWorker
} from "/scripts/src/main.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class BinaryTrees extends AnimationFrameApplet
{
	resolution = 3000;
	root = [];
	branchPoints = [];
	linesToDraw = [];

	numPreviewIterations = 10;

	webWorker;


	constructor({ canvas })
	{
		super(canvas);

		const options = {
			canvasWidth: this.resolution,
			onResizeCanvas: this.onResizeCanvas.bind(this),

			draggableOptions: {
				draggables: {
					branch0: [-1 / 7, -1 / 3],
					branch1: [1 / 7, -1 / 3],
				},
				callbacks: {
					grab: this.onGrabDraggable.bind(this),
					drag: this.onDragDraggable.bind(this),
					release: this.onReleaseDraggable.bind(this)
				}
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonCPU(canvas, options);

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);

		this.root = this.wilson.interpolateWorldToCanvas([0, -4 / 5]);
		this.branchPoints[0] = this.wilson.interpolateWorldToCanvas(
			this.wilson.draggables.branch0.location
		);
		this.branchPoints[1] = this.wilson.interpolateWorldToCanvas(
			this.wilson.draggables.branch1.location
		);

		this.run(10);
	}



	run(numIterations = this.numPreviewIterations)
	{
		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
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



		for (let iteration = 0; iteration < numIterations; iteration++)
		{
			const newStartingPoints = [];

			const newAngles = [];



			this.wilson.ctx.lineWidth = 20 * scale + 1;

			const r = Math.sqrt(scale) * 139;
			const g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
			const b = Math.sqrt(scale) * 19;
			this.wilson.ctx.strokeStyle = convertColor(r, g, b);



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



	animate()
	{
		this.linesToDraw = [];

		this.webWorker = addTemporaryWorker("/applets/binary-trees/scripts/worker.js");

		this.webWorker.onmessage = (e) =>
		{
			if (e.data[0] === "done")
			{
				const timeoutId = setTimeout(() =>
				{
					changeOpacity({
						element: this.wilson.draggables.branch0.element,
						opacity: 1,
						duration: opacityAnimationTime
					});
					
					changeOpacity({
						element: this.wilson.draggables.branch1.element,
						opacity: 1,
						duration: opacityAnimationTime
					});
				}, 500);

				this.timeoutIds.push(timeoutId);
				this.pause();

				return;
			}

			this.linesToDraw.push(e.data);
			this.needNewFrame = true;
		};

		this.webWorker.postMessage([this.root, this.branchPoints]);
		this.resume();
	}

	drawFrame()
	{
		for (const line of this.linesToDraw)
		{
			this.wilson.ctx.strokeStyle = convertColor(...line[4]);
			this.wilson.ctx.lineWidth = line[5];

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(line[0], line[1]);
			this.wilson.ctx.lineTo(line[2], line[3]);
			this.wilson.ctx.stroke();
		}

		this.linesToDraw = [];
	}



	onGrabDraggable()
	{
		if (this.webWorker?.terminate)
		{
			this.webWorker.terminate();
		}

		this.wilson.draggables.branch0.element.style.opacity = 1;
		this.wilson.draggables.branch1.element.style.opacity = 1;

		this.wilson.ctx.fillStyle = convertColor(0, 0, 0);
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);

		this.run();
	}

	onDragDraggable({ id, x, y })
	{
		const index = id.slice(6);
		this.branchPoints[index] = this.wilson.interpolateWorldToCanvas([x, y]);
		this.run();
	}

	onReleaseDraggable()
	{
		changeOpacity({
			element: this.wilson.draggables.branch0.element,
			opacity: 0,
			duration: opacityAnimationTime
		});
		
		changeOpacity({
			element: this.wilson.draggables.branch1.element,
			opacity: 0,
			duration: opacityAnimationTime
		});



		let step = 0;

		const that = this;

		const callback = () =>
		{
			const alpha = step / 37;
			that.wilson.ctx.fillStyle = convertColor(0, 0, 0, alpha);
			that.wilson.ctx.fillRect(0, 0, that.wilson.canvasWidth, that.wilson.canvasHeight);

			step++;
		};

		const refreshId = addTemporaryInterval({ callback, delay: 8 });



		const timeoutId = setTimeout(() =>
		{
			clearInterval(refreshId);

			that.wilson.ctx.fillStyle = convertColor(0, 0, 0);
			that.wilson.ctx.fillRect(0, 0, that.wilson.canvasWidth, that.wilson.canvasHeight);

			that.animate(that.root, that.branchPoints);
		}, opacityAnimationTime);

		this.timeoutIds.push(timeoutId);
	}



	onResizeCanvas()
	{
		if (this.webWorker?.terminate)
		{
			this.webWorker.terminate();
		}

		this.wilson.draggables.branch0.element.style.opacity = 1;
		this.wilson.draggables.branch1.element.style.opacity = 1;

		this.root = this.wilson.interpolateWorldToCanvas([0, -4 / 5]);
		this.branchPoints[0] = this.wilson.interpolateWorldToCanvas(
			this.wilson.draggables.branch0.location
		);
		this.branchPoints[1] = this.wilson.interpolateWorldToCanvas(
			this.wilson.draggables.branch1.location
		);

		this.run();
	}
}