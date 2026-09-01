import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { getFloatGlsl, tempShader } from "/scripts/applets/applet.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGL } from "/scripts/wilson.js";

function gcd(a, b)
{
	while (b)
	{
		[a, b] = [b, a % b];
	}

	return a;
}

function lcm(a, b)
{
	if (a === 0 || b === 0)
	{
		return 0;
	}

	return Math.abs(a) / gcd(Math.abs(a), Math.abs(b)) * Math.abs(b);
}

export class LyapunovFractals extends AnimationFrameApplet
{
	hasRun = false;
	generatingString;

	resolution = 1000;
	resolutionHidden = 50;

	doneAnimating = Promise.resolve();
	currentlyAnimating = false;



	constructor({ canvas })
	{
		super(canvas);

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

		this.wilson = new WilsonGL(canvas, options);

		this.resume();
	}



	getShader({
		generatingString,
		oldGeneratingString
	}) {
		const zVars = {
			A: "z.x",
			B: "z.y",
		};

		// The interpolation animation looks best when both strings are of equal length,
		// which means repeating both until the resulting string is the length of their LCM.
		const lcmLen = oldGeneratingString
			? lcm(generatingString.length, oldGeneratingString.length)
			: generatingString.length;

		if (oldGeneratingString)
		{
			generatingString = generatingString.repeat(lcmLen / generatingString.length);
			oldGeneratingString = oldGeneratingString.repeat(lcmLen / oldGeneratingString.length);
		}

		let loopInternalsGlsl = "";

		if (oldGeneratingString)
		{
			for (let i = 0; i < lcmLen; i++)
			{
				const l = generatingString[i];
				const oldL = oldGeneratingString[i];
				const zVar = /* glsl */`mix(${zVars[oldL] ?? "z.x"}, ${zVars[l] ?? "z.x"}, codeInterpolation)`;

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
		}

		else
		{
			for (let i = 0; i < generatingString.length; i++)
			{
				const l = generatingString[i];
				const zVar = zVars[l] ?? "z.x";

				const colorGlsl = l === "A"
					? "color.x += abs(z.x) / 40.0;"
					: "color.y += abs(z.y) / 40.0;";

				loopInternalsGlsl += /* glsl */`
					x = ${zVar} * x * (1.0 - x);
					${colorGlsl}

					lambda += log(abs(1.0 - 2.0*x));
					
					color.z = -lambda / 100.0;
				`;
			}
		}

		const brightnessGlsl = oldGeneratingString
			? getFloatGlsl(Math.pow(lcmLen, 2) * 0.0375)
			: getFloatGlsl(Math.pow(generatingString.length, 2) * 0.0375);

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
					gl_FragColor = vec4(-lambda / ${brightnessGlsl} * color, 1.0);
					
					return;
				}
			}
		`;

		return shader;
	}



	async run({
		generatingString,
		resolution = this.resolution,
		instant = false
	}) {
		if (generatingString === this.generatingString)
		{
			return;
		}

		const wasAnimating = this.currentlyAnimating;
		await this.doneAnimating;

		let resolve;
		this.doneAnimating = new Promise(r => resolve = r);
		this.currentlyAnimating = true;

		if (!this.hasRun || wasAnimating || instant)
		{
			this.generatingString = generatingString;
			this.resolution = resolution;

			const shader = this.getShader({
				generatingString: this.generatingString,
			});

			this.wilson.loadShader({
				shader,
				uniforms: {
					worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
					worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				},
			});

			await this.wilson.allShadersReady();

			resolve();
			this.currentlyAnimating = false;
			setTimeout(() => this.hasRun = true, 750);
			this.needNewFrame = true;

			return;
		}



		const shaderInterpolate = this.getShader({
			generatingString,
			oldGeneratingString: this.hasRun ? this.generatingString : undefined
		});

		this.generatingString = generatingString;
		this.resolution = resolution;

		this.wilson.resizeCanvas({ width: this.resolution });

		this.wilson.loadShader({
			shader: shaderInterpolate,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				codeInterpolation: (this.hasRun && !instant) ? 0 : 1,
			},
		});

		await this.wilson.allShadersReady();
		
		await animate((t) =>
		{
			this.wilson.setUniforms({
				codeInterpolation: t
			});

			this.needNewFrame = true;
		}, 750, "easeInOutQuad");

		const shader = this.getShader({
			generatingString,
		});

		this.wilson.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			},
		});

		await this.wilson.allShadersReady();

		resolve();
		this.currentlyAnimating = false;
		this.needNewFrame = true;

		// This is an inelegant solution, but it prevents the state-persisting text box
		// from triggering an animation on page load
		setTimeout(() => this.hasRun = true, 750);
	}

	drawFrame()
	{
		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
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