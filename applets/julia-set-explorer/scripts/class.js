import { Applet } from "/scripts/applets/applet.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class JuliaSetExplorer extends Applet
{
	wilsonHidden;

	juliaMode = "mandelbrot";

	numIterations = 100;

	switchJuliaModeButton;
	pastBrightnessScales = [];
	c = [0, 0];

	resolution = 1000;
	resolutionHidden = 50;



	constructor({ canvas, switchJuliaModeButton })
	{
		super(canvas);

		this.switchJuliaModeButton = switchJuliaModeButton;

		const shaderMandelbrot = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec2 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		const shaderJulia = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform vec2 c;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		const shaderJuliaPicker = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform vec2 c;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec2 mandelbrotC = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				float brightness = exp(-length(z));
				
				
				
				bool broken = false;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + mandelbrotC;
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
				}
				
				
				
				z = uv * 2.0;
				
				color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				brightness = exp(-length(z));
				
				broken = false;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor.xyz /= 4.0;
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				if (!broken)
				{
					gl_FragColor += vec4(brightness / brightnessScale * color, 0.0);
				}
			}
		`;

		const options = {
			shaders: {
				mandelbrot: shaderMandelbrot,
				julia: shaderJulia,
				juliaPicker: shaderJuliaPicker,
			},

			uniforms: {
				mandelbrot: {
					worldCenter: [-0.75, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
				},
				julia: {
					worldCenter: [-0.75, 0],
					worldSize: [4, 4],
					c: this.c,
					numIterations: this.numIterations,
					brightnessScale: 10,
				},
				juliaPicker: {
					worldCenter: [-0.75, 0],
					worldSize: [4, 4],
					c: this.c,
					numIterations: this.numIterations,
					brightnessScale: 10,
				},
			},

			canvasWidth: this.resolution,

			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: -.75,
			worldCenterY: 0,

			minWorldCenterX: -2,
			maxWorldCenterX: 2,
			minWorldCenterY: -2,
			maxWorldCenterY: 2,
			minWorldWidth: 0.00001,
			maxWorldWidth: 4,
			minWorldHeight: 0.00001,
			maxWorldHeight: 4,

			onResizeCanvas: this.drawFrame.bind(this),

			reduceMotion: siteSettings.reduceMotion,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: this.drawFrame.bind(this),
				callbacks: {
					mousemove: this.onMousemove.bind(this),
					mousedown: this.onMousedown.bind(this),
					touchmove: this.onTouchmove.bind(this),
					touchend: this.onTouchend.bind(this),
				},
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonGPU(canvas, options);
		this.wilson.useShader("mandelbrot");



		const hiddenCanvas = this.createHiddenCanvas();

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			canvasWidth: this.resolutionHidden,
		});
		this.wilsonHidden.useShader("mandelbrot");

		this.drawFrame();
	}



	advanceJuliaMode()
	{
		if (this.juliaMode === "mandelbrot")
		{
			this.juliaMode = "juliaPicker";

			this.c = [0, 0];
		}

		else if (this.juliaMode === "julia")
		{
			this.juliaMode = "mandelbrot";

			this.wilson.resizeWorld({
				width: 4,
				height: 4,
				centerX: -.75,
				centerY: 0
			});
		}

		else
		{
			this.juliaMode = "julia";

			this.wilson.resizeWorld({
				width: 4,
				height: 4,
				centerX: 0,
				centerY: 0
			});
		}

		this.pastBrightnessScales = [];

		this.wilson.useShader(this.juliaMode);
		this.wilsonHidden.useShader(this.juliaMode);
		this.wilson.useInteractionForPanAndZoom = this.juliaMode !== "juliaPicker";
		if (this.switchJuliaModeButton)
		{
			this.switchJuliaModeButton.disabled = this.juliaMode === "juliaPicker";
		}

		this.drawFrame();
	}

	

	onMousemove({ x, y })
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.c = [x, y];

			requestAnimationFrame(() => this.drawFrame());
		}
	}

	onMousedown()
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.advanceJuliaMode();
		}
	}

	onTouchmove({ x, y })
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.c = [x, y];

			requestAnimationFrame(() => this.drawFrame());
		}
	}

	onTouchend()
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.advanceJuliaMode();
		}
	}

	drawFrame()
	{
		const zoomLevel = -Math.log2(this.wilson.worldWidth) + 3;
		this.numIterations = Math.ceil(200 + zoomLevel * 40);

		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			numIterations: this.numIterations,
			brightnessScale: 20 + zoomLevel
		});

		if (this.juliaMode !== "mandelbrot")
		{
			this.wilsonHidden.setUniforms({ c: this.c });
		}

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
			numIterations: this.numIterations,
			brightnessScale: averageBrightnessScale
		});

		if (this.juliaMode !== "mandelbrot")
		{
			this.wilson.setUniforms({ c: this.c });
		}

		this.wilson.drawFrame();
	}
}