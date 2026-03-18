import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class LyapunovFractals extends AnimationFrameApplet
{
	wilsonHidden;

	numIterations = 100;

	pastBrightnessScales = [];

	resolution = 500;
	resolutionHidden = 50;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		const options =
		{
			shader: tempShader,

			canvasWidth: 500,

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
		oldGeneratingString
	}) {
		const aGlsl = /* glsl */`
			x = z.x * x * (1.0 - x);
			
			color.x += abs(z.x) / 40.0;
		`;

		const bGlsl = /* glsl */`
			x = z.y * x * (1.0 - x);
			
			color.y += abs(z.y) / 40.0;
		`;

		const updateLambdaGlsl = /* glsl */`
			lambda += log(abs(1.0 - 2.0*x));
			
			color.z = -lambda / 100.0;
		`;

		const loopInternalsGlsl = generatingString.split("").map(l =>
		{
			if (l === "A")
			{
				return aGlsl + updateLambdaGlsl;
			}

			else
			{
				return bGlsl + updateLambdaGlsl;
			}
		}).join("\n");

		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				float x = .5;
				
				float lambda = 0.0;
				
				vec3 color = vec3(0.0, 0.0, 0.0);
				
				for (int iteration = 0; iteration < ${Math.floor(250 / generatingString.length)}; iteration++)
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



	run({ generatingString, oldGeneratingString })
	{
		const shader = this.getShader({ generatingString, oldGeneratingString });

		this.wilsonHidden.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				brightnessScale: 20,
			},
		});

		this.wilson.loadShader({
			shader,
			uniforms: {
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				brightnessScale: 20,
			},
		});

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
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}

		brightnesses.sort((a, b) => a - b);

		let brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
		) / 255 * 6;

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