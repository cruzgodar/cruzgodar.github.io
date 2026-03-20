import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { getFloatGlsl, hsvToRgb, tempShader } from "/scripts/applets/applet.js";
import { animate, getRandomNonGreenHues, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

const derivativePrecision = 20;

export class NewtonsMethodExtended extends AnimationFrameApplet
{
	loadPromise;

	wilsonHidden;

	hasRun = false;

	defaultWorldSize = 32;


	generatingCode;
	a = [5, 0];
	c = [0, 0];
	draggableArg = [.5, .5];

	aspectRatio = 1;

	secantProportion = 0;

	pastBrightnessScales = [];

	resolution = 500;
	resolutionHidden = 100;

	colors;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();
		
		const options = {
			shader: tempShader,

			canvasWidth: this.resolution,

			worldWidth: 32,
			worldCenterX: 0,
			worldCenterY: 0,

			minWorldWidth: 0.00005,
			maxWorldWidth: 300,
			minWorldHeight: 0.00005,
			maxWorldHeight: 300,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: () => this.needNewFrame = true,

			draggableOptions: {
				draggables: {
					a: this.a,
					c: this.c,
					draggableArg: [.5, .5],
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
				}
			},

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			fullscreenOptions: {
				onSwitch: this.switchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonGPU(canvas, options);
		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			draggableOptions: {},
			canvasWidth: this.resolutionHidden,
		});

		this.wilson.draggables.draggableArg.element.style.display = "none";

		this.colors = this.generateNewPalette();

		this.loadPromise = loadGlsl();
	}



	async getShader({
		oldGeneratingCode,
		needDraggable
	}) {
		const updateGlsl = oldGeneratingCode
			? /* glsl */`
				(1.0 - codeInterpolation) * cmul(cmul(oldF(z, firstZ), cinv(oldFPrime(z, firstZ))), a * 0.2) +  codeInterpolation * cmul(cmul(f(z, firstZ), cinv(fPrime(z, firstZ))), a * 0.2)
			`
			: /* glsl */`
				cmul(cmul(f(z, firstZ), cinv(fPrime(z, firstZ))), a * 0.2)
			`;

		const oldFGlsl = oldGeneratingCode
			? /* glsl */`
				//Returns f(z) for a polynomial f with given roots.
				vec2 oldF(vec2 z, vec2 firstZ)
				{
					return ${oldGeneratingCode} + firstZ;
				}
				
				//Approximates f'(z) for a polynomial f with given roots.
				vec2 oldFPrime(vec2 z, vec2 firstZ)
				{
					return 1.0 / 12.0 * ${getFloatGlsl(derivativePrecision)} * (
						-oldF(z + vec2(2.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
						+ 8.0 * oldF(z + vec2(1.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
						- 8.0 * oldF(z - vec2(1.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
						+ oldF(z - vec2(2.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
					);
				}
			`
			: "";

		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform vec3 color0;
			uniform vec3 color1;
			uniform vec3 color2;
			uniform vec3 color3;
			
			uniform vec2 a;
			uniform vec2 c;
			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			uniform float brightnessScale;
			uniform float codeInterpolation;
			
			const float threshhold = .001;
			
			
			
			${getGlslBundle(this.generatingCode + " " + (oldGeneratingCode ?? ""))}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z, vec2 firstZ)
			{
				return ${this.generatingCode} + firstZ;
			}
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 fPrime(vec2 z, vec2 firstZ)
			{
				return 1.0 / 12.0 * ${getFloatGlsl(derivativePrecision)} * (
					-f(z + vec2(2.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
					+ 8.0 * f(z + vec2(1.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
					- 8.0 * f(z - vec2(1.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
					+ f(z - vec2(2.0 * ${getFloatGlsl(1 / derivativePrecision)}, 0.0), firstZ)
				);
			}

			${oldFGlsl}
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				vec2 firstZ = c;
				vec2 lastZ = vec2(0.0, 0.0);
				vec2 oldZ = vec2(0.0, 0.0);
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 200; iteration++)
				{
					vec2 temp = ${updateGlsl};
					
					oldZ = lastZ;
					
					lastZ = z;
					
					z -= temp;
					
					
					
					//If we're slowing down, it's reasonably safe to assume that we're near a root.
					
					float d0 = length(lastZ - z);
					
					if (d0 < threshhold)
					{
						float d1 = length(oldZ - lastZ);
						
						float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
						
						float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
						
						//Round to a square grid so that basin colors are consistent.
						vec2 theoreticalRoot = floor(z / (threshhold / 3.0)) * threshhold / 3.0;
						
						float c0 = sin(theoreticalRoot.x * 7.239846) + cos(theoreticalRoot.x * 2.945387) + 2.0;
						
						float c1 = sin(theoreticalRoot.y * 5.918445) + cos(theoreticalRoot.y * .987235) + 2.0;
						
						float c2 = sin((theoreticalRoot.x + theoreticalRoot.y) * 1.023974) + cos((theoreticalRoot.x + theoreticalRoot.y) * 9.130874) + 2.0;
						
						float c3 = sin((theoreticalRoot.x - theoreticalRoot.y) * 3.258342) + cos((theoreticalRoot.x - theoreticalRoot.y) * 4.20957) + 2.0;
						
						//Pick an interpolated color between the 4 that we chose earlier.
						gl_FragColor = vec4((c0 * color0 + c1 * color1 + c2 * color2 + c3 * color3) / (c0 + c1 + c2 + c3) * brightness, 1.0);
						
						return;
					}
				}
			}
		`;

		return shader;
	}

	

	async animateResetWorldCoordinates()
	{
		const worldWidth = this.wilson.worldWidth;
		const worldHeight = this.wilson.worldHeight;
		const worldCenterX = this.wilson.worldCenterX;
		const worldCenterY = this.wilson.worldCenterY;

		const levelsToZoom = Math.abs(
			Math.min(
				Math.log2(worldWidth / this.defaultWorldSize),
				Math.log2(worldHeight / this.defaultWorldSize)
			)
		);

		const animationTime = levelsToZoom > 1
			? 500
			: levelsToZoom > 0
				? 200
				: 0;

		await animate((t) =>
		{
			this.wilson.resizeWorld({
				width: worldWidth * (1 - t) + this.defaultWorldSize * t,
				height: worldHeight * (1 - t) + this.defaultWorldSize * t,
				centerX: worldCenterX * (1 - t),
				centerY: worldCenterY * (1 - t),
			});

			this.wilsonHidden.resizeWorld({
				width: worldWidth * (1 - t) + this.defaultWorldSize * t,
				height: worldHeight * (1 - t) + this.defaultWorldSize * t,
				centerX: worldCenterX * (1 - t),
				centerY: worldCenterY * (1 - t),
			});

			this.needNewFrame = true;
		}, animationTime, "easeInOutCubic");

		if (levelsToZoom > 0)
		{
			await sleep(100);
		}
	}

	async interpolateBetweenRuns({
		newGeneratingCode,
		needDraggable
	}) {
		await this.animateResetWorldCoordinates();

		const oldGeneratingCode = this.generatingCode;
		this.generatingCode = newGeneratingCode;

		const shader = await this.getShader({ oldGeneratingCode, needDraggable });

		this.wilson.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				color0: [this.colors[0], this.colors[1], this.colors[2]],
				color1: [this.colors[3], this.colors[4], this.colors[5]],
				color2: [this.colors[6], this.colors[7], this.colors[8]],
				color3: [this.colors[9], this.colors[10], this.colors[11]],
				a: this.a,
				c: this.c,
				brightnessScale: this.brightnessScale,
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
				codeInterpolation: 0,
			},
		});

		this.wilsonHidden.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				color0: [this.colors[0], this.colors[1], this.colors[2]],
				color1: [this.colors[3], this.colors[4], this.colors[5]],
				color2: [this.colors[6], this.colors[7], this.colors[8]],
				color3: [this.colors[9], this.colors[10], this.colors[11]],
				a: this.a,
				c: this.c,
				brightnessScale: 10,
				codeInterpolation: 0,
			},
		});

		await animate((t) =>
		{
			this.wilson.setUniforms({
				codeInterpolation: t,
			});
			this.wilsonHidden.setUniforms({
				codeInterpolation: t,
			});

			this.needNewFrame = true;
		}, 750, "easeInOutQuad");
	}



	async run({
		generatingCode,
		resolution = this.resolution,
		animate = true,
	}) {
		await this.loadPromise;
		
		const needDraggable = generatingCode.indexOf("draggableArg") !== -1;

		if (this.hasRun && animate)
		{
			await this.interpolateBetweenRuns({ newGeneratingCode: generatingCode, needDraggable });
		}

		else
		{
			this.generatingCode = generatingCode;

			this.pastBrightnessScales = [];
			this.brightnessScale = 12.75;
			this.a = [5, 0];
			this.c = [0, 0];

			this.wilson.resizeWorld({
				width: 32,
				height: 32,
				centerX: 0,
				centerY: 0
			});

			this.wilson.setDraggables({ a: this.a, c: this.c });
		}

		const shader = await this.getShader({ needDraggable });

		this.wilson.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				color0: [this.colors[0], this.colors[1], this.colors[2]],
				color1: [this.colors[3], this.colors[4], this.colors[5]],
				color2: [this.colors[6], this.colors[7], this.colors[8]],
				color3: [this.colors[9], this.colors[10], this.colors[11]],
				a: this.a,
				c: this.c,
				brightnessScale: this.brightnessScale,
				...(needDraggable ? { draggableArg: [0, 0] } : {}),
			},
		});

		this.wilsonHidden.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				color0: [this.colors[0], this.colors[1], this.colors[2]],
				color1: [this.colors[3], this.colors[4], this.colors[5]],
				color2: [this.colors[6], this.colors[7], this.colors[8]],
				color3: [this.colors[9], this.colors[10], this.colors[11]],
				a: this.a,
				c: this.c,
				brightnessScale: 10,
			},
		});

		this.resolution = resolution;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.wilson.draggables.draggableArg.element.style.display =
			needDraggable ? "block" : "none";

		this.hasRun = true;

		this.resume();
	}



	// Pick 4 colors, each with a bright, medium, and dim component.
	// Each of these colors will be interpolated between based on
	// the target x and y coordinates of the attractive root,
	// forming a quadrilateral in the color plane. Since these 4 corner points
	// are brightish but not overly so and decently saturated,
	// this process almost always produces a pleasing palette.
	generateNewPalette()
	{
		const newColors = new Array(12);

		const hues = getRandomNonGreenHues({
			count: 4,
			excludedRanges: [[75 / 360, 175 / 360]],
			separation: 1,
		});



		for (let i = 0; i < 4; i++)
		{
			const rgb = hsvToRgb(
				hues[i],
				0.35 * Math.random() + 0.3,
				0.2 * Math.random() + 0.8,
			);

			newColors[3 * i] = rgb[0] / 255;
			newColors[3 * i + 1] = rgb[1] / 255;
			newColors[3 * i + 2] = rgb[2] / 255;
		}

		return newColors;
	}



	animatePaletteChange()
	{
		const oldColors = [...this.colors];
		const newColors = this.generateNewPalette();

		animate((t) =>
		{
			for (let i = 0; i < 12; i++)
			{
				this.colors[i] = (1 - t) * oldColors[i] + t * newColors[i];

				this.wilson.setUniforms({
					color0: [this.colors[0], this.colors[1], this.colors[2]],
					color1: [this.colors[3], this.colors[4], this.colors[5]],
					color2: [this.colors[6], this.colors[7], this.colors[8]],
					color3: [this.colors[9], this.colors[10], this.colors[11]],
				});

				this.wilsonHidden.setUniforms({
					color0: [this.colors[0], this.colors[1], this.colors[2]],
					color1: [this.colors[3], this.colors[4], this.colors[5]],
					color2: [this.colors[6], this.colors[7], this.colors[8]],
					color3: [this.colors[9], this.colors[10], this.colors[11]],
				});

				this.needNewFrame = true;
			}
		}, 500);
	}



	onDragDraggable({ id, x, y })
	{
		this[id] = [x, y];

		this.wilson.setUniforms({ [id]: this[id] });
		this.wilsonHidden.setUniforms({ [id]: this[id] });

		this.needNewFrame = true;
	}



	drawFrame()
	{
		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
		});

		this.wilsonHidden.drawFrame();



		const pixelData = this.wilsonHidden.readPixels();

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);

		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = Math.max(
				Math.max(
					pixelData[4 * i],
					pixelData[4 * i + 1]
				),
				pixelData[4 * i + 2]
			);
		}

		brightnesses.sort((a, b) => a - b);

		let brightnessScale = Math.min(
			7000 / (
				brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
				+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
			),
			30
		);

		this.pastBrightnessScales.push(brightnessScale);

		const denom = this.pastBrightnessScales.length;

		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}

		brightnessScale = 0;

		for (let i = 0; i < this.pastBrightnessScales.length; i++)
		{
			brightnessScale += this.pastBrightnessScales[i];
		}

		brightnessScale = Math.max(brightnessScale / denom, .5);



		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			brightnessScale
		});

		this.wilson.drawFrame();
	}

	switchFullscreen()
	{
		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.animationPaused = true;

		await sleep(33);
	}
}