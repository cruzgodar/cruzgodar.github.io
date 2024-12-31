import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class GeneralizedJuliaSets extends AnimationFrameApplet
{
	loadPromise;
	generatingCode = "cadd(cpow(z, 2.0), c)";
	wilsonHidden;
	switchJuliaModeButton;
	juliaMode = "mandelbrot";

	pastBrightnessScales = [];
	numIterations = 200;
	c = [0, 0];

	resolution = 1000;
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



		const shaderJuliaPicker = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldCenter;
			uniform vec2 worldSize;
			
			uniform vec2 juliaC;
			uniform int numIterations;
			uniform float brightnessScale;
			
			${needDraggable ? "uniform vec2 draggableArg;" : ""}
			
			${getGlslBundle(generatingCode)}
			
			void main(void)
			{
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
				vec2 c = z;
				
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
					
					if (length(z) >= 10000.0)
					{
						break;
					}
					
					z = ${generatingCode};
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
				}
				
				
				
				z = uv * 2.0;

				c = juliaC;
				
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
					
					if (length(z) >= 10000.0)
					{
						break;
					}
					
					z = ${generatingCode};
					
					brightness += exp(-length(z));
				}
				
				if (!broken)
				{
					gl_FragColor += vec4(brightness / brightnessScale * color, 0.0);
				}
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
				id: "juliaPicker",
				shader: shaderJuliaPicker,
				uniforms: {
					worldCenter: [0, 0],
					worldSize: [4, 4],
					numIterations: this.numIterations,
					brightnessScale: 10,
					juliaC: this.c,
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
				centerX: 0,
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

	onTouchmove({ x, y, event })
	{
		event.preventDefault();
		
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

	onDragDraggable({ x, y })
	{
		for (const id of ["mandelbrot", "julia", "juliaPicker"])
		{
			this.wilson.setUniforms({ draggableArg: [x, y] }, id);
			this.wilsonHidden.setUniforms({ draggableArg: [x, y] }, id);
		}

		this.needNewFrame = true;
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

		if (this.juliaMode === "julia")
		{
			this.wilsonHidden.setUniforms({ c: this.c });
		}

		else if (this.juliaMode === "juliaPicker")
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

		if (this.juliaMode === "julia")
		{
			this.wilson.setUniforms({ c: this.c });
		}

		else if (this.juliaMode === "juliaPicker")
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

		await new Promise(resolve => setTimeout(resolve, 33));
	}
}