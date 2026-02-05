import {
	getGlslBundle,
	loadGlsl
} from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import {
	getFloatGlsl,
	getMaxGlslString,
	tempShader
} from "/scripts/applets/applet.js";
import { sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class VectorField extends AnimationFrameApplet
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

	lastGeneratedCanvasWidth;
	lastGeneratedCanvasHeight;

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

	onDrawFrame;
	


	constructor({
		canvas,
		// draggables = {},
		loopEdges = false,
		transparency = false,
		useFullscreenButton = true,
		useResetButton = true,
		onDrawFrame = () => {},
		onReset = () => {},
	}) {
		super(canvas);

		this.loopEdges = loopEdges;
		this.onDrawFrame = onDrawFrame;

		this.panZoomDimCanvas = this.createHiddenCanvas();
		this.updateCanvas = this.createHiddenCanvas();

		const optionsUpdate =
		{
			shader: tempShader,

			canvasWidth: 100,
			canvasHeight: 100,

			verbose: window.DEBUG,
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
						${transparency ? "(v.x - dimAmount) * temporaryDimFactor" : "1.0"}
					);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
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
				restoreScroll: false,
			},

			verbose: window.DEBUG,
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

			useResetButton,
			resetButtonIconPath: "/graphics/general-icons/reset.png",
			onReset,

			onResizeCanvas: () => this.generateNewField({ delayResuing: true }),

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			draggableOptions: {
				draggables: {
					draggableArg: [0, 0],
					draggableArg2: [0, 0],
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
				}
			},

			fullscreenOptions: {
				fillScreen: true,
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				onSwitch: this.switchFullscreen.bind(this),
				useFullscreenButton,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonGPU(canvas, options);

		this.wilson.draggables.draggableArg.element.style.display = "none";
		this.wilson.draggables.draggableArg2.element.style.display = "none";

		this.loadPromise = loadGlsl();
	}



	async run({
		generatingCode,
		resolution = 750,
		maxParticles = 8000,
		dt = .00375,
		lifetime = 150,
		worldWidth = 6,
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
		const needDraggable2 = generatingCode.indexOf("draggableArg2") !== -1;

		this.wilson.resizeCanvas({ width: this.resolution });
		this.wilsonPanZoomDim.resizeCanvas({ width: this.resolution });



		const shaderUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dt;
			
			uniform vec2 draggableArg;
			uniform vec2 draggableArg2;
			
			
			
			${getGlslBundle(generatingCode)}
		
			
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

				gl_FragColor = vec4(
					dt * d.x + sample.x,
					dt * d.y + sample.y,
					(atan(d.y, d.x) + ${Math.PI}) / ${2 * Math.PI},
					1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y))
				);
			}
		`;

		this.wilsonUpdate.loadShader({
			id: "update",
			shader: shaderUpdate,
			uniforms: {
				dt: this.dt,
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
				...(needDraggable2 ? { draggableArg2: [0, 0] } : {}),
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
			
			vec3 hsvToRgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}

			vec4 getPixel(vec2 uv)
			{
				vec4 v = texture2D(uTexture, (vec2(1.0 + uv.x, 1.0 - uv.y)) / 2.0);

				return vec4(hsvToRgb(vec3(v.y, v.z, v.x / maxBrightness)), v.w);
			}
			
			void main(void)
			{
				${samplingGlsl}
			}
		`;

		this.needStepSize = samplingGlsl.indexOf("stepSize") !== -1;

		this.wilson.loadShader({
			id: "draw",
			shader: shaderDraw,
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
		this.wilson.draggables.draggableArg2.element.style.display =
			needDraggable2 ? "block" : "none";

		this.wilson.resizeWorld({
			width: worldWidth,
			centerX: worldCenterX,
			centerY: worldCenterY
		});

		this.wilson.setCurrentStateAsDefault();

		this.generateNewField({
			maxParticles,
			dt,
			lifetime,
		});
	}



	getSamplingGlsl()
	{
		const radius = this.particleDilation
			?? Math.max(this.resolution / 500, 0);

		let glsl = "";
		let numDistances = 0;

		for (let i = -Math.ceil(radius); i <= Math.ceil(radius); i++)
		{
			for (let j = -Math.ceil(radius); j <= Math.ceil(radius); j++)
			{
				const distanceToCenter = Math.sqrt(i * i + j * j);

				if (distanceToCenter > radius + 1)
				{
					continue;
				}

				const dimFactor = 1 - Math.max(0, distanceToCenter - radius);

				numDistances++;
				glsl += /* glsl */`
					vec4 distance${numDistances} = ${getFloatGlsl(dimFactor)} * getPixel(
						uv + vec2(
							${getFloatGlsl(i)} * stepSize.x,
							${getFloatGlsl(j)} * stepSize.y
						)
					);
				`;
			}
		}

		glsl += /* glsl */`
			gl_FragColor = ${getMaxGlslString("distance", numDistances)};
		`;

		return glsl;
	}

	resumeTimeout;

	async generateNewField({
		maxParticles = this.maxParticles,
		dt = this.dt,
		lifetime = this.lifetime,
		delayResuing = false,
	}) {
		await this.loadPromise;

		this.animationPaused = true;

		this.lastGeneratedCanvasWidth = this.wilson.canvasWidth;
		this.lastGeneratedCanvasHeight = this.wilson.canvasHeight;

		this.maxParticles = maxParticles;
		this.dt = dt;
		this.lifetime = lifetime;
		
		this.wilson.setUniforms({
			maxBrightness: this.lifetime / 255,
			...(
				this.needStepSize
					? { stepSize: [2 / this.wilson.canvasWidth, 2 / this.wilson.canvasHeight] }
					: {}
			),
		});

		this.numParticles = 0;

		const updateResolution = Math.ceil(Math.sqrt(maxParticles));
		this.wilsonUpdate.resizeCanvas({ width: updateResolution });



		this.wilsonUpdate.createFramebufferTexturePair({
			id: "update1",
			textureType: "float"
		});
		this.wilsonUpdate.createFramebufferTexturePair({
			id: "update2",
			textureType: "float"
		});

		this.wilsonUpdate.useTexture("update1");
		this.wilsonUpdate.useFramebuffer("update2");

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



		clearTimeout(this.resumeTimeout);

		if (!delayResuing)
		{
			this.resume();
		}

		else
		{
			this.resumeTimeout = setTimeout(() => this.resume(), 100);
		}
	}



	drawFrame(timeElapsed)
	{
		if (this.destroyed)
		{
			return;
		}
		
		this.wilsonUpdate.setUniforms({
			dt: this.dt * timeElapsed / 6.944
		});

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

		this.onDrawFrame();

		this.needNewFrame = true;
	}



	createParticle(index)
	{
		const x = Math.random() < 0.2
			? Math.random() < 0.5
				? .999
				: .001
			: Math.random();

		const y = Math.random() < 0.2
			? Math.random() < 0.5
				? .999
				: .001
			: Math.random();

		this.particles[index][0] = this.wilson.worldCenterX
			+ this.wilson.worldWidth * (x - 0.5);

		this.particles[index][1] = this.wilson.worldCenterY
			+ this.wilson.worldHeight * (y - 0.5);

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
			id: "update1",
			data: this.updateTexture
		});

		this.wilsonUpdate.drawFrame();
		const floats = this.wilsonUpdate.readPixels({
			format: "float"
		});

		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				if (index < this.particles.length && this.particles[index][2])
				{
					this.particles[index][0] = floats[4 * index];
					this.particles[index][1] = floats[4 * index + 1];

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

						// This makes the particles fade in when they first appear over the course
						// of 20 frames.
						this.panZoomDimTexture[4 * newIndex] = Math.min(
							Math.abs(
								this.particles[index][2] - this.lifetime
							) * this.lifetime / 20,
							this.lifetime
						);
						
						this.panZoomDimTexture[4 * newIndex + 1] = floats[4 * index + 2] * 255;

						this.panZoomDimTexture[4 * newIndex + 2] = floats[4 * index + 3] * 255;

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



	onDragDraggable({ id, x, y })
	{
		this.wilsonUpdate.setUniforms({
			[id]: [x, y]
		});

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

		requestAnimationFrame(() => this.generateNewField({}));
	}

	async beforeSwitchFullscreen()
	{
		this.pause();

		await sleep(33);
	}
}