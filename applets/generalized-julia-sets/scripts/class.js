import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { currentlyTouchDevice } from "/scripts/src/interaction.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

const bubbleRadius = 1;

export class GeneralizedJuliaSets extends AnimationFrameApplet
{
	loadPromise;
	generatingCode = "cadd(cpow(z, 2.0), c)";
	wilsonHidden;
	switchJuliaModeButton;
	ignoreBrightnessCalculation = false;
	juliaMode = "mandelbrot";

	pastBrightnessScales = [];
	numIterations = 200;
	c = [0, 0];

	resolution = 500;
	resolutionHidden = 50;



	constructor({
		canvas,
		switchJuliaModeButton
	}) {
		super(canvas);

		this.switchJuliaModeButton = switchJuliaModeButton;

		const hiddenCanvas = this.createHiddenCanvas();

		const options = {
			shader: tempShader,

			canvasWidth: this.resolution,

			worldWidth: 4,

			minWorldWidth: 0.00001,
			maxWorldWidth: 100,
			minWorldHeight: 0.00001,
			maxWorldHeight: 100,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",

			onResizeCanvas: () => this.needNewFrame = true,

			draggableOptions: {
				draggables: {
					draggableArg: [0, 0],
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
				}
			},

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
		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			draggableOptions: {},
			canvasWidth: this.resolutionHidden,
		});

		this.wilson.draggables.draggableArg.element.style.display = "none";

		this.loadPromise = loadGlsl();
	}


	run({
		generatingCode = "cpow(z, 2.0) + c",
		resolution = 500,
	}) {
		this.generatingCode = generatingCode;
		this.resolution = resolution;

		const needDraggable = generatingCode.indexOf("draggableArg") !== -1;

		const shaderMandelbrot = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform int numIterations;
			uniform float brightnessScale;
			
			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			${getGlslBundle(generatingCode)}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
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
					
					if (length(z) >= 10000.0)
					{
						break;
					}
					
					z = ${generatingCode};
					
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
			
			uniform vec2 juliaC;
			uniform int numIterations;
			uniform float brightnessScale;
			uniform float juliaRadius;
			uniform float crosshairSize;

			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			${getGlslBundle(generatingCode)}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;

				vec2 diffFromC = z - juliaC;
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
				vec2 c = mix(juliaC, z, t);
				
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
					
					z = ${generatingCode};
					
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
			
			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			${getGlslBundle(generatingCode)}
			
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
					
					if (length(z) >= 10000.0)
					{
						break;
					}
					
					z = ${generatingCode};
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		const shaderJuliaToMandelbrot = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform vec2 juliaC;
			uniform int numIterations;
			uniform float brightnessScale;
			uniform float juliaProportion;
			
			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			${getGlslBundle(generatingCode)}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);
				
				float brightness = exp(-length(z));

				vec2 c = mix(z, juliaC, juliaProportion);
				
				
				
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
					
					z = ${generatingCode};
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;

		for (const wilson of [this.wilson, this.wilsonHidden])
		{
			wilson.loadShader({
				id: "mandelbrot",
				shader: shaderMandelbrot,
				uniforms: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
					...(needDraggable ? { draggableArg: [0, 0] } : {}),
				},
			});

			wilson.loadShader({
				id: "juliaPicker",
				shader: shaderJuliaPicker,
				uniforms: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
					juliaC: this.c,
					juliaRadius: 1,
					crosshairSize: 0.002,
					...(needDraggable ? { draggableArg: [0, 0] } : {}),
				},
			});

			wilson.loadShader({
				id: "julia",
				shader: shaderJulia,
				uniforms: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
					c: this.c,
					...(needDraggable ? { draggableArg: [0, 0] } : {}),
				},
			});

			wilson.loadShader({
				id: "juliaToMandelbrot",
				shader: shaderJuliaToMandelbrot,
				uniforms: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
					juliaC: this.c,
					juliaProportion: 1,
					...(needDraggable ? { draggableArg: [0, 0] } : {}),
				},
			});
		}

		this.juliaMode = "mandelbrot";
		this.wilson.useShader(this.juliaMode);
		this.wilsonHidden.useShader(this.juliaMode);

		this.pastBrightnessScales = [];

		this.wilson.draggables.draggableArg.element.style.display =
			needDraggable ? "block" : "none";

		this.wilson.setDraggables({ draggableArg: [0, 0] });

		this.wilson.resizeWorld({
			width: 4,
			height: 4,
			centerX: 0,
			centerY: 0
		});
		
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
			const worldCenterX = this.wilson.worldCenterX;
			const worldCenterY = this.wilson.worldCenterY;

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
					centerX: worldCenterX * (1 - t),
					centerY: worldCenterY * (1 - t),
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

			// Smoothly change brightness.
			await animate(() =>
			{
				this.needNewFrame = true;
			}, 300, "easeInOutQuad");
		}

		this.pastBrightnessScales = [];

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

	onDragDraggable({ x, y })
	{
		for (const id of ["mandelbrot", "juliaPicker", "julia", "juliaToMandelbrot"])
		{
			this.wilson.setUniforms({ draggableArg: [x, y] }, id);
			this.wilsonHidden.setUniforms({ draggableArg: [x, y] }, id);
		}

		this.needNewFrame = true;
	}



	updateBrightnessScale(zoomLevel)
	{
		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			numIterations: this.numIterations,
			brightnessScale: 20 + zoomLevel
		});

		if (this.juliaMode === "julia")
		{
			this.wilsonHidden.setUniforms({ c: this.c });
		}

		else if (this.juliaMode === "juliaPicker" || this.juliaMode === "juliaToMandelbrot")
		{
			this.wilsonHidden.setUniforms({ juliaC: this.c });
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
		this.numIterations = Math.ceil(200 + zoomLevel * 50);

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

		if (this.juliaMode === "julia")
		{
			this.wilson.setUniforms({ c: this.c });
		}

		else if (this.juliaMode === "juliaPicker" || this.juliaMode === "juliaToMandelbrot")
		{
			this.wilson.setUniforms({ juliaC: this.c });
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