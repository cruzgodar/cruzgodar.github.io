import { doubleEmulationGlsl, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { Applet } from "/scripts/src/applets.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class JuliaSet extends Applet
{
	wilsonHidden = null;

	juliaMode = 0;

	aspectRatio = 1;

	numIterations = 100;

	useDoublePrecision = false;
	doublePrecision = false;

	switchJuliaModeButton = null;

	// Experimentally, the level at which a 2k x 2k
	// canvas can see the grain of single precision rendering.
	doublePrecisionZoomThreshhold = -16;

	pastBrightnessScales = [];

	a = 0;
	b = 1;

	resolution = 1000;
	resolutionHidden = 100;

	lastTimestamp = -1;



	constructor({ canvas, switchJuliaModeButton })
	{
		super(canvas);

		this.pan.minX = -2.75;
		this.pan.maxX = 1.25;
		this.pan.minY = -2;
		this.pan.maxY = 2;

		this.switchJuliaModeButton = switchJuliaModeButton;

		loadGlsl().then(() => this.run({ canvas }));
	}



	run({ canvas })
	{
		const fragShaderSourceSingle0 = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
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
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
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



		const fragShaderSourceSingle1 = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
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
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
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



		const fragShaderSourceSingle2 = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
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
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
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



		const fragShaderSourceDouble0 = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${doubleEmulationGlsl}
			
			
			
			void main(void)
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec4 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
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
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		const fragShaderSourceDouble1 = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${doubleEmulationGlsl}
			
			
			
			void main(void)
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec4 c = vec4(a, 0.0, b, 0.0);
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
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
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		const fragShaderSourceDouble2 = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform vec2 worldCenterX;
			uniform vec2 worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${doubleEmulationGlsl}
			
			
			
			void main(void)
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec4 c = z;
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
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
					
					z = dcAdd(dcMul(z, z), c);
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
				}
				
				
				
				z = c;
				
				c = vec4(a, 0.0, b, 0.0);
				
				color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
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
					
					z = dcAdd(dcMul(z, z), c);
					
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
		this.wilson.render.loadNewShader(fragShaderSourceDouble0);
		this.wilson.render.loadNewShader(fragShaderSourceDouble1);
		this.wilson.render.loadNewShader(fragShaderSourceDouble2);

		for (let i = 0; i < 6; i++)
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
		this.wilsonHidden.render.loadNewShader(fragShaderSourceDouble0);
		this.wilsonHidden.render.loadNewShader(fragShaderSourceDouble1);
		this.wilsonHidden.render.loadNewShader(fragShaderSourceDouble2);

		for (let i = 0; i < 6; i++)
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

		this.zoom.init();

		// Render the inital frame.
		window.requestAnimationFrame(this.drawFrame.bind(this));


		const boundFunction = () => this.changeAspectRatio(true);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});
	}



	toggleUseDoublePrecision()
	{
		this.useDoublePrecision = !this.useDoublePrecision;

		this.zoomCanvas();
	}



	toggleDoublePrecision()
	{
		this.doublePrecision = !this.doublePrecision;

		if (this.doublePrecision)
		{
			this.wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
		}

		else
		{
			this.wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
		}
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

			this.pan.minX = -2.75;
			this.pan.maxX = 1.25;
			this.pan.minY = -2;
			this.pan.maxY = 2;

			this.zoom.init();

			this.pastBrightnessScales = [];
		}
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

			this.pan.minX = -2;
			this.pan.maxX = 2;
			this.pan.minY = -2;
			this.pan.maxY = 2;

			this.zoom.init();

			this.pastBrightnessScales = [];

			if (this.switchJuliaModeButton)
			{
				this.switchJuliaModeButton.disabled = false;
			}
		}
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
	}



	onHoverCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "mousemove")
		{
			this.a = x;
			this.b = y;
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

			this.pan.minX = -2;
			this.pan.maxX = 2;
			this.pan.minY = -2;
			this.pan.maxY = 2;

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
	}



	onWheelCanvas(x, y, scrollAmount)
	{
		if (this.juliaMode !== 2)
		{
			this.zoom.onWheelCanvas(x, y, scrollAmount);
		}
	}



	onPinchCanvas(x, y, touchDistanceDelta)
	{
		if (this.juliaMode !== 2)
		{
			this.zoom.onPinchCanvas(x, y, touchDistanceDelta);
		}
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}



		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);



		if (
			(
				!this.doublePrecision
				&& this.zoom.level < this.doublePrecisionZoomThreshhold
				&& this.useDoublePrecision
			) || (
				this.doublePrecision
				&& (
					this.zoom.level > this.doublePrecisionZoomThreshhold
					|| !this.useDoublePrecision
				)
			)
		) {
			this.toggleDoublePrecision();
		}



		const cx = Applet.doubleToDf(this.wilson.worldCenterX);
		const cy = Applet.doubleToDf(this.wilson.worldCenterY);

		const shaderProgramIndex = this.juliaMode + 3 * this.doublePrecision;



		this.numIterations = (-this.zoom.level * 30) + 200;



		this.wilsonHidden.gl.useProgram(
			this.wilsonHidden.render.shaderPrograms[shaderProgramIndex]);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["aspectRatio"][shaderProgramIndex],
			1)
		;

		this.wilsonHidden.gl.uniform2fv(
			this.wilsonHidden.uniforms["worldCenterX"][shaderProgramIndex],
			cx
		);
		this.wilsonHidden.gl.uniform2fv(
			this.wilsonHidden.uniforms["worldCenterY"][shaderProgramIndex],
			cy
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldSize"][shaderProgramIndex],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilsonHidden.gl.uniform1i(
			this.wilsonHidden.uniforms["numIterations"][shaderProgramIndex],
			this.numIterations
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["a"][shaderProgramIndex],
			this.a
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["b"][shaderProgramIndex],
			this.b
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["brightnessScale"][shaderProgramIndex],
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



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[shaderProgramIndex]);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["aspectRatio"][shaderProgramIndex],
			this.aspectRatio
		);

		this.wilson.gl.uniform2fv(
			this.wilson.uniforms["worldCenterX"][shaderProgramIndex],
			cx
		);

		this.wilson.gl.uniform2fv(
			this.wilson.uniforms["worldCenterY"][shaderProgramIndex],
			cy
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["worldSize"][shaderProgramIndex],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilson.gl.uniform1i(
			this.wilson.uniforms["numIterations"][shaderProgramIndex],
			this.numIterations
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["a"][shaderProgramIndex],
			this.a
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["b"][shaderProgramIndex],
			this.b
		);
		
		this.wilson.gl.uniform1f(
			this.wilson.uniforms["brightnessScale"][shaderProgramIndex],
			brightnessScale
		);

		this.wilson.render.drawFrame();


		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}