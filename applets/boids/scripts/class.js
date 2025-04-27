import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class Boids extends AnimationFrameApplet
{
	resolution = 2000;
	numBoids = 500;

	// Each entry is of the form
	// {
	// 	x: number,
	// 	y: number,
	// 	vx: number,
	// 	vy: number,
	// }.
	boids = [];

	// world units per frame.

	boidSize = 0.01;
	minVelocity;
	maxVelocity;

	alignmentRange;
	alignmentFactor;
	avoidRange;
	avoidFactor;
	centeringFactor;

	frameCycle = 0;
	numFrameCycles;

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonCPU(canvas, options);

		this.run({});
	}



	run({
		resolution = 2000,
		numBoids = 500,
		minVelocity = 0.002,
		maxVelocity = 0.004,
		alignmentRange = 0.1,
		alignmentFactor = 0.05,
		avoidRange = 0.01,
		avoidFactor = 0.05,
		centeringFactor = 0.0005,
	}) {
		this.resolution = resolution;
		this.numBoids = numBoids;
		this.minVelocity = minVelocity;
		this.maxVelocity = maxVelocity;
		this.alignmentRange = alignmentRange;
		this.alignmentFactor = alignmentFactor;
		this.avoidRange = avoidRange;
		this.avoidFactor = avoidFactor;
		this.centeringFactor = centeringFactor;

		this.numFrameCycles = Math.ceil(this.numBoids / 100);

		this.wilson.resizeCanvas({ width: this.resolution });

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

		this.resume();
	}

	drawFrame()
	{
		this.frameCycle = (this.frameCycle + 1) % this.numFrameCycles;
		this.updateBoids();



		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);

		for (let i = 0; i < this.numBoids; i++)
		{
			const boid = this.boids[i];
			const x = boid.x;
			const y = boid.y;
			const theta = Math.atan2(boid.vy, boid.vx);
			const v2 = boid.vx * boid.vx + boid.vy * boid.vy;
	
			const rgb = hsvToRgb(
				theta / (2 * Math.PI) + 0.5,
				v2 / (this.maxVelocity * this.maxVelocity),
				1
			);
			this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			// Draw an isoceles triangle centered at (x, y) and pointing toward (x + vx, y + vy).
			const theta2 = theta + 2 * Math.PI / 3;
			const theta3 = theta + 4 * Math.PI / 3;
			
			const x1 = x + 2 * Math.cos(theta) * this.boidSize;
			const y1 = y + 2 * Math.sin(theta) * this.boidSize;

			const x2 = x + Math.cos(theta2) * this.boidSize;
			const y2 = y + Math.sin(theta2) * this.boidSize;
			
			const x3 = x + Math.cos(theta3) * this.boidSize;
			const y3 = y + Math.sin(theta3) * this.boidSize;

			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(...this.wilson.interpolateWorldToCanvas([x1, y1]));
			this.wilson.ctx.lineTo(...this.wilson.interpolateWorldToCanvas([x2, y2]));
			this.wilson.ctx.lineTo(...this.wilson.interpolateWorldToCanvas([x, y]));
			this.wilson.ctx.lineTo(...this.wilson.interpolateWorldToCanvas([x3, y3]));
			this.wilson.ctx.closePath();

			this.wilson.ctx.fill();
		}

		this.needNewFrame = true;
	}

	updateBoids()
	{
		for (let i = 0; i < this.numBoids; i++)
		{
			const boid = this.boids[i];

			// Avoid other boids.
			let closeDx = 0;
			let closeDy = 0;

			for (let j = this.frameCycle; j < this.numBoids; j += this.numFrameCycles)
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



			// Align and center with nearby boids.
			let totalX = 0;
			let totalY = 0;
			let totalVx = 0;
			let totalVy = 0;
			let totalWeight = 0;

			for (let j = this.frameCycle; j < this.numBoids; j += this.numFrameCycles)
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
			
			boid.x += boid.vx;
			boid.y += boid.vy;

			// Wrap the boid around the world.
			if (boid.x < -this.wilson.worldWidth / 2)
			{
				boid.x += this.wilson.worldWidth;
			}

			else if (boid.x > this.wilson.worldWidth / 2)
			{
				boid.x -= this.wilson.worldWidth;
			}

			if (boid.y < -this.wilson.worldHeight / 2)
			{
				boid.y += this.wilson.worldHeight;
			}

			else if (boid.y > this.wilson.worldHeight / 2)
			{
				boid.y -= this.wilson.worldHeight;
			}
		}
	}
}