import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class JuliaSetExplorer extends AnimationFrameApplet
{
	wilsonHidden;

	juliaMode = "mandelbrot";

	numIterations = 100;

	switchJuliaModeButton;
	ignoreBrightnessCalculation = false;
	pastBrightnessScales = [];
	c = [100, 100];

	resolution = 500;
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
				vec2 z = uv * worldSize * 0.5 + worldCenter - vec2(0.75, 0.0);
				
				vec2 c = z;
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);
				
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
				vec2 z = uv * worldSize * 0.5 + worldCenter - vec2(0.75, 0.0);
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);
				
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
			uniform float juliaRadius;
			
			
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter - vec2(0.75, 0.0);

				float distanceFromMouse = clamp(
					length(z - c + vec2(0.75, 0.0))
						/ max(worldSize.x, worldSize.y)
						* juliaRadius * 10.0,
					0.0,
					1.0
				);

				float t = distanceFromMouse < 0.5
					? 2.0 * distanceFromMouse * distanceFromMouse 
					: 1.0 - (-2.0 * distanceFromMouse + 2.0) * (-2.0 * distanceFromMouse + 2.0) / 2.0;
				
				// Remove the bias as the bubble expands.
				vec2 usableC = mix(c - vec2(0.75, 0.0), z, t);
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);
				
				float brightness = exp(-length(z));
				
				
				
				bool broken = false;
				
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
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + usableC;
					
					brightness += exp(-length(z));
				}
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
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
					worldCenter: [0, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
				},
				julia: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					c: this.c,
					numIterations: this.numIterations,
					brightnessScale: 10,
				},
				juliaPicker: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					c: this.c,
					numIterations: this.numIterations,
					brightnessScale: 10,
					juliaRadius: 1,
				},
			},

			canvasWidth: this.resolution,

			worldWidth: 4,
			worldCenterX: 0,
			worldCenterY: 0,

			minWorldX: -2,
			maxWorldX: 2,
			minWorldY: -2,
			maxWorldY: 2,
			minWorldWidth: 0.00001,
			minWorldHeight: 0.00001,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: () => this.needNewFrame = true,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
				callbacks: {
					mousemove: this.onMousemove.bind(this),
					mousedown: this.onMousedown.bind(this),
					touchmove: this.onTouchmove.bind(this),
					touchend: this.onTouchend.bind(this),
				},
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
		this.wilson.useShader("mandelbrot");



		const hiddenCanvas = this.createHiddenCanvas();

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			canvasWidth: this.resolutionHidden,
		});
		this.wilsonHidden.useShader("mandelbrot");

		this.needNewFrame = true,
		this.resume();
	}



	async advanceJuliaMode()
	{
		if (this.juliaMode === "mandelbrot")
		{
			this.juliaMode = "juliaPicker";

			// Prevent the middle of the mandelbrot set from being distorted.
			this.c = [1000, 1000];
		}

		else if (this.juliaMode === "julia")
		{
			this.juliaMode = "mandelbrot";

			this.wilson.resizeWorld({
				width: 4,
				height: 4,
				centerX: 0,
				centerY: 0,
				minX: -2,
				maxX: 2,
			});
		}

		else
		{
			this.ignoreBrightnessCalculation = true;

			// Animate the Julia set out from the clicked location.
			await animate((t) =>
			{
				this.wilson.setUniforms({
					juliaRadius: 1 - t,
				});
				this.wilsonHidden.setUniforms({
					juliaRadius: 1 - t,
				});

				this.needNewFrame = true;
			}, 600, "easeOutQuint");

			this.ignoreBrightnessCalculation = false;

			await animate((t) =>
			{
				this.wilson.resizeWorld({
					minX: -2 + 0.75 * t,
					maxX: 2 + 0.75 * t,
				});

				this.needNewFrame = true;
			}, 300, "easeInOutQuad");

			this.juliaMode = "julia";
			this.c[0] -= 0.75;
		}

		this.wilson.useShader(this.juliaMode);
		this.wilsonHidden.useShader(this.juliaMode);
		this.wilson.useInteractionForPanAndZoom = this.juliaMode !== "juliaPicker";
		if (this.switchJuliaModeButton)
		{
			this.switchJuliaModeButton.disabled = this.juliaMode === "juliaPicker";
		}

		this.needNewFrame = true;
	}

	

	onMousemove({ x, y })
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.c = [x, y];

			this.needNewFrame = true;
		}
	}

	onMousedown()
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.advanceJuliaMode();
		}
	}

	onTouchmove({ x, y, event })
	{
		event.preventDefault();
		
		if (this.juliaMode === "juliaPicker")
		{
			this.c = [x, y];

			this.needNewFrame = true;
		}
	}

	onTouchend()
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.advanceJuliaMode();
		}
	}

	updateBrightnessScale(zoomLevel)
	{
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

		const brightnessScale = Math.max(
			(
				brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
				+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
			) / 25,
			4
		);

		this.pastBrightnessScales.push(brightnessScale);
	}

	drawFrame()
	{
		const zoomLevel = -Math.log2(this.wilson.worldWidth) + 3;
		this.numIterations = Math.ceil(200 + zoomLevel * 40);

		if (!this.ignoreBrightnessCalculation)
		{
			this.updateBrightnessScale(zoomLevel);
		}

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