import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { getFloatGlsl, tempShader } from "/scripts/applets/applet.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class LyapunovFractals extends AnimationFrameApplet
{
	hasRun = false;
	generatingString = "AB";

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

		const originalGeneratingStringLength = generatingString.length;
		const originalOldGeneratingStringLength = oldGeneratingString?.length ?? 0;

		const maxLen = Math.max(generatingString.length, oldGeneratingString?.length ?? 0);
		generatingString = generatingString.padEnd(maxLen, "0");

		if (oldGeneratingString)
		{
			oldGeneratingString = oldGeneratingString.padEnd(maxLen, "0");
		}

		let loopInternalsGlsl = "";

		if (oldGeneratingString)
		{
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
		}

		else
		{
			for (let i = 0; i < maxLen; i++)
			{
				const l = generatingString[i];
				const zVar = zVars[l];

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
			? /* glsl */`mix(${Math.pow(originalOldGeneratingStringLength, 2) * 0.0375}, ${Math.pow(originalGeneratingStringLength, 2) * 0.0375}, codeInterpolation)`
			: getFloatGlsl(Math.pow(maxLen, 2) * 0.0375);

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



	async run({ generatingString })
	{
		const shader = this.getShader({
			generatingString,
			oldGeneratingString: this.hasRun ? this.generatingString : undefined
		});

		this.generatingString = generatingString;

		this.wilson.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				codeInterpolation: this.hasRun ? 0 : 1,
			},
		});

		this.pastBrightnessScales = [];

		if (this.hasRun)
		{
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
		}

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