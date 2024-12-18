import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class JuliaSetMosaic extends AnimationFrameApplet
{
	wilsonHidden;

	aspectRatio = 1;

	numIterations = 100;

	zoomLevel = 0;
	pastBrightnessScales = [];
	c = [0, 0];

	resolution = 500;
	resolutionHidden = 50;



	constructor({ canvas })
	{
		super(canvas);

		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform float brightnessScale;
			uniform float setDensity;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				vec2 c = floor(z * setDensity) / setDensity;
				z = (mod(z, 1.0 / setDensity) * setDensity - vec2(.5, .5)) * 3.0;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (length(z) >= 1000.0)
					{
						gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
						return;
					}
					
					z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
					
					brightness += exp(-length(z));
				}

				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const options = {
			shader,

			uniforms: {
				worldCenter: [-0.75, 0],
				worldSize: [4, 4],
				brightnessScale: 10,
				setDensity: 10,
			},

			canvasWidth: this.resolution,

			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: -.75,
			worldCenterY: 0,

			minWorldX: -3 - .75,
			maxWorldX: 3 - .75,
			minWorldY: -3,
			maxWorldY: 3,
			minWorldWidth: 0.00001,
			minWorldHeight: 0.00001,

			onResizeCanvas: () => this.needNewFrame = true,

			reduceMotion: siteSettings.reduceMotion,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		const hiddenCanvas = this.createHiddenCanvas();

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			canvasWidth: this.resolutionHidden,
		});

		this.wilson = new WilsonGPU(canvas, options);

		this.resume();
	}

	drawFrame()
	{
		const zoomLevel = -Math.log2(this.wilson.worldWidth) + 3;
		this.numIterations = Math.ceil(200 + zoomLevel * 40);

		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			brightnessScale: 20 + zoomLevel
		});

		this.wilsonHidden.drawFrame();



		const pixels = this.wilsonHidden.readPixels();

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);
		
		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixels[4 * i] + pixels[4 * i + 1] + pixels[4 * i + 2];
		}

		brightnesses.sort((a, b) => a - b);

		const brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
		) / 25 + zoomLevel * 2;

		this.pastBrightnessScales.push(brightnessScale);

		if (this.pastBrightnessScales.length > 10)
		{
			this.pastBrightnessScales.shift();
		}

		let averageBrightnessScale = 0;

		for (let i = 0; i < this.pastBrightnessScales.length; i++)
		{
			averageBrightnessScale += this.pastBrightnessScales[i];
		}

		averageBrightnessScale = Math.max(
			averageBrightnessScale / this.pastBrightnessScales.length,
			.5
		);

		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			brightnessScale: averageBrightnessScale
		});

		this.wilson.drawFrame();
	}
}