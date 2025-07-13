import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { currentlyTouchDevice } from "/scripts/src/interaction.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

const bubbleRadius = 1;

function getShaders(forHiddenCanvas = false)
{
	const color = forHiddenCanvas ? "vec3(1.0)" : "color";

	const maxIterations = "8001";

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
			
			
			
			for (int iteration = 0; iteration < ${maxIterations}; iteration++)
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
			
			// Lets us determine which points are in the Mandelbrot set.
			gl_FragColor = vec4(brightness / brightnessScale * ${color}, 1.0);
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
		uniform float crosshairSize;
		
		
		
		void main(void)
		{
			vec2 z = uv * worldSize * 0.5 + worldCenter - vec2(0.75, 0.0);

			vec2 diffFromC = z - c + vec2(0.75, 0.0);
			float minWorldSize = min(worldSize.x, worldSize.y);

			vec2 minMaxDistanceToCrosshair = vec2(
				min(abs(diffFromC.x), abs(diffFromC.y)),
				max(abs(diffFromC.x), abs(diffFromC.y))
			) / minWorldSize;

			if (minMaxDistanceToCrosshair.x < 0.002 && minMaxDistanceToCrosshair.y < crosshairSize)
			{
				gl_FragColor = vec4(0.75, 0.75, 0.75, 1.0);
				return;
			}

			float distanceFromMouse = clamp(
				length(diffFromC) / minWorldSize * juliaRadius * 10.0,
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
			
			for (int iteration = 0; iteration < ${maxIterations}; iteration++)
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
			
			gl_FragColor = vec4(brightness / brightnessScale * ${color}, 1.0);
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
			
			
			
			for (int iteration = 0; iteration < ${maxIterations}; iteration++)
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
			
			
			gl_FragColor = vec4(brightness / brightnessScale * ${color}, 1.0);
		}
	`;

	const shaderJuliaToMandelbrot = /* glsl */`
		precision highp float;
		
		varying vec2 uv;
		
		uniform vec2 worldCenter;
		uniform vec2 worldSize;
		
		uniform vec2 c;
		uniform int numIterations;
		uniform float brightnessScale;
		uniform float juliaProportion;
		
		
		
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

			vec2 usableC = mix(z, c, juliaProportion);
			
			
			
			for (int iteration = 0; iteration < ${maxIterations}; iteration++)
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
			
			
			gl_FragColor = vec4(brightness / brightnessScale * ${color}, 1.0);
		}
	`;

	return {
		mandelbrot: shaderMandelbrot,
		juliaPicker: shaderJuliaPicker,
		julia: shaderJulia,
		juliaToMandelbrot: shaderJuliaToMandelbrot
	};
}

export class JuliaSetExplorer extends AnimationFrameApplet
{
	wilsonHidden;

	juliaMode = "mandelbrot";

	numIterations = 1000;

	switchJuliaModeButton;
	ignoreBrightnessCalculation = false;
	pastBrightnessScales = [];
	c = [0, 0];

	resolution = 500;
	resolutionHidden = 50;



	constructor({ canvas, switchJuliaModeButton })
	{
		super(canvas);

		this.switchJuliaModeButton = switchJuliaModeButton;

		

		const options = {
			shaders: getShaders(),

			uniforms: {
				mandelbrot: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
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
					crosshairSize: 0.002
				},
				julia: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					c: this.c,
					numIterations: this.numIterations,
					brightnessScale: 10,
				},
				juliaToMandelbrot: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					c: this.c,
					numIterations: this.numIterations,
					brightnessScale: 10,
					juliaProportion: 1,
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
					touchstart: this.onTouchstart.bind(this),
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
			shaders: getShaders(true)
		});
		
		this.wilsonHidden.createFramebufferTexturePair({
			id: "draw",
			textureType: "float",
		});
		this.wilsonHidden.useFramebuffer("draw");

		this.wilsonHidden.useShader("mandelbrot");

		this.needNewFrame = true,
		this.resume();
	}



	async advanceJuliaMode()
	{
		if (this.juliaMode === "mandelbrot")
		{
			this.juliaMode = "juliaPicker";

			this.wilson.setUniforms({
				juliaRadius: bubbleRadius,
			}, "juliaPicker");
			this.wilsonHidden.setUniforms({
				juliaRadius: bubbleRadius,
			}, "juliaPicker");

			// Prevent the middle of the mandelbrot set from being distorted.
			this.c = [1000, 1000];
		}



		else if (this.juliaMode === "julia")
		{
			this.juliaMode = "juliaToMandelbrot";

			this.wilson.useShader(this.juliaMode);
			this.wilsonHidden.useShader(this.juliaMode);

			this.wilson.setUniforms({
				juliaProportion: 1,
				c: this.c,
			});
			this.wilsonHidden.setUniforms({
				juliaProportion: 1,
				c: this.c,
			});

			const worldWidth = this.wilson.worldWidth;
			const worldHeight = this.wilson.worldHeight;

			const levelsToZoom = -Math.min(Math.log2(worldWidth / 4), Math.log2(worldHeight / 4));

			const animationTime = levelsToZoom > 1
				? 500
				: levelsToZoom > 0
					? 200
					: 0;

			await animate((t) =>
			{
				this.wilson.resizeWorld({
					width: worldWidth * (1 - t) + 4 * t,
					height: worldHeight * (1 - t) + 4 * t,
				});

				this.needNewFrame = true;
			}, animationTime, "easeInOutCubic");

			if (levelsToZoom > 0)
			{
				await sleep(100);
			}

			await animate((t) =>
			{
				this.wilson.setUniforms({
					juliaProportion: 1 - t,
				});
				this.wilsonHidden.setUniforms({
					juliaProportion: 1 - t,
				});

				this.wilson.resizeWorld({
					minX: -2 + 0.75 * (1 - t),
					maxX: 2 + 0.75 * (1 - t),
				});

				this.needNewFrame = true;
			}, 500, "easeInOutQuad");

			this.juliaMode = "mandelbrot";
		}



		else
		{
			this.juliaMode = "julia";

			this.ignoreBrightnessCalculation = true;

			// Animate the Julia set out from the clicked location.
			animate((t) =>
			{
				this.wilson.setUniforms({
					juliaRadius: (1 - t) * bubbleRadius,
				});
				this.wilsonHidden.setUniforms({
					juliaRadius: (1 - t) * bubbleRadius,
				});

				this.needNewFrame = true;
			}, 600, "cubicBezier(0.2, 1, 0.2, 1)");

			await sleep(500);

			this.ignoreBrightnessCalculation = false;

			await animate((t) =>
			{
				this.wilson.resizeWorld({
					minX: -2 + 0.75 * t,
					maxX: 2 + 0.75 * t,
				});

				this.needNewFrame = true;
			}, 300, "easeInOutQuad");

			this.c[0] -= 0.75;
		}



		this.wilson.useShader(this.juliaMode);
		this.wilsonHidden.useShader(this.juliaMode);

		if (this.juliaMode === "juliaPicker" && currentlyTouchDevice)
		{
			this.wilson.useInteractionForPanAndZoom = false;
		}

		else
		{
			this.wilson.useInteractionForPanAndZoom = true;
		}

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

			this.wilson.setUniforms({
				crosshairSize: 0
			});
			this.wilsonHidden.setUniforms({
				crosshairSize: 0
			});

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

	onTouchstart({ x, y, event })
	{
		event.preventDefault();
		
		if (this.juliaMode === "juliaPicker")
		{
			const heightAdjust = Math.min(this.wilson.worldHeight, this.wilson.worldWidth) * 0.15;

			this.c = [x, y + heightAdjust];

			if (currentlyTouchDevice)
			{
				animate((t) =>
				{
					this.wilson.setUniforms({
						crosshairSize: t * 0.02
					});
					this.wilsonHidden.setUniforms({
						crosshairSize: t * 0.02
					});

					this.needNewFrame = true;
				}, 100, "easeOutQuad");
			}

			this.needNewFrame = true;
		}
	}

	onTouchmove({ x, y, event })
	{
		event.preventDefault();
		
		if (this.juliaMode === "juliaPicker")
		{
			const heightAdjust = Math.min(this.wilson.worldHeight, this.wilson.worldWidth) * 0.15;

			this.c = [x, y + heightAdjust];

			this.needNewFrame = true;
		}
	}

	onTouchend()
	{
		if (this.juliaMode === "juliaPicker")
		{
			this.advanceJuliaMode();

			animate((t) =>
			{
				this.wilson.setUniforms({
					crosshairSize: (1 - t) * 0.02
				});
				this.wilsonHidden.setUniforms({
					crosshairSize: (1 - t) * 0.02
				});

				this.needNewFrame = true;
			}, 100, "easeOutQuad");
		}
	}

	updateBrightnessScale()
	{
		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			numIterations: this.numIterations,
			brightnessScale: 1
		});

		if (this.juliaMode !== "mandelbrot")
		{
			this.wilsonHidden.setUniforms({ c: this.c });
		}

		this.wilsonHidden.drawFrame();
		const pixels = this.wilsonHidden.readPixels({
			format: "float",
		});

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);
		
		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixels[4 * i];
		}

		brightnesses.sort((a, b) => a - b);

		const brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .99)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .95)]
		) / 2;

		this.pastBrightnessScales.push(brightnessScale);
	}

	drawFrame()
	{
		if (!this.ignoreBrightnessCalculation)
		{
			this.updateBrightnessScale();
		}

		if (this.pastBrightnessScales.length > 10)
		{
			this.pastBrightnessScales.shift();
		}

		let brightnessScale = 0;

		for (let i = 0; i < this.pastBrightnessScales.length; i++)
		{
			brightnessScale += this.pastBrightnessScales[i];
		}

		brightnessScale /= this.pastBrightnessScales.length;

		this.wilson.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			numIterations: this.numIterations,
			brightnessScale
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