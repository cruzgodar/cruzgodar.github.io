import { loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class JuliaSet extends AnimationFrameApplet
{
	wilsonHidden;

	juliaMode = 0;

	aspectRatio = 1;

	numIterations = 100;

	switchJuliaModeButton;

	pastBrightnessScales = [];

	a = 0;
	b = 1;

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
		const fragShaderSourceSingle0 = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
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



		const fragShaderSourceSingle1 = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				vec2 c = vec2(a, b);
				
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



		const fragShaderSourceSingle2 = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
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
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
				}
				
				
				
				z = vec2(uv.x * aspectRatio * 2.0, uv.y * 2.0);
				
				color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				brightness = exp(-length(z));
				
				broken = false;
				
				c = vec2(a, b);
				
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



		const options =
		{
			renderer: "gpu",

			shader: fragShaderSourceSingle0,

			canvasWidth: 1000,
			canvasHeight: 1000,

			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: -.75,
			worldCenterY: 0,



			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: () => this.changeAspectRatio(true),



			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousemoveCallback: this.onHoverCanvas.bind(this),
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),

			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};

		const optionsHidden =
		{
			renderer: "gpu",

			shader: fragShaderSourceSingle0,

			canvasWidth: 100,
			canvasHeight: 100
		};



		this.wilson = new Wilson(canvas, options);

		this.wilson.render.loadNewShader(fragShaderSourceSingle1);
		this.wilson.render.loadNewShader(fragShaderSourceSingle2);

		for (let i = 0; i < 3; i++)
		{
			this.wilson.render.initUniforms([
				"aspectRatio",
				"worldCenterX",
				"worldCenterY",
				"worldSize",
				"a",
				"b",
				"numIterations",
				"brightnessScale"
			], i);
		}



		const hiddenCanvas = this.createHiddenCanvas();

		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);

		this.wilsonHidden.render.loadNewShader(fragShaderSourceSingle1);
		this.wilsonHidden.render.loadNewShader(fragShaderSourceSingle2);

		for (let i = 0; i < 3; i++)
		{
			this.wilsonHidden.render.initUniforms([
				"aspectRatio",
				"worldCenterX",
				"worldCenterY",
				"worldSize",
				"a",
				"b",
				"numIterations",
				"brightnessScale"
			], i);
		}

		this.pan.setBounds({
			minX: -2.75,
			maxX: 1.25,
			minY: -2,
			maxY: 2,
		});

		this.zoom.init();

		this.resume();


		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});
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



	onWheelCanvas(x, y, scrollAmount)
	{
		if (this.juliaMode !== 2)
		{
			this.zoom.onWheelCanvas(x, y, scrollAmount);

			this.needNewFrame = true;
		}
	}



	onPinchCanvas(x, y, touchDistanceDelta)
	{
		if (this.juliaMode !== 2)
		{
			this.zoom.onPinchCanvas(x, y, touchDistanceDelta);

			this.needNewFrame = true;
		}
	}

	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
	}

	drawFrame()
	{
		this.numIterations = (-this.zoom.level * 30) + 200;



		this.wilsonHidden.gl.useProgram(
			this.wilsonHidden.render.shaderPrograms[this.juliaMode]
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.aspectRatio[this.juliaMode],
			1
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.worldCenterX[this.juliaMode],
			this.wilson.worldCenterX
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.worldCenterY[this.juliaMode],
			this.wilson.worldCenterY
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.worldSize[this.juliaMode],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilsonHidden.gl.uniform1i(
			this.wilsonHidden.uniforms.numIterations[this.juliaMode],
			this.numIterations
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.a[this.juliaMode],
			this.a
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.b[this.juliaMode],
			this.b
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.brightnessScale[this.juliaMode],
			20 * (Math.abs(this.zoom.level) + 1)
		);

		this.wilsonHidden.render.drawFrame();



		const pixelData = this.wilsonHidden.render.getPixelData();

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);

		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}

		brightnesses.sort((a, b) => a - b);

		let brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
		) / 255 * 15 * (Math.abs(this.zoom.level / 2) + 1);

		this.pastBrightnessScales.push(brightnessScale);

		const denom = this.pastBrightnessScales.length;

		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}

		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);



		this.wilson.gl.useProgram(
			this.wilson.render.shaderPrograms[this.juliaMode]
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatio[this.juliaMode],
			this.aspectRatio
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.worldCenterX[this.juliaMode],
			this.wilson.worldCenterX
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.worldCenterY[this.juliaMode],
			this.wilson.worldCenterY
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.worldSize[this.juliaMode],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms.numIterations[this.juliaMode],
			this.numIterations
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.a[this.juliaMode],
			this.a
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.b[this.juliaMode],
			this.b
		);
		
		this.wilson.gl.uniform1f(
			this.wilson.uniforms.brightnessScale[this.juliaMode],
			brightnessScale
		);

		this.wilson.render.drawFrame();
	}
}