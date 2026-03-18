import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class LyapunovFractals extends AnimationFrameApplet
{
	wilsonHidden;

	hasRun = false;
	generatingString = "AB";
	numIterations = 100;

	brightnessScale = 10;
	pastBrightnessScales = [];

	resolution = 1000;
	resolutionHidden = 50;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		const options =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			worldWidth: 4,
			worldCenterX: 2,
			worldCenterY: 2,

			minWorldWidth: 0.00001,
			minWorldHeight: 0.00001,
			minWorldX: 0,
			minWorldY: 0,
			maxWorldX: 4,
			maxWorldY: 4,

			clampWorldCoordinatesMode: "both",

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: () => this.needNewFrame = true,

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

		const optionsHidden =
		{
			shader: tempShader,

			canvasWidth: this.resolutionHidden,

			verbose: window.DEBUG,
		};

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, optionsHidden);

		this.resume();
	}



	getShader({
		generatingString,
		oldGeneratingString = this.generatingString
	}) {
		const zVars = {
			A: "z.x",
			B: "z.y",
		};

		const maxLen = Math.max(generatingString.length, oldGeneratingString.length);
		generatingString = generatingString.padEnd(maxLen, "0");
		oldGeneratingString = oldGeneratingString.padEnd(maxLen, "0");

		let loopInternalsGlsl = "";

		for (let i = 0; i < maxLen; i++)
		{
			const l = generatingString[i];
			const oldL = oldGeneratingString[i];
			const zVar = /* glsl */`mix(${zVars[oldL] ?? "0.0"}, ${zVars[l] ?? "0.0"}, codeInterpolation)`;

			const colorXAmount = /* glsl */`(codeInterpolation * ${l === "A" ? "1.0" : "0.0"} + (1.0 - codeInterpolation) * ${oldL === "A" ? "1.0" : "0.0"})`;
			const colorYAmount = /* glsl */`(codeInterpolation * ${l === "B" ? "1.0" : "0.0"} + (1.0 - codeInterpolation) * ${oldL === "B" ? "1.0" : "0.0"})`;

			const updateAmount = /* glsl */`(codeInterpolation * ${l === "A" || l === "B" ? "1.0" : "0.0"} + (1.0 - codeInterpolation) * ${oldL === "A" || oldL === "B" ? "1.0" : "0.0"})`;

			loopInternalsGlsl += /* glsl */`
				x = mix(x, ${zVar} * x * (1.0 - x), ${updateAmount});
				
				color.x += ${colorXAmount} * abs(z.x) / 40.0;
				color.y += ${colorYAmount} * abs(z.y) / 40.0;

				lambda += ${updateAmount} * log(abs(1.0 - 2.0*x));
				
				color.z = mix(color.z, -lambda / 100.0, ${updateAmount});
			`;
		}

		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform float brightnessScale;
			uniform float codeInterpolation;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				float x = .5;
				
				float lambda = 0.0;
				
				vec3 color = vec3(0.0, 0.0, 0.0);
				
				for (int iteration = 0; iteration < 50; iteration++)
				{
					${loopInternalsGlsl}
				}
				
				lambda *= 0.0001;
				
				if (lambda <= 0.0)
				{
					gl_FragColor = vec4(-lambda / brightnessScale * color, 1.0);
					
					return;
				}
			}
		`;

		return shader;
	}



	run({ generatingString })
	{
		const shader = this.getShader({
			generatingString,
			oldGeneratingString: this.generatingString
		});

		this.generatingString = generatingString;

		this.wilsonHidden.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				brightnessScale: 10,
				codeInterpolation: this.hasRun ? 0 : 1,
			},
		});

		this.wilson.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				brightnessScale: this.brightnessScale,
				codeInterpolation: this.hasRun ? 0 : 1,
			},
		});

		if (this.hasRun)
		{
			animate((t) =>
			{
				this.wilson.setUniforms({
					codeInterpolation: t
				});

				this.wilsonHidden.setUniforms({
					codeInterpolation: t
				});

				this.needNewFrame = true;
			}, 750, "easeInOutQuad");
		}

		// This is an inelegant solution, but it prevents the state-persisting text box
		// from triggering an animation on page load
		setTimeout(() => this.hasRun = true, 1000);
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
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}

		brightnesses.sort((a, b) => a - b);

		this.brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
		) / 255 * 4;

		this.pastBrightnessScales.push(this.brightnessScale);

		const denom = this.pastBrightnessScales.length;

		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}

		this.brightnessScale = 0;

		for (let i = 0; i < this.pastBrightnessScales.length; i++)
		{
			this.brightnessScale += this.pastBrightnessScales[i];
		}

		this.brightnessScale = Math.max(this.brightnessScale / denom, .05);



		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			brightnessScale: this.brightnessScale
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