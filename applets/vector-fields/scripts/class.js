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

	// Tracks the subpixels from panning and zooming.
	// Whenever either is at least 1, we need to move the canvas.
	subpixelWorldCenterMovement = [0, 0];
	lastWorldCenterX;
	lastWorldCenterY;
	lastWorldWidth;
	lastScale = 1;
	needTemporaryDim = false;

	numParticles = 0;
	maxParticles = 5000;
	loopEdges = false;
	particleDilation;
	needStepSize = true;

	dt = .00375;
	lifetime = 150;

	// A long array of particles of the form [x, y, remaining lifetime].
	particles = [];
	freeParticleSlots = [];

	updateTexture;
	panZoomDimTexture;

	updateCanvas;
	panZoomDimCanvas;
	wilsonUpdate;
	wilsonPanZoomDim;

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

		this.panZoomDimCanvas = this.createHiddenCanvas();
		this.updateCanvas = this.createHiddenCanvas();

		const optionsUpdate =
		{
			shader: tempShader,

			canvasWidth: 100,
			canvasHeight: 100,
		};

		this.wilsonUpdate = new WilsonGPU(this.updateCanvas, optionsUpdate);



		const shaderPanZoomDim = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dimAmount;
			uniform float scale;
			uniform vec2 uvStep;
			uniform float temporaryDimFactor;
			
			void main(void)
			{
				vec2 texCoord = ((scale * uv + vec2(1.0, 1.0)) / 2.0) + uvStep;
				
				if (texCoord.x >= 0.0 && texCoord.x < 1.0 && texCoord.y >= 0.0 && texCoord.y < 1.0)
				{
					vec3 v = texture2D(uTexture, texCoord).xyz;
					
					gl_FragColor = vec4(
						(v.x - dimAmount) * temporaryDimFactor,
						v.y,
						v.z,
						1.0
					);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const optionsPanZoomDim =
		{
			shader: shaderPanZoomDim,

			uniforms: {
				dimAmount: 1 / 255,
				scale: 1,
				uvStep: [0, 0],
				temporaryDimFactor: 1
			},

			canvasWidth: this.resolution,

			fullscreenOptions: {
				fillScreen: true,
				animate: false,
				closeWithEscape: false,
			}
		};

		this.wilsonPanZoomDim = new WilsonGPU(this.panZoomDimCanvas, optionsPanZoomDim);

		this.wilsonPanZoomDim.canvas.parentElement.parentElement.parentElement.style.setProperty(
			"display",
			"none",
			"important"
		);



		const options =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			worldWidth: 2 * Math.PI,

			minWorldWidth: 0.5,
			maxWorldWidth: 20,
			minWorldHeight: 0.5,
			maxWorldHeight: 20,

			onResizeCanvas: this.generateNewField.bind(this, {}),

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			draggableOptions: {
				draggables: {
					draggableArg: [0, 0],
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
				}
			},

			fullscreenOptions: {
				fillScreen: true,
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				onSwitch: this.switchFullscreen.bind(this),
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			}
		};

		this.wilson = new WilsonGPU(canvas, options);

		this.wilson.draggables.draggableArg.element.style.display = "none";

		this.loadPromise = loadGlsl();
	}



	async run({
		generatingCode,
		resolution = 500,
		maxParticles = 6000,
		dt = .00375,
		lifetime = 150,
		worldWidth = 2 * Math.PI,
		worldCenterX = 0,
		worldCenterY = 0,
		particleDilation = undefined,
		appendGlsl = ""
	}) {
		await this.loadPromise;

		this.dt = dt;
		this.resolution = resolution;
		this.particleDilation = particleDilation;

		const needDraggable = generatingCode.indexOf("draggableArg") !== -1;



		const shaderUpdateBase = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dt;
			
			uniform vec2 draggableArg;
			
			
			
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
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateY",
			source: shaderUpdateY,
			uniforms: {
				dt: this.dt,
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateH",
			source: shaderUpdateH,
			uniforms: {
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateS",
			source: shaderUpdateS,
			uniforms: {
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateS2",
			source: shaderUpdateS2,
			uniforms: {
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
			}
		});

		

		const samplingGlsl = this.getSamplingGlsl();

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
				${samplingGlsl}
			}
		`;

		this.needStepSize = samplingGlsl.indexOf("stepSize") !== -1;

		this.wilson.loadShader({
			id: "draw",
			source: shaderDraw,
			uniforms: {
				maxBrightness: this.lifetime / 255,
				...(
					this.needStepSize
						? { stepSize: [2 / this.resolution, 2 / this.resolution] }
						: {}
				),
			}
		});

		this.wilson.setUniforms({ maxBrightness: this.lifetime / 255 });

		this.wilson.draggables.draggableArg.element.style.display =
			needDraggable ? "block" : "none";

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



	async generateNewField({
		resolution = this.resolution,
		maxParticles = this.maxParticles,
		dt = this.dt,
		lifetime = this.lifetime,
		worldWidth = this.wilson.worldWidth,
		worldCenterX = this.wilson.worldCenterX,
		worldCenterY = this.wilson.worldCenterY,
	}) {
		await this.loadPromise;

		this.resolution = resolution;
		this.maxParticles = maxParticles;
		this.dt = dt;
		this.lifetime = lifetime;

		this.wilson.resizeCanvas({ width: this.resolution });
		this.wilsonPanZoomDim.resizeCanvas({ width: this.resolution });
		
		this.wilson.setUniforms({
			maxBrightness: this.lifetime / 255,
			...(
				this.needStepSize
					? { stepSize: [2 / this.wilson.canvasWidth, 2 / this.wilson.canvasHeight] }
					: {}
			),
		});

		this.wilson.resizeWorld({
			width: worldWidth,
			centerX: worldCenterX,
			centerY: worldCenterY
		});

		this.numParticles = 0;

		const updateResolution = Math.ceil(Math.sqrt(maxParticles));
		this.wilsonUpdate.resizeCanvas({ width: updateResolution });



		this.wilsonUpdate.createFramebufferTexturePair({
			id: "update",
			textureType: "float"
		});
		this.wilsonUpdate.useFramebuffer(null);
		this.wilsonUpdate.useTexture("update");

		this.wilsonPanZoomDim.createFramebufferTexturePair({
			id: "panZoomDim",
			textureType: "unsignedByte"
		});
		this.wilsonPanZoomDim.useFramebuffer(null);
		this.wilsonPanZoomDim.useTexture("panZoomDim");

		this.wilson.createFramebufferTexturePair({
			id: "draw",
			textureType: "unsignedByte"
		});
		this.wilson.useFramebuffer(null);
		this.wilson.useTexture("draw");

		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;
		this.lastWorldWidth = this.wilson.worldWidth;



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



		this.panZoomDimTexture = new Uint8Array(
			this.wilson.canvasWidth * this.wilson.canvasHeight * 4
		);

		for (let i = 0; i < this.wilson.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilson.canvasWidth; j++)
			{
				const index = this.wilson.canvasWidth * i + j;

				this.panZoomDimTexture[4 * index] = 0;
				this.panZoomDimTexture[4 * index + 1] = 0;
				this.panZoomDimTexture[4 * index + 2] = 0;
			}
		}

		this.resume();
	}



	drawFrame(timeElapsed)
	{
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

				this.wilsonPanZoomDim.setUniforms({
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

		this.subpixelWorldCenterMovement[0] += (this.wilson.worldCenterX - this.lastWorldCenterX)
			/ this.wilson.worldWidth * this.wilson.canvasWidth;
		this.subpixelWorldCenterMovement[1] += (this.wilson.worldCenterY - this.lastWorldCenterY)
			/ this.wilson.worldHeight * this.wilson.canvasHeight;

		const uvStepX = Math.sign(this.subpixelWorldCenterMovement[0])
			* Math.floor(Math.abs(this.subpixelWorldCenterMovement[0]));
		const uvStepY = Math.sign(this.subpixelWorldCenterMovement[1])
			* Math.floor(Math.abs(this.subpixelWorldCenterMovement[1]));

		this.subpixelWorldCenterMovement[0] = Math.sign(this.subpixelWorldCenterMovement[0])
			* (Math.abs(this.subpixelWorldCenterMovement[0]) - Math.abs(uvStepX));
		this.subpixelWorldCenterMovement[1] = Math.sign(this.subpixelWorldCenterMovement[1])
			* (Math.abs(this.subpixelWorldCenterMovement[1]) - Math.abs(uvStepY));

		const scale = this.wilson.worldWidth / this.lastWorldWidth;

		this.wilsonPanZoomDim.setUniforms({
			uvStep: [
				uvStepX / this.wilson.canvasWidth,
				-uvStepY / this.wilson.canvasHeight,
			],
			scale,
			temporaryDimFactor: Math.min(scale, 1) * (this.needTemporaryDim ? 0.96 : 1),
		});



		this.lastWorldCenterX = this.wilson.worldCenterX;
		this.lastWorldCenterY = this.wilson.worldCenterY;
		this.lastWorldWidth = this.wilson.worldWidth;
		this.lastScale = scale;
		this.needTemporaryDim = false;



		this.drawField(timeElapsed);

		this.drawFrameCallback();

		this.needNewFrame = true;
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
		const lifetimeDecrease = Math.max(this.lastScale - 1, 0) * 100 + 1;

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

					let [row, col] = this.wilson.interpolateWorldToCanvas(this.particles[index]);

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

						this.panZoomDimTexture[4 * newIndex] = this.lifetime;
						this.panZoomDimTexture[4 * newIndex + 1] = floatsH[index] * 255;

						this.panZoomDimTexture[4 * newIndex + 2] =
							Math.max(floatsS[index], floatsS2[index]) * 255;

						this.particles[index][2] -= lifetimeDecrease;

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



	drawField(timeElapsed)
	{
		this.wilsonPanZoomDim.setTexture({
			id: "panZoomDim",
			data: this.panZoomDimTexture
		});

		this.wilsonPanZoomDim.drawFrame();

		this.panZoomDimTexture = this.wilsonPanZoomDim.readPixels();

		this.updateParticles(timeElapsed);



		this.wilson.setTexture({
			id: "draw",
			data: this.panZoomDimTexture
		});

		this.wilson.drawFrame();
	}



	onDragDraggable({ x, y })
	{
		for (const shader of ["updateX", "updateY", "updateH", "updateS", "updateS2"])
		{
			this.wilsonUpdate.setUniforms({
				draggableArg: [x, y]
			}, shader);
		}

		this.needTemporaryDim = true;
	}



	switchFullscreen(isFullscreen)
	{
		if (isFullscreen)
		{
			this.wilsonPanZoomDim.enterFullscreen();
		}

		else
		{
			this.wilsonPanZoomDim.exitFullscreen();
		}

		this.generateNewField({});
	}

	async beforeSwitchFullscreen()
	{
		this.pause();

		await new Promise(resolve => setTimeout(resolve, 33));
	}
}