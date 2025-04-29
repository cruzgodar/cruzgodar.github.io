import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class Boids extends AnimationFrameApplet
{
	resolution = 2000;
	numBoids;
	numBoidsOfPrey;

	// Each entry is of the form
	// {
	// 	x: number,
	// 	y: number,
	// 	vx: number,
	// 	vy: number,
	// }.
	boids = [];
	boidsOfPrey = [];

	// world units per frame.

	boidSize = 0.015;
	minVelocity;
	maxVelocity;

	alignmentRange;
	alignmentFactor;
	avoidRange;
	avoidFactor;
	centeringFactor;
	turnFactor;
	fearFactor;
	fearRange;
	preyFactor;
	preyRange;

	margin = 0.02;

	avoidCycle = 0;
	numAvoidCycles;
	alignCycle = 0;
	numAlignCycles;

	frame = 0;
	lastTimeElapseds = Array(16).fill(0);
	lastTimeElapsed = 0;

	usingCursorAsPredator = false;
	cursorPredatorLocation = [0, 0];

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,

			interactionOptions: {
				callbacks: {
					mousedown: this.onGrabCanvas.bind(this),
					touchstart: this.onGrabCanvas.bind(this),
					mousedrag: this.onGrabCanvas.bind(this),
					touchmove: this.onGrabCanvas.bind(this),
					mouseup: this.onReleaseCanvas.bind(this),
					touchend: this.onReleaseCanvas.bind(this),
				},
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonCPU(canvas, options);
	}



	run({
		resolution = 2000,
		numBoids = 1000,
		numBoidsOfPrey = 0,
		minVelocity = 0.002,
		maxVelocity = 0.004,
		alignmentRange = 0.1,
		alignmentFactor = 0.05,
		avoidRange = 0.0075,
		avoidFactor = 0.1,
		centeringFactor = 0.0005,
		turnFactor = 0.0001,
		fearFactor = 0.01,
		fearRange = 0.1,
		preyFactor = 0.0005,
		preyRange = 0.1,
	}) {
		this.resolution = resolution;
		this.numBoids = numBoids;
		this.numBoidsOfPrey = numBoidsOfPrey;
		this.minVelocity = minVelocity;
		this.maxVelocity = maxVelocity;
		this.alignmentRange = alignmentRange;
		this.alignmentFactor = alignmentFactor;
		this.avoidRange = avoidRange;
		this.avoidFactor = avoidFactor;
		this.centeringFactor = centeringFactor;
		this.turnFactor = turnFactor;
		this.fearFactor = fearFactor;
		this.fearRange = fearRange;
		this.preyFactor = preyFactor;
		this.preyRange = preyRange;

		this.setResolution(resolution);
		this.setNumBoids(numBoids);
		this.setNumBoidsOfPrey(numBoidsOfPrey);

		this.resume();
	}

	setResolution(resolution)
	{
		this.resolution = resolution;

		this.wilson.resizeCanvas({ width: this.resolution });
	}

	setNumBoids(numBoids)
	{
		this.numBoids = numBoids;

		if (this.boids.length > this.numBoids)
		{
			this.boids.splice(this.numBoids, this.boids.length - this.numBoids);
		}

		else if (this.boids.length < this.numBoids)
		{
			for (let i = this.boids.length; i < this.numBoids; i++)
			{
				const v = this.minVelocity
					+ (Math.random() * (this.maxVelocity - this.minVelocity));
				const theta = Math.random() * 2 * Math.PI;

				this.boids.push({
					x: (Math.random() - 0.5) * this.wilson.worldWidth,
					y: (Math.random() - 0.5) * this.wilson.worldHeight,
					vx: Math.cos(theta) * v,
					vy: Math.sin(theta) * v,
				});
			}
		}

		this.numAvoidCycles = Math.ceil(this.numBoids / 200);
		this.numAlignCycles = Math.ceil(this.numBoids / 100);
	}

	setNumBoidsOfPrey(numBoidsOfPrey)
	{
		this.numBoidsOfPrey = numBoidsOfPrey;

		if (this.boidsOfPrey.length > this.numBoidsOfPrey)
		{
			this.boidsOfPrey.splice(
				this.numBoidsOfPrey,
				this.boidsOfPrey.length - this.numBoidsOfPrey
			);
		}

		else if (this.boidsOfPrey.length < this.numBoidsOfPrey)
		{
			for (let i = this.boidsOfPrey.length; i < this.numBoidsOfPrey; i++)
			{
				const v = this.minVelocity
					+ (Math.random() * (this.maxVelocity - this.minVelocity));
				const theta = Math.random() * 2 * Math.PI;

				this.boidsOfPrey.push({
					x: (Math.random() - 0.5) * this.wilson.worldWidth,
					y: (Math.random() - 0.5) * this.wilson.worldHeight,
					vx: Math.cos(theta) * v,
					vy: Math.sin(theta) * v,
				});
			}
		}
	}

	prepareFrame(timeElapsed)
	{
		this.frame = (this.frame + 1) % this.lastTimeElapseds.length;
		this.lastTimeElapseds[this.frame] = Math.min(timeElapsed, 50);

		this.lastTimeElapsed = 0;
		for (let i = 0; i < this.lastTimeElapseds.length; i++)
		{
			this.lastTimeElapsed += this.lastTimeElapseds[i];
		}
		this.lastTimeElapsed /= this.lastTimeElapseds.length;
	}

	drawFrame()
	{
		this.avoidCycle = (this.avoidCycle + 1) % this.numAvoidCycles;
		this.alignCycle = (this.alignCycle + 1) % this.numAlignCycles;
		this.updateBoids();
		this.updateBoidsOfPrey();

		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);

		for (let i = 0; i < this.numBoids; i++)
		{
			this.drawBoid(this.boids[i]);
		}

		for (let i = 0; i < this.numBoidsOfPrey; i++)
		{
			this.drawBoid(this.boidsOfPrey[i], true);
		}

		this.needNewFrame = true;
	}

	drawBoid(boid, predator = false)
	{
		const x = boid.x;
		const y = boid.y;
		const theta = Math.atan2(boid.vy, boid.vx);
		const v2 = boid.vx * boid.vx + boid.vy * boid.vy;

		const size = predator ? 2.5 : 1;

		const h = theta / (2 * Math.PI) + 0.5;

		const rgb = hsvToRgb(
			predator ? 0.5 + h : h,
			v2 / (this.maxVelocity * this.maxVelocity),
			1
		);
		this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		// Draw an isoceles triangle centered at (x, y) and pointing toward (x + vx, y + vy).
		const theta2 = theta + 2 * Math.PI / 3;
		const theta3 = theta + 4 * Math.PI / 3;
		
		const x1 = x + 2 * Math.cos(theta) * this.boidSize * size;
		const y1 = y + 2 * Math.sin(theta) * this.boidSize * size;

		const x2 = x + Math.cos(theta2) * this.boidSize * size;
		const y2 = y + Math.sin(theta2) * this.boidSize * size;
		
		const x3 = x + Math.cos(theta3) * this.boidSize * size;
		const y3 = y + Math.sin(theta3) * this.boidSize * size;

		const canvasCoords = this.wilson.interpolateWorldToCanvas([x, y]);
		const canvasCoords1 = this.wilson.interpolateWorldToCanvas([x1, y1]);
		const canvasCoords2 = this.wilson.interpolateWorldToCanvas([x2, y2]);
		const canvasCoords3 = this.wilson.interpolateWorldToCanvas([x3, y3]);

		this.wilson.ctx.beginPath();
		this.wilson.ctx.moveTo(canvasCoords1[1], canvasCoords1[0]);
		this.wilson.ctx.lineTo(canvasCoords2[1], canvasCoords2[0]);
		this.wilson.ctx.lineTo(canvasCoords[1], canvasCoords[0]);
		this.wilson.ctx.lineTo(canvasCoords3[1], canvasCoords3[0]);
		this.wilson.ctx.closePath();

		this.wilson.ctx.fill();
	}

	updateBoids()
	{
		for (let i = 0; i < this.numBoids; i++)
		{
			const boid = this.boids[i];

			// Avoid other boids.
			let closeDx = 0;
			let closeDy = 0;

			for (let j = this.avoidCycle; j < this.numBoids; j += this.numAvoidCycles)
			{
				if (i === j)
				{
					continue;
				}

				const dx = boid.x - this.boids[j].x;
				const dy = boid.y - this.boids[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.avoidRange);
				closeDy += dy * Math.exp(-d / this.avoidRange);
			}

			boid.vx += closeDx * this.avoidFactor;
			boid.vy += closeDy * this.avoidFactor;



			// Strongly avoid boids of prey.
			closeDx = 0;
			closeDy = 0;

			for (let j = 0; j < this.numBoidsOfPrey; j++)
			{
				const dx = boid.x - this.boidsOfPrey[j].x;
				const dy = boid.y - this.boidsOfPrey[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.fearRange);
				closeDy += dy * Math.exp(-d / this.fearRange);
			}

			if (this.usingCursorAsPredator)
			{
				const dx = boid.x - this.cursorPredatorLocation[0];
				const dy = boid.y - this.cursorPredatorLocation[1];
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.fearRange);
				closeDy += dy * Math.exp(-d / this.fearRange);
			}

			boid.vx += closeDx * this.fearFactor;
			boid.vy += closeDy * this.fearFactor;



			// Align and center with nearby boids.
			let totalX = 0;
			let totalY = 0;
			let totalVx = 0;
			let totalVy = 0;
			let totalWeight = 0;

			for (let j = this.alignCycle; j < this.numBoids; j += this.numAlignCycles)
			{
				if (i === j)
				{
					continue;
				}

				const dx = boid.x - this.boids[j].x;
				const dy = boid.y - this.boids[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);
				const weight = Math.exp(-d / this.alignmentRange);

				totalX += this.boids[j].x * weight;
				totalY += this.boids[j].y * weight;
				totalVx += this.boids[j].vx * weight;
				totalVy += this.boids[j].vy * weight;
				totalWeight += weight;
			}

			if (totalWeight > 0)
			{
				boid.x += (totalX / totalWeight - boid.x) * this.centeringFactor;
				boid.y += (totalY / totalWeight - boid.y) * this.centeringFactor;

				boid.vx += (totalVx / totalWeight - boid.vx) * this.alignmentFactor;
				boid.vy += (totalVy / totalWeight - boid.vy) * this.alignmentFactor;
			}

			

			const xFactor = Math.exp(
				(Math.abs(boid.x) - (this.wilson.worldWidth / 2 - 0.075)) * 15
			);
			const yFactor = Math.exp(
				(Math.abs(boid.y) - (this.wilson.worldHeight / 2 - 0.075)) * 15
			);

			boid.vx -= Math.sign(boid.x) * xFactor * this.turnFactor;
			boid.vy -= Math.sign(boid.y) * yFactor * this.turnFactor;



			// Clamp velocity and move the boid.
			const v2 = boid.vx * boid.vx + boid.vy * boid.vy;

			if (v2 > this.maxVelocity * this.maxVelocity)
			{
				const v = Math.sqrt(v2);
				boid.vx = this.maxVelocity * boid.vx / v;
				boid.vy = this.maxVelocity * boid.vy / v;
			}

			else if (v2 < this.minVelocity * this.minVelocity)
			{
				const v = Math.sqrt(v2);
				boid.vx = this.minVelocity * boid.vx / v;
				boid.vy = this.minVelocity * boid.vy / v;
			}
			
			boid.x += boid.vx * (this.lastTimeElapsed / 6.944);
			boid.y += boid.vy * (this.lastTimeElapsed / 6.944);
		}
	}

	updateBoidsOfPrey()
	{
		for (let i = 0; i < this.numBoidsOfPrey; i++)
		{
			const boidOfPrey = this.boidsOfPrey[i];

			// Steer agressively toward nearby boids and away from other boids of prey.
			let closeDx = 0;
			let closeDy = 0;

			for (let j = this.avoidCycle; j < this.numBoids; j += this.numAvoidCycles)
			{
				const dx = boidOfPrey.x - this.boids[j].x;
				const dy = boidOfPrey.y - this.boids[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.preyRange);
				closeDy += dy * Math.exp(-d / this.preyRange);
			}
			
			// This flips a sign.
			boidOfPrey.vx -= closeDx * this.preyFactor;
			boidOfPrey.vy -= closeDy * this.preyFactor;



			closeDx = 0;
			closeDy = 0;

			for (let j = 0; j < this.numBoidsOfPrey; j++)
			{
				if (i === j)
				{
					continue;
				}

				const dx = boidOfPrey.x - this.boidsOfPrey[j].x;
				const dy = boidOfPrey.y - this.boidsOfPrey[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.avoidRange);
				closeDy += dy * Math.exp(-d / this.avoidRange);
			}

			boidOfPrey.vx += closeDx * this.avoidFactor;
			boidOfPrey.vy += closeDy * this.avoidFactor;



			// Slightly avoid boids of prey.
			closeDx = 0;
			closeDy = 0;

			for (let j = 0; j < this.numBoidsOfPrey; j++)
			{
				if (i === j)
				{
					continue;
				}

				const dx = boidOfPrey.x - this.boidsOfPrey[j].x;
				const dy = boidOfPrey.y - this.boidsOfPrey[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.fearRange);
				closeDy += dy * Math.exp(-d / this.fearRange);
			}

			if (this.usingCursorAsPredator)
			{
				const dx = boidOfPrey.x - this.cursorPredatorLocation[0];
				const dy = boidOfPrey.y - this.cursorPredatorLocation[1];
				const d = Math.sqrt(dx * dx + dy * dy);

				closeDx += dx * Math.exp(-d / this.fearRange);
				closeDy += dy * Math.exp(-d / this.fearRange);
			}

			boidOfPrey.vx += closeDx * this.fearFactor * 0.05;
			boidOfPrey.vy += closeDy * this.fearFactor * 0.05;



			// Center with nearby boids, but don't align.
			let totalX = 0;
			let totalY = 0;
			let totalWeight = 0;

			for (let j = this.alignCycle; j < this.numBoids; j += this.numAlignCycles)
			{
				if (i === j)
				{
					continue;
				}

				const dx = boidOfPrey.x - this.boids[j].x;
				const dy = boidOfPrey.y - this.boids[j].y;
				const d = Math.sqrt(dx * dx + dy * dy);
				const weight = Math.exp(-d / (this.alignmentRange * 5));

				totalX += this.boids[j].x * weight;
				totalY += this.boids[j].y * weight;
				totalWeight += weight;
			}

			if (totalWeight > 0)
			{
				boidOfPrey.x += (totalX / totalWeight - boidOfPrey.x)
					* this.centeringFactor * 3;
				boidOfPrey.y += (totalY / totalWeight - boidOfPrey.y)
					* this.centeringFactor * 3;
			}

			

			const xFactor = Math.exp(
				(Math.abs(boidOfPrey.x) - (this.wilson.worldWidth / 2 - 0.075)) * 15
			);
			const yFactor = Math.exp(
				(Math.abs(boidOfPrey.y) - (this.wilson.worldHeight / 2 - 0.075)) * 15
			);

			boidOfPrey.vx -= Math.sign(boidOfPrey.x) * xFactor * this.turnFactor;
			boidOfPrey.vy -= Math.sign(boidOfPrey.y) * yFactor * this.turnFactor;



			// Clamp velocity and move the boid.
			const v2 = boidOfPrey.vx * boidOfPrey.vx + boidOfPrey.vy * boidOfPrey.vy;

			if (v2 > this.maxVelocity * this.maxVelocity)
			{
				const v = Math.sqrt(v2);
				boidOfPrey.vx = this.maxVelocity * boidOfPrey.vx / v;
				boidOfPrey.vy = this.maxVelocity * boidOfPrey.vy / v;
			}

			else if (v2 < this.minVelocity * this.minVelocity)
			{
				const v = Math.sqrt(v2);
				boidOfPrey.vx = this.minVelocity * boidOfPrey.vx / v;
				boidOfPrey.vy = this.minVelocity * boidOfPrey.vy / v;
			}
			
			boidOfPrey.x += boidOfPrey.vx * (this.lastTimeElapsed / 6.944);
			boidOfPrey.y += boidOfPrey.vy * (this.lastTimeElapsed / 6.944);
		}
	}

	onGrabCanvas({ x, y, event })
	{
		event.preventDefault();
		this.usingCursorAsPredator = true;
		this.cursorPredatorLocation = [x, y];
	}

	onReleaseCanvas()
	{
		this.usingCursorAsPredator = false;
	}
}