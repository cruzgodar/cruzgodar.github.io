import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { getFloatGlsl, getVectorGlsl, tempShader } from "/scripts/applets/applet.js";
import { getGlslBundle, loadGlsl } from "/scripts/src/complexGlsl.js";
import { currentlyTouchDevice } from "/scripts/src/interaction.js";
import { animate, sleep } from "/scripts/src/utils.js";
import { WilsonGPU } from "/scripts/wilson.js";

const bubbleRadius = 1;

export class JuliaSetExplorer extends AnimationFrameApplet
{
	wilsonHidden;

	generatingCode;
	worldAdjust;
	maxWorldSize;
	needDraggable;
	bailoutRadius;

	juliaMode = "mandelbrot";

	numIterations = 1000;

	switchJuliaModeButton;
	ignoreBrightnessCalculation = false;
	pastBrightnessScales = [];
	c = [0, 0];
	
	resolution = 1000;
	resolutionHidden = 50;



	constructor({
		canvas,
		switchJuliaModeButton,
		generatingCode,
		worldAdjust = [0, 0],
		maxWorldSize = 4,
		bailoutRadius = 4,
	}) {
		super(canvas);

		this.switchJuliaModeButton = switchJuliaModeButton;

		

		const options = {
			shader: tempShader,

			canvasWidth: this.resolution,

			worldWidth: 4,
			worldCenterX: 0,
			worldCenterY: 0,

			minWorldX: -maxWorldSize / 2,
			maxWorldX: maxWorldSize / 2,
			minWorldY: -maxWorldSize / 2,
			maxWorldY: maxWorldSize / 2,
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
		


		const hiddenCanvas = this.createHiddenCanvas();

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			canvasWidth: this.resolutionHidden,
		});
		
		this.wilsonHidden.createFramebufferTexturePair({
			id: "draw",
			textureType: "float",
		});
		this.wilsonHidden.useFramebuffer("draw");

		this.run({
			generatingCode,
			worldAdjust,
			maxWorldSize,
			bailoutRadius,
		});
	}

	

	async getShaders(forHiddenCanvas = false)
	{
		await loadGlsl();

		const draggableUniformString = this.needDraggable ? "uniform vec2 draggableArg;" : "";

		const worldAdjustGlsl = getVectorGlsl(this.worldAdjust);

		const bailoutRadiusGlsl = getFloatGlsl(this.bailoutRadius);

		const glslBundle = getGlslBundle(this.generatingCode);

		const color = forHiddenCanvas ? "vec3(1.0)" : "color";

		const maxIterations = "8001";

		const shaderMandelbrot = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform int numIterations;
			uniform float brightnessScale;
			
			${draggableUniformString}
					
			${glslBundle}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter + ${worldAdjustGlsl};
				
				vec2 c = z;

				float r = length(z);
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / r * vec3(1.0)
				);
				
				float brightness = exp(-r);
				
				
				
				for (int iteration = 0; iteration < ${maxIterations}; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (r >= ${bailoutRadiusGlsl})
					{
						break;
					}
					
					z = ${this.generatingCode};

					r = length(z);
					
					brightness += exp(-r);
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
			
			uniform vec2 juliaC;
			uniform int numIterations;
			uniform float brightnessScale;
			uniform float juliaRadius;
			uniform float crosshairSize;
			
			${draggableUniformString}
					
			${glslBundle}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter + ${worldAdjustGlsl};

				vec2 diffFromC = z - juliaC - ${worldAdjustGlsl};
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
				vec2 c = mix(juliaC + ${worldAdjustGlsl}, z, t);
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);

				float r = length(z);
				
				float brightness = exp(-r);
				
				
				
				for (int iteration = 0; iteration < ${maxIterations}; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						
						return;
					}
					
					if (r >= ${bailoutRadiusGlsl})
					{
						break;
					}
					
					z = ${this.generatingCode};

					r = length(z);
					
					brightness += exp(-r);
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
			
			${draggableUniformString}
					
			${glslBundle}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter + ${worldAdjustGlsl};
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);

				float r = length(z);
				
				float brightness = exp(-r);
				
				
				
				for (int iteration = 0; iteration < ${maxIterations}; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (r >= ${bailoutRadiusGlsl})
					{
						break;
					}
					
					z = ${this.generatingCode};

					r = length(z);
					
					brightness += exp(-r);
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * ${color}, 1.0);
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
			
			${draggableUniformString}
					
			${glslBundle}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter + ${worldAdjustGlsl};
				
				vec3 color = normalize(
					vec3(
						abs(z.x + z.y) / 2.0,
						abs(z.x) / 2.0,
						abs(z.y) / 2.0
					)
					+ .1 / length(z) * vec3(1.0)
				);

				float r = length(z);
				
				float brightness = exp(-r);

				vec2 c = mix(z, juliaC, juliaProportion);
				
				
				
				for (int iteration = 0; iteration < ${maxIterations}; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (r >= ${bailoutRadiusGlsl})
					{
						break;
					}
					
					z = ${this.generatingCode};

					r = length(z);
					
					brightness += exp(-r);
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



	async run({
		generatingCode = this.generatingCode,
		worldAdjust = this.worldAdjust,
		maxWorldSize = this.maxWorldSize,
		bailoutRadius = this.bailoutRadius,
	}) {
		this.generatingCode = generatingCode;
		this.worldAdjust = worldAdjust;
		this.maxWorldSize = maxWorldSize;
		this.bailoutRadius = bailoutRadius;
		this.needDraggable = generatingCode.indexOf("draggableArg") !== -1;

		const [shaders, shadersHidden] = await Promise.all([
			this.getShaders(),
			this.getShaders(true),
		]);

		this.wilson.loadShader({
			id: "mandelbrot",
			shader: shaders.mandelbrot,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				draggableArg: [0, 0],
			},
		});

		this.wilson.loadShader({
			id: "juliaPicker",
			shader: shaders.juliaPicker,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				juliaC: this.c,
				juliaRadius: bubbleRadius,
				crosshairSize: 0.002,
				draggableArg: [0, 0],
			},
		});

		this.wilson.loadShader({
			id: "julia",
			shader: shaders.julia,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				c: this.c,
				draggableArg: [0, 0],
			},
		});

		this.wilson.loadShader({
			id: "juliaToMandelbrot",
			shader: shaders.juliaToMandelbrot,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				juliaProportion: 1,
				juliaC: this.c,
				draggableArg: [0, 0],
			},
		});



		this.wilsonHidden.loadShader({
			id: "mandelbrot",
			shader: shadersHidden.mandelbrot,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				draggableArg: [0, 0],
			},
		});

		this.wilsonHidden.loadShader({
			id: "juliaPicker",
			shader: shadersHidden.juliaPicker,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				juliaC: this.c,
				juliaRadius: bubbleRadius,
				crosshairSize: 0.002,
				draggableArg: [0, 0],
			},
		});

		this.wilsonHidden.loadShader({
			id: "julia",
			shader: shadersHidden.julia,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				c: this.c,
				draggableArg: [0, 0],
			},
		});

		this.wilsonHidden.loadShader({
			id: "juliaToMandelbrot",
			shader: shadersHidden.juliaToMandelbrot,
			uniforms: {
				worldCenter: [0, 0],
				worldSize: [4, 4],
				numIterations: this.numIterations,
				brightnessScale: 10,
				juliaProportion: 1,
				juliaC: this.c,
				draggableArg: [0, 0],
			},
		});



		this.wilson.resizeWorld({
			width: 4,
			height: 4,
			centerX: 0,
			centerY: 0,
			minWorldX: -this.maxWorldSize / 2,
			maxWorldX: this.maxWorldSize / 2,
			minWorldY: -this.maxWorldSize / 2,
			maxWorldY: this.maxWorldSize / 2,
			minWidth: 0.00001,
			minHeight: 0.00001,
		});

		this.wilsonHidden.resizeWorld({
			width: 4,
			height: 4,
			centerX: 0,
			centerY: 0,
		});



		this.wilson.useShader("mandelbrot");
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
			const worldCenterX = this.wilson.worldCenterX;
			const worldCenterY = this.wilson.worldCenterY;

			const levelsToZoom = Math.abs(
				Math.min(Math.log2(worldWidth / 4), Math.log2(worldHeight / 4))
			);

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

				this.wilson.resizeWorld({
					minX: -this.maxWorldSize / 2 - this.worldAdjust[0] * (1 - t),
					maxX: this.maxWorldSize / 2 - this.worldAdjust[0] * (1 - t),
					minY: -this.maxWorldSize / 2 - this.worldAdjust[1] * (1 - t),
					maxY: this.maxWorldSize / 2 - this.worldAdjust[1] * (1 - t),
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
					minX: -this.maxWorldSize / 2 - this.worldAdjust[0] * t,
					maxX: this.maxWorldSize / 2 - this.worldAdjust[0] * t,
					minY: -this.maxWorldSize / 2 - this.worldAdjust[1] * t,
					maxY: this.maxWorldSize / 2 - this.worldAdjust[1] * t,
				});

				this.needNewFrame = true;
			}, 300, "easeInOutQuad");

			this.c[0] += this.worldAdjust[0];
			this.c[1] += this.worldAdjust[1];
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

		if (this.juliaMode === "julia")
		{
			this.wilsonHidden.setUniforms({ c: this.c });
		}

		else if (this.juliaMode !== "mandelbrot")
		{
			this.wilsonHidden.setUniforms({ juliaC: this.c });
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
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
		) / 1.5;

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

		if (this.juliaMode === "julia")
		{
			this.wilson.setUniforms({ c: this.c });
		}

		else if (this.juliaMode !== "mandelbrot")
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