import { loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { Applet } from "/scripts/applets/applet.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class JuliaSet extends Applet
{
	wilsonHidden;

	juliaMode = 0;

	numIterations = 100;

	switchJuliaModeButton;
	pastBrightnessScales = [];
	c = [0, 1];

	resolution = 1000;
	resolutionHidden = 100;



	constructor({ canvas, switchJuliaModeButton })
	{
		super(canvas);

		this.switchJuliaModeButton = switchJuliaModeButton;

		loadGlsl().then(() => this.run({ canvas }));
	}



	run({ canvas })
	{
		const fragShaderSourceMandelbrot = /* glsl */`
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



		const fragShaderSourceJulia = /* glsl */`
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



		const fragShaderSourceJuliaPicker = /* glsl */`
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
				mandelbrot: fragShaderSourceMandelbrot,
				julia: fragShaderSourceJulia,
				juliaPicker: fragShaderSourceJuliaPicker,
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

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: this.drawFrame.bind(this),
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



		const hiddenCanvas = this.createHiddenCanvas(false);

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, {
			...options,
			canvasWidth: this.resolutionHidden,
		});
		this.wilsonHidden.useShader("mandelbrot");

		this.drawFrame();
	}



	advanceJuliaMode()
	{
		if (this.juliaMode === 0)
		{
			this.juliaMode = 2;

			this.a = 0;
			this.b = 0;

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = true;
			}
		}

		else if (this.juliaMode === 1)
		{
			this.juliaMode = 0;

			this.wilson.worldCenterX = -.75;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;

			this.pan.setBounds({
				minX: -2.75,
				maxX: 1.25,
				minY: -2,
				maxY: 2,
			});

			this.zoom.init();

			this.pastBrightnessScales = [];
		}

		this.needNewFrame = true;
	}



	onGrabCanvas(x, y, event)
	{
		this.pan.onGrabCanvas();
		this.zoom.onGrabCanvas();



		if (this.juliaMode === 2 && event.type === "mousedown")
		{
			this.juliaMode = 1;

			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;

			this.pan.setBounds({
				minX: -2,
				maxX: 2,
				minY: -2,
				maxY: 2,
			});

			this.zoom.init();

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = false;
			}
		}

		this.needNewFrame = true;
	}



	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "touchmove")
		{
			this.a = x;
			this.b = y;
		}

		else
		{
			this.pan.onDragCanvas(x, y, xDelta, yDelta);
		}

		this.needNewFrame = true;
	}



	onHoverCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "mousemove")
		{
			this.a = x;
			this.b = y;

			this.needNewFrame = true;
		}
	}



	onReleaseCanvas(x, y, event)
	{
		if (this.juliaMode === 2 && event.type === "touchend")
		{
			this.juliaMode = 1;

			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;

			this.pan.setBounds({
				minX: -2,
				maxX: 2,
				minY: -2,
				maxY: 2,
			});

			this.zoom.init();

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = false;
			}
		}

		else
		{
			this.pan.onReleaseCanvas();
			this.zoom.onReleaseCanvas();
		}

		this.needNewFrame = true;
	}

	drawFrame()
	{
		const zoomLevel = -Math.log2(this.wilson.worldWidth);
		this.numIterations = Math.ceil(200 + zoomLevel * 50);

		this.wilsonHidden.setUniform({
			name: "worldSize",
			value: [this.wilson.worldWidth, this.wilson.worldHeight]
		});
		this.wilsonHidden.setUniform({
			name: "worldCenter",
			value: [this.wilson.worldCenterX, this.wilson.worldCenterY]
		});
		this.wilsonHidden.setUniform({ name: "numIterations", value: this.numIterations });
		this.wilsonHidden.setUniform({
			name: "brightnessScale",
			value: 20 + zoomLevel
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
		) / 25 + Math.max(zoomLevel, 1) * 2;

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



		this.wilson.setUniform({
			name: "worldSize",
			value: [this.wilson.worldWidth, this.wilson.worldHeight]
		});
		this.wilson.setUniform({
			name: "worldCenter",
			value: [this.wilson.worldCenterX, this.wilson.worldCenterY]
		});
		this.wilson.setUniform({ name: "numIterations", value: this.numIterations });
		this.wilson.setUniform({
			name: "brightnessScale",
			value: averageBrightnessScale
		});

		this.wilson.drawFrame();



		// this.wilson.gl.useProgram(
		// 	this.wilson.render.shaderPrograms[this.juliaMode]
		// );

		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.aspectRatio[this.juliaMode],
		// 	this.aspectRatio
		// );

		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.worldCenterX[this.juliaMode],
		// 	this.wilson.worldCenterX
		// );

		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.worldCenterY[this.juliaMode],
		// 	this.wilson.worldCenterY
		// );

		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.worldSize[this.juliaMode],
		// 	Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		// );

		// this.wilson.gl.uniform1i(
		// 	this.wilson.uniforms.numIterations[this.juliaMode],
		// 	this.numIterations
		// );

		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.a[this.juliaMode],
		// 	this.a
		// );

		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.b[this.juliaMode],
		// 	this.b
		// );
		
		// this.wilson.gl.uniform1f(
		// 	this.wilson.uniforms.brightnessScale[this.juliaMode],
		// 	brightnessScale
		// );

		// this.wilson.render.drawFrame();
	}
}