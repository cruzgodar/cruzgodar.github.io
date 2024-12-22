import {
	doubleEncodingGlsl,
	getGlslBundle,
	loadGlsl
} from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import {
	getFloatGlsl,
	getMaxGlslString,
	tempShader
} from "/scripts/applets/applet.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class VectorFields extends AnimationFrameApplet
{
	loadPromise;

	resolution = 500;

	lastWorldCenterX;
	lastWorldCenterY;
	lastWorldWidth;

	numParticles = 0;
	maxParticles = 5000;
	loopEdges = false;
	particleDilation;

	dt = .00375;
	lifetime = 150;

	// A long array of particles of the form [x, y, remaining lifetime].
	particles = [];
	freeParticleSlots = [];

	updateTexture;
	dimTexture;

	updateCanvas;
	dimCanvas;
	wilsonUpdate;
	wilsonDim;

	timeElapsedHistoryLength = 60;
	lastTimeElapsed = new Array(this.timeElapsedHistoryLength);
	averageTimeElapsed;
	frame = 0;

	drawFrameCallback = () => {};
	


	constructor({
		canvas,
		// draggables = {},
		loopEdges = false,
	}) {
		super(canvas);

		this.loopEdges = loopEdges;

		this.updateCanvas = this.createHiddenCanvas(false);
		this.dimCanvas = this.createHiddenCanvas(false);

		const optionsUpdate =
		{
			shader: tempShader,

			canvasWidth: 100,
			canvasHeight: 100,
		};

		this.wilsonUpdate = new WilsonGPU(this.updateCanvas, optionsUpdate);



		this.wilsonUpdate.createFramebufferTexturePair({
			id: "update",
			textureType: "float"
		});
		this.wilsonUpdate.useFramebuffer(null);
		this.wilsonUpdate.useTexture("update");



		const shaderPanAndZoom = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dimAmount;
			uniform mat2 transform;
			
			void main(void)
			{
				vec2 texCoord = transform * ((uv + vec2(1.0, 1.0)) / 2.0);
				
				if (texCoord.x >= 0.0 && texCoord.x < 1.0 && texCoord.y >= 0.0 && texCoord.y < 1.0)
				{
					vec3 v = texture2D(uTexture, texCoord).xyz;
					
					gl_FragColor = vec4(v.x - dimAmount, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const optionsDim =
		{
			shader: shaderPanAndZoom,

			uniforms: {
				dimAmount: 1 / 255,
				transform: [[1, 0], [0, 1]]
			},

			canvasWidth: this.resolution,
		};

		this.wilsonDim = new WilsonGPU(this.dimCanvas, optionsDim);

		this.wilsonDim.createFramebufferTexturePair({
			id: "dim",
			textureType: "unsignedByte"
		});
		this.wilsonDim.useFramebuffer(null);
		this.wilsonDim.useTexture("dim");

		this.dimTexture = new Uint8Array(this.resolution * this.resolution * 4);



		const shaderDraw = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float maxBrightness;

			uniform vec2 stepSize;
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}

			vec3 getPixel(vec2 uv)
			{
				vec3 v = texture2D(uTexture, (vec2(1.0 + uv.x, 1.0 - uv.y)) / 2.0).xyz;

				return hsv2rgb(vec3(v.y, v.z, v.x / maxBrightness));
			}
			
			void main(void)
			{
				${this.getSamplingGlsl()}
			}
		`;

		const options =
		{
			shader: shaderDraw,

			uniforms: {
				maxBrightness: this.lifetime / 255,
				stepSize: [2 / this.resolution, 2 / this.resolution],
			},

			canvasWidth: this.resolution,

			worldWidth: 2 * Math.PI,

			minWorldWidth: 0.0001,
			maxWorldWidth: 100,
			minWorldHeight: 0.0001,
			maxWorldHeight: 100,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			fullscreenOptions: {
				fillScreen: true,
				onSwitch: this.generateNewField.bind(this, {}),
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			}

			// useDraggables: true,

			// draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			// draggablesTouchmoveCallback: this.onDragDraggable.bind(this),
		};

		this.wilson = new WilsonGPU(canvas, options);

		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;
		this.lastWorldWidth = this.wilson.worldWidth;

		this.wilson.createFramebufferTexturePair({
			id: "draw",
			textureType: "unsignedByte"
		});
		this.wilson.useFramebuffer(null);
		this.wilson.useTexture("draw");

		this.loadPromise = loadGlsl();
	}



	run({
		generatingCode,
		resolution = 500,
		maxParticles = 10000,
		dt = .00375,
		lifetime = 150,
		worldWidth = 2 * Math.PI,
		worldCenterX = 0,
		worldCenterY = 0,
		particleDilation = undefined,
		appendGlsl = ""
	}) {
		this.dt = dt;
		this.resolution = resolution;
		this.particleDilation = particleDilation;

		const shaderUpdateBase = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dt;
			
			// uniform vec2 draggableArg;
			// uniform vec2 draggableArg2;
			
			
			
			${getGlslBundle(generatingCode)}
			
			${doubleEncodingGlsl}
			
			vec2 f(float x, float y)
			{
				${appendGlsl}

				return vec2${generatingCode};
			}
			
			
			
			void main(void)
			{
				vec4 sample = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0);
				
				if (int(sample.z) == 0)
				{
					return;
				}
				
				vec2 d = f(sample.x, sample.y);
		`;

		const shaderUpdateX = /* glsl */`
				${shaderUpdateBase}
				
				gl_FragColor = encodeFloat(dt * d.x + sample.x);
			}
		`;

		const shaderUpdateY = /* glsl */`
				${shaderUpdateBase}
				
				gl_FragColor = encodeFloat(dt * d.y + sample.y);
			}
		`;

		const shaderUpdateH = /* glsl */`
				${shaderUpdateBase}
				
				gl_FragColor = encodeFloat((atan(d.y, d.x) + 3.14159265) / 6.28318531);
			}
		`;

		const shaderUpdateS = /* glsl */`
				${shaderUpdateBase}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y)));
			}
		`;

		const shaderUpdateS2 = /* glsl */`
				${shaderUpdateBase}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * .9 * (d.x * d.x + d.y * d.y)));
			}
		`;

		this.wilsonUpdate.loadShader({
			id: "updateX",
			source: shaderUpdateX,
			uniforms: {
				dt: this.dt,
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateY",
			source: shaderUpdateY,
			uniforms: {
				dt: this.dt,
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateH",
			source: shaderUpdateH,
		});

		this.wilsonUpdate.loadShader({
			id: "updateS",
			source: shaderUpdateS,
		});

		this.wilsonUpdate.loadShader({
			id: "updateS2",
			source: shaderUpdateS2,
		});

		this.wilson.setUniforms({ maxBrightness: this.lifetime / 255 });



		// this.wilson.draggables.draggables[0].style.display =
		// 	generatingCode.indexOf("draggableArg") !== -1 ? "block" : "none";
		
		// this.wilson.draggables.draggables[1].style.display =
		// 	generatingCode.indexOf("draggableArg2") !== -1 ? "block" : "none";



		this.generateNewField({
			resolution,
			maxParticles,
			dt,
			lifetime,
			worldWidth,
			worldCenterX,
			worldCenterY,
		});
	}



	getSamplingGlsl()
	{
		const radius = this.particleDilation ?? Math.floor(this.resolution / 500);

		if (radius === 0)
		{
			return /* glsl */`
				gl_FragColor = vec4(getPixel(uv), 1.0);
			`;
		}
		if (radius === 1)
		{
			return /* glsl */`
				vec3 distance1 = getPixel(uv);

				// Make a 2x2 square down and right.
				vec3 distance2 = getPixel(uv + vec2(stepSize.x, 0.0));
				vec3 distance3 = getPixel(uv + vec2(0.0, stepSize.y));
				vec3 distance4 = getPixel(uv + stepSize);

				gl_FragColor = vec4(${getMaxGlslString("distance", 4)}, 1.0);
			`;
		}

		let glsl = "";
		let numDistances = 0;

		for (let i = -radius + 1; i < radius; i++)
		{
			for (let j = -radius + 1; j < radius; j++)
			{
				const distanceToCenter2 = i * i + j * j;

				if (distanceToCenter2 > (radius - 0.5) * (radius - 0.5))
				{
					continue;
				}

				numDistances++;
				glsl += /* glsl */`
					vec3 distance${numDistances} = getPixel(
						uv + vec2(
							${getFloatGlsl(i)} * stepSize.x,
							${getFloatGlsl(j)} * stepSize.y
						)
					);
				`;
			}
		}

		glsl += /* glsl */`
			gl_FragColor = vec4(${getMaxGlslString("distance", numDistances)}, 1.0);
		`;

		return glsl;
	}



	generateNewField({
		resolution = this.resolution,
		maxParticles = this.maxParticles,
		dt = this.dt,
		lifetime = this.lifetime,
		worldWidth = this.wilson.worldWidth,
		worldCenterX = this.wilson.worldCenterX,
		worldCenterY = this.wilson.worldCenterY,
	}) {
		this.resolution = resolution;
		this.maxParticles = maxParticles;
		this.dt = dt;
		this.lifetime = lifetime;

		this.wilson.resizeCanvas({ width: resolution });

		this.wilson.setUniforms({
			maxBrightness: this.lifetime / 255,
			stepSize: [2 / this.wilson.canvasWidth, 2 / this.wilson.canvasHeight]
		});

		this.wilson.resizeWorld({
			width: worldWidth,
			centerX: worldCenterX,
			centerY: worldCenterY
		});

		this.numParticles = 0;

		const updateResolution = Math.ceil(Math.sqrt(maxParticles));
		this.wilsonUpdate.resizeCanvas({ width: updateResolution });



		this.particles = new Array(this.maxParticles);
		this.freeParticleSlots = new Array(this.maxParticles);

		for (let i = 0; i < this.maxParticles; i++)
		{
			// x, y, lifetime, hue, saturation
			this.particles[i] = [0, 0, 0];
			this.freeParticleSlots[i] = i;
		}



		this.updateTexture = new Float32Array(
			this.wilsonUpdate.canvasWidth * this.wilsonUpdate.canvasHeight * 4
		);

		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				this.updateTexture[4 * index] = 0.0;
				this.updateTexture[4 * index + 1] = 0.0;
				this.updateTexture[4 * index + 2] = 0.0;
				this.updateTexture[4 * index + 3] = 0.0;
			}
		}



		this.dimTexture = new Uint8Array(this.wilson.canvasWidth * this.wilson.canvasHeight * 4);

		for (let i = 0; i < this.wilson.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilson.canvasWidth; j++)
			{
				const index = this.wilson.canvasWidth * i + j;

				this.dimTexture[4 * index] = 0;
				this.dimTexture[4 * index + 1] = 0;
				this.dimTexture[4 * index + 2] = 0;
			}
		}



		this.resume();
	}



	drawFrame(timeElapsed)
	{
		// Wrapping everything in a try block and eating the occasional error is pretty gross,
		// but it's actually a decent solution: everything is fine unless the user
		// resizes the window faster than the screen refresh rate, meaning we access out of bounds
		// in the middle of this function. We can fix that by just restarting whenever it happens.
		// try
		// {
			this.wilsonUpdate.setUniforms({
				dt: this.dt * timeElapsed / 6.944
			}, "updateX");

			this.wilsonUpdate.setUniforms({
				dt: this.dt * timeElapsed / 6.944
			}, "updateY");

			if (this.frame < this.timeElapsedHistoryLength)
			{
				this.lastTimeElapsed[this.frame] = Math.min(timeElapsed, 16);

				if (this.frame === this.timeElapsedHistoryLength - 1)
				{
					let totalTimeElapsed = 0;

					for (let i = 0; i < this.timeElapsedHistoryLength; i++)
					{
						totalTimeElapsed += this.lastTimeElapsed[i];
					}

					this.wilsonDim.setUniforms({
						dimAmount: (totalTimeElapsed / this.timeElapsedHistoryLength)
							/ (6.944 * 255)
					});
				}

				this.frame++;
			}



			// If there's not enough particles, we add what's missing,
			// capped at 1% of the total particle count.
			if (this.numParticles < this.maxParticles)
			{
				// We find the first open slot we can and search from the end
				// of the list so that we can slice more efficiently.
				const numToAdd = Math.min(
					Math.ceil(this.maxParticles / 80),
					this.maxParticles - this.numParticles
				);

				for (
					let i = this.freeParticleSlots.length - numToAdd;
					i < this.freeParticleSlots.length;
					i++
				) {
					this.createParticle(this.freeParticleSlots[i]);
				}

				this.freeParticleSlots.splice(this.freeParticleSlots.length - numToAdd, numToAdd);
			}



			// this.lastPanVelocitiesX.push(this.nextPanVelocityX);
			// this.lastPanVelocitiesY.push(this.nextPanVelocityY);
			// this.lastPanVelocitiesX.shift();
			// this.lastPanVelocitiesY.shift();

			// // This lets us only move the canvas when we have at least one pixel to move.
			// if (this.nextPanVelocityX !== 0 || this.nextPanVelocityY !== 0)
			// {
			// 	let xDelta = -this.nextPanVelocityX;
			// 	let yDelta = -this.nextPanVelocityY;



			// 	if (Math.abs(xDelta / this.wilson.worldWidth * this.wilson.canvasWidth) < 1)
			// 	{
			// 		xDelta = 0;
			// 	}

			// 	else
			// 	{
			// 		this.nextPanVelocityX = 0;
			// 	}



			// 	if (Math.abs(yDelta / this.wilson.worldHeight * this.wilson.canvasHeight) < 1)
			// 	{
			// 		yDelta = 0;
			// 	}

			// 	else
			// 	{
			// 		this.nextPanVelocityY = 0;
			// 	}



			// 	if (xDelta !== 0 || yDelta !== 0)
			// 	{
			// 		this.panGrid(xDelta, yDelta);

			// 		this.wilson.worldCenterY -= yDelta;
			// 		this.wilson.worldCenterX -= xDelta;
			// 	}
			// }

			// else if (this.panVelocityX !== 0 || this.panVelocityY !== 0)
			// {
			// 	let xDelta = -this.panVelocityX * timeElapsed / 6.944;
			// 	let yDelta = -this.panVelocityY * timeElapsed / 6.944;

			// 	if (Math.abs(xDelta / this.wilson.worldWidth * this.wilson.canvasWidth) < 1)
			// 	{
			// 		xDelta = 0;
			// 	}

			// 	if (Math.abs(yDelta / this.wilson.worldHeight * this.wilson.canvasHeight) < 1)
			// 	{
			// 		yDelta = 0;
			// 	}

			// 	this.panGrid(xDelta, yDelta);

			// 	this.wilson.worldCenterY -= yDelta;
			// 	this.panVelocityY *= this.panFriction ** (timeElapsed / 6.944);

			// 	this.wilson.worldCenterX -= xDelta;
			// 	this.panVelocityX *= this.panFriction ** (timeElapsed / 6.944);

			// 	if (this.panVelocityX ** 2 + this.panVelocityY ** 2 <
			// 		this.panVelocityStopThreshhold ** 2)
			// 	{
			// 		this.panVelocityX = 0;
			// 		this.panVelocityY = 0;
			// 	}
			// }



			// this.lastZoomVelocities.push(this.nextZoomVelocity);
			// this.lastZoomVelocities.shift();

			// if (this.nextZoomVelocity !== 0)
			// {
			// 	this.zoomCanvas();

			// 	this.zoomGrid(this.fixedPointX, this.fixedPointY, this.nextZoomVelocity);

			// 	this.nextZoomVelocity = 0;
			// }

			// if (this.zoomVelocity !== 0)
			// {
			// 	this.zoomCanvas(this.fixedPointX, this.fixedPointY);

			// 	this.zoomGrid(this.fixedPointX, this.fixedPointY, this.zoomVelocity);

			// 	this.zoomLevel = Math.min(
			// 		Math.max(
			// 			this.zoomLevel + this.zoomVelocity * timeElapsed / 6.944,
			// 			-3
			// 		),
			// 		3
			// 	);

			// 	this.zoomVelocity *= this.zoomFriction ** (timeElapsed / 6.944);

			// 	if (Math.abs(this.zoomVelocity) < this.zoomVelocityStopThreshhold)
			// 	{
			// 		this.zoomVelocity = 0;
			// 	}
			// }



			this.updateParticles(timeElapsed);

			this.drawField();

			this.drawFrameCallback();

			this.needNewFrame = true;
		// }

		// // eslint-disable-next-line no-unused-vars
		// catch(_ex)
		// {
		// 	this.generateNewField({});
		// }
	}



	createParticle(index)
	{
		this.particles[index][0] = this.wilson.worldCenterX
			+ this.wilson.worldWidth * (Math.random() - .5);

		this.particles[index][1] = this.wilson.worldCenterY
			+ this.wilson.worldHeight * (Math.random() - .5);

		this.particles[index][2] = Math.round(this.lifetime * (Math.random() * .5 + .75));

		this.numParticles++;
	}

	destroyParticle(index)
	{
		// Set the lifetime to 0 if it wasn't already.
		this.particles[index][2] = 0;

		this.freeParticleSlots.push(index);

		this.numParticles--;
	}

	updateParticles()
	{
		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				if (index < this.particles.length && this.particles[index][2])
				{
					this.updateTexture[4 * index] = this.particles[index][0];
					this.updateTexture[4 * index + 1] = this.particles[index][1];
					this.updateTexture[4 * index + 2] = 1.0;
				}

				else
				{
					this.updateTexture[4 * index + 2] = 0.0;
				}
			}
		}

		this.wilsonUpdate.setTexture({
			id: "update",
			data: this.updateTexture
		});

		this.wilsonUpdate.useShader("updateX");
		this.wilsonUpdate.drawFrame();
		const floatsX = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		this.wilsonUpdate.useShader("updateY");
		this.wilsonUpdate.drawFrame();
		const floatsY = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		this.wilsonUpdate.useShader("updateH");
		this.wilsonUpdate.drawFrame();
		const floatsH = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		this.wilsonUpdate.useShader("updateS");
		this.wilsonUpdate.drawFrame();
		const floatsS = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		// Extremely hacky way to fix the saturation bug on iOS.
		this.wilsonUpdate.useShader("updateS2");
		this.wilsonUpdate.drawFrame();
		const floatsS2 = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				if (index < this.particles.length && this.particles[index][2])
				{
					this.particles[index][0] = floatsX[index];
					this.particles[index][1] = floatsY[index];

					let row = Math.round(
						(
							.5 - (
								this.particles[index][1] - this.wilson.worldCenterY
							) / this.wilson.worldHeight
						) * this.wilson.canvasHeight);

					let col = Math.round(
						(
							(this.particles[index][0] - this.wilson.worldCenterX)
								/ this.wilson.worldWidth
								+ .5
						) * this.wilson.canvasWidth
					);

					if (this.loopEdges)
					{
						if (row >= this.wilson.canvasHeight)
						{
							row = 2 * this.wilson.canvasHeight - 2 - row;
							col += Math.floor(this.wilson.canvasWidth / 2);
						}

						else if (row < 0)
						{
							row = Math.abs(row);
							col += Math.floor(this.wilson.canvasWidth / 2);
						}

						if (col >= this.wilson.canvasWidth)
						{
							col -= this.wilson.canvasWidth;
						}

						else if (col < 0)
						{
							col += this.wilson.canvasWidth;
						}
					}

					if (
						row >= 0
						&& row < this.wilson.canvasHeight
						&& col >= 0
						&& col < this.wilson.canvasWidth
					) {
						const newIndex = row * this.wilson.canvasWidth + col;

						this.dimTexture[4 * newIndex] = this.lifetime;
						this.dimTexture[4 * newIndex + 1] = floatsH[index] * 255;

						this.dimTexture[4 * newIndex + 2] =
							Math.max(floatsS[index], floatsS2[index]) * 255;

						this.particles[index][2]--;

						if (this.particles[index][2] <= 0)
						{
							this.destroyParticle(index);
						}
					}

					else
					{
						this.destroyParticle(index);
					}
				}
			}
		}
	}



	drawField()
	{
		this.wilsonDim.setTexture({
			id: "dim",
			data: this.dimTexture
		});

		this.wilsonDim.drawFrame();
		this.dimTexture = this.wilsonDim.readPixels();

		this.wilson.setTexture({
			id: "draw",
			data: this.dimTexture
		});

		this.wilson.drawFrame();
	}



	// // Call this before changing the world parameters!
	// panGrid(xDelta, yDelta)
	// {
	// 	this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[1]);

	// 	this.wilsonDim.gl.uniform2f(
	// 		this.wilsonDim.uniforms.pan[1],
	// 		xDelta / this.wilson.worldWidth, -yDelta / this.wilson.worldHeight
	// 	);

	// 	this.drawField();

	// 	this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);

	// 	this.wilson.draggables.recalculateLocations();
	// }



	// // Call this before changing the world parameters!
	// zoomGrid(fixedPointX, fixedPointY, zoomDelta)
	// {
	// 	if (this.zoomLevel <= -3 || this.zoomLevel >= 3)
	// 	{
	// 		return;
	// 	}

	// 	// Ex: if the scale is 2 and goes to 3, the delta is +1,
	// 	// so we actually want to multiply things by 2^(-1) to get the source places.
	// 	const scale = Math.pow(2, zoomDelta);

	// 	const fixedX = (fixedPointX - this.wilson.worldCenterX) / this.wilson.worldWidth + .5;
	// 	const fixedY = (this.wilson.worldCenterY - fixedPointY) / this.wilson.worldHeight + .5;



	// 	this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[2]);

	// 	this.wilsonDim.gl.uniform1f(this.wilsonDim.uniforms.scale[2], scale);
	// 	this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms.fixedPoint[2], fixedX, fixedY);

	// 	this.drawField();

	// 	this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);

	// 	this.wilson.draggables.recalculateLocations();


	// 	// When we zoom out, we also cull the particles a little.
	// 	if (zoomDelta > 0)
	// 	{
	// 		const chance = Math.pow(2, zoomDelta * 1.5);

	// 		for (let i = 0; i < this.particles.length; i++)
	// 		{
	// 			if (this.particles[i][2] && (i % chance >= 1))
	// 			{
	// 				this.destroyParticle(i);
	// 			}
	// 		}
	// 	}
	// }



	// onDragDraggable(
	// 	activeDraggable = 0,
	// 	x = this.wilson.draggables.worldCoordinates[0][0],
	// 	y = this.wilson.draggables.worldCoordinates[0][1]
	// ) {
	// 	const uniforms = activeDraggable === 0
	// 		? this.wilsonUpdate.uniforms.draggableArg
	// 		: this.wilsonUpdate.uniforms.draggableArg2;

	// 	for (let i = 0; i < 5; i++)
	// 	{
	// 		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[i]);
	// 		this.wilsonUpdate.gl.uniform2f(uniforms[i], x, y);
	// 	}
	// }



	// onGrabCanvas()
	// {
	// 	this.panVelocityX = 0;
	// 	this.panVelocityY = 0;
	// 	this.zoomVelocity = 0;

	// 	this.lastPanVelocitiesX = [0, 0, 0, 0];
	// 	this.lastPanVelocitiesY = [0, 0, 0, 0];
	// 	this.lastZoomVelocities = [0, 0, 0, 0];
	// }

	// onDragCanvas(x, y, xDelta, yDelta)
	// {
	// 	// The += here lets us only move the canvas when we have at least one pixel to move.
	// 	this.nextPanVelocityX += -xDelta;
	// 	this.nextPanVelocityY += -yDelta;
	// }

	// onReleaseCanvas()
	// {
	// 	let maxIndex = 0;

	// 	this.lastPanVelocitiesX.forEach((velocity, index) =>
	// 	{
	// 		if (Math.abs(velocity) > this.panVelocityX)
	// 		{
	// 			this.panVelocityX = Math.abs(velocity);
	// 			maxIndex = index;
	// 		}
	// 	});

	// 	if (this.panVelocityX < this.panVelocityStartThreshhold)
	// 	{
	// 		this.panVelocityX = 0;
	// 	}

	// 	else
	// 	{
	// 		this.panVelocityX = this.lastPanVelocitiesX[maxIndex];
	// 	}



	// 	this.lastPanVelocitiesY.forEach((velocity, index) =>
	// 	{
	// 		if (Math.abs(velocity) > this.panVelocityY)
	// 		{
	// 			this.panVelocityY = Math.abs(velocity);
	// 			maxIndex = index;
	// 		}
	// 	});

	// 	if (this.panVelocityY < this.panVelocityStartThreshhold)
	// 	{
	// 		this.panVelocityY = 0;
	// 	}

	// 	else
	// 	{
	// 		this.panVelocityY = this.lastPanVelocitiesY[maxIndex];
	// 	}



	// 	this.lastZoomVelocities.forEach((velocity, index) =>
	// 	{
	// 		if (Math.abs(velocity) > this.zoomVelocity)
	// 		{
	// 			this.zoomVelocity = Math.abs(velocity);
	// 			maxIndex = index;
	// 		}
	// 	});

	// 	if (this.zoomVelocity < this.zoomVelocityStartThreshhold)
	// 	{
	// 		this.zoomVelocity = 0;
	// 	}

	// 	else
	// 	{
	// 		this.zoomVelocity = this.lastZoomVelocities[maxIndex];
	// 	}
	// }



	// onWheelCanvas(x, y, scrollAmount)
	// {
	// 	this.fixedPointX = x;
	// 	this.fixedPointY = y;

	// 	if (Math.abs(scrollAmount / 100) < .3)
	// 	{
	// 		this.nextZoomVelocity = scrollAmount / 100;

	// 		this.zoomLevel = Math.min(Math.max(this.zoomLevel + scrollAmount / 100, -3), 3);
	// 	}

	// 	else
	// 	{
	// 		this.zoomVelocity += Math.sign(scrollAmount) * .05;
	// 	}
	// }



	// onPinchCanvas(x, y, touchDistanceDelta)
	// {
	// 	let zoomDelta;

	// 	if (this.aspectRatio >= 1)
	// 	{
	// 		zoomDelta = touchDistanceDelta / this.wilson.worldWidth * 10;
	// 	}

	// 	else
	// 	{
	// 		zoomDelta = touchDistanceDelta / this.wilson.worldHeight * 10;
	// 	}

	// 	this.zoomLevel = Math.min(Math.max(this.zoomLevel - zoomDelta, -3), 3);
	// 	this.nextZoomVelocity = -zoomDelta;

	// 	this.fixedPointX = x;
	// 	this.fixedPointY = y;
	// }



	// zoomCanvas()
	// {
	// 	if (this.aspectRatio >= 1)
	// 	{
	// 		const newWorldCenter = this.wilson.input.getZoomedWorldCenter(
	// 			this.fixedPointX,
	// 			this.fixedPointY,
	// 			4 * Math.pow(2, this.zoomLevel) * this.aspectRatio,
	// 			4 * Math.pow(2, this.zoomLevel)
	// 		);

	// 		this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
	// 		this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);

	// 		this.wilson.worldCenterX = newWorldCenter[0];
	// 		this.wilson.worldCenterY = newWorldCenter[1];
	// 	}

	// 	else
	// 	{
	// 		const newWorldCenter = this.wilson.input.getZoomedWorldCenter(
	// 			this.fixedPointX,
	// 			this.fixedPointY,
	// 			4 * Math.pow(2, this.zoomLevel),
	// 			4 * Math.pow(2, this.zoomLevel) / this.aspectRatio
	// 		);

	// 		this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
	// 		this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;

	// 		this.wilson.worldCenterX = newWorldCenter[0];
	// 		this.wilson.worldCenterY = newWorldCenter[1];
	// 	}

	// 	this.wilson.draggables.recalculateLocations();
	// }
}