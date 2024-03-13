import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { $$, addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class FractalSounds extends AnimationFrameApplet
{
	loadPromise;

	wilsonHidden;
	wilsonJulia;

	juliaMode = 0;

	aspectRatio = 1;

	numIterations = 200;

	exposure = 1;

	zoomLevel = 0;

	pastBrightnessScales = [];

	resolution = 500;
	resolutionHidden = 200;

	needToClear = false;

	fixedPointX = 0;
	fixedPointY = 0;

	moved = 0;

	lastX = 0;
	lastY = 0;
	zoomingWithMouse = false;



	constructor({ canvas, lineDrawerCanvas })
	{
		super(canvas);

		const tempShader = /* glsl */`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const optionsJulia =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: this.switchFullscreen.bind(this)
		};

		this.wilsonJulia = new Wilson(canvas, optionsJulia);



		const hiddenCanvas = this.createHiddenCanvas();

		const optionsHidden =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};

		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);



		const options =
		{
			renderer: "cpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0,

			mousemoveCallback: this.onHoverCanvas.bind(this),
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),

			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this),

			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: false
		};

		this.wilson = new Wilson(lineDrawerCanvas, options);

		const elements = $$(".wilson-fullscreen-components-container");

		elements[0].style.setProperty("z-index", 200, "important");
		elements[1].style.setProperty("z-index", 300, "important");

		this.wilson.ctx.lineWidth = 40;



		this.pan.setBounds({
			minX: -3,
			maxX: 3,
			minY: -3,
			maxY: 3,
		});

		this.zoom.init();

		this.listenForNumTouches();

		const boundFunction = () => this.changeAspectRatio(true, [this.wilson, this.wilsonJulia]);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		this.loadPromise = loadGlsl();
	}



	run({
		glslCode,
		jsCode,
		resolution,
		exposure,
		numIterations
	}) {
		this.currentFractalFunction = jsCode;

		this.resolution = resolution;
		this.exposure = exposure;
		this.numIterations = numIterations;

		const fragShaderSource = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			const float hueMultiplier = 100.0;
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(1.0, .4157, 0.0);
			const vec3 color3 = vec3(1.0, .8471, 0.0);
			const vec3 color4 = vec3(.7333, 1.0, 0.0);
			const vec3 color5 = vec3(.2980, 1.0, 0.0);
			const vec3 color6 = vec3(0.0, 1.0, .1137);
			const vec3 color7 = vec3(0.0, 1.0, .5490);
			const vec3 color8 = vec3(0.0, 1.0, .9647);
			const vec3 color9 = vec3(0.0, .6, 1.0);
			const vec3 color10 = vec3(0.0, .1804, 1.0);
			const vec3 color11 = vec3(.2471, 0.0, 1.0);
			const vec3 color12 = vec3(.6667, 0.0, 1.0);
			const vec3 color13 = vec3(1.0, 0.0, .8980);
			
			
			
			${getGlslBundle(glslCode)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
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
				
				float brightness = exp(-max(length(z), .5));
				
				vec2 c = z;
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				vec2 lastZ1 = vec2(0.0, 0.0);
				vec2 lastZ2 = vec2(0.0, 0.0);
				vec2 lastZ3 = vec2(0.0, 0.0);
				vec2 lastZ4 = vec2(0.0, 0.0);
				vec2 lastZ5 = vec2(0.0, 0.0);
				vec2 lastZ6 = vec2(0.0, 0.0);
				vec2 lastZ7 = vec2(0.0, 0.0);
				vec2 lastZ8 = vec2(0.0, 0.0);
				vec2 lastZ9 = vec2(0.0, 0.0);
				vec2 lastZ10 = vec2(0.0, 0.0);
				vec2 lastZ11 = vec2(0.0, 0.0);
				vec2 lastZ12 = vec2(0.0, 0.0);
				vec2 lastZ13 = vec2(0.0, 0.0);
				
				float hue1 = 0.0;
				float hue2 = 0.0;
				float hue3 = 0.0;
				float hue4 = 0.0;
				float hue5 = 0.0;
				float hue6 = 0.0;
				float hue7 = 0.0;
				float hue8 = 0.0;
				float hue9 = 0.0;
				float hue10 = 0.0;
				float hue11 = 0.0;
				float hue12 = 0.0;
				float hue13 = 0.0;
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						vec3 color = hue1 * color1 + hue2 * color2 + hue3 * color3 + hue4 * color4 + hue5 * color5 + hue6 * color6 + hue7 * color7 + hue8 * color8 + hue9 * color9 + hue10 * color10 + hue11 * color11 + hue12 * color12 + hue13 * color13;
						gl_FragColor = vec4(brightness / brightnessScale * exposure * normalize(color), 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					lastZ13 = lastZ12;
					lastZ12 = lastZ11;
					lastZ11 = lastZ10;
					lastZ10 = lastZ9;
					lastZ9 = lastZ8;
					lastZ8 = lastZ7;
					lastZ7 = lastZ6;
					lastZ6 = lastZ5;
					lastZ5 = lastZ4;
					lastZ4 = lastZ3;
					lastZ3 = lastZ2;
					lastZ2 = lastZ1;
					lastZ1 = z;
					z = ${glslCode};
					
					
					
					brightness += exp(-max(length(z), .5));
					
					hue1 += exp(-hueMultiplier * length(z - lastZ1));
					hue2 += exp(-hueMultiplier * length(z - lastZ2));
					hue3 += exp(-hueMultiplier * length(z - lastZ3));
					hue4 += exp(-hueMultiplier * length(z - lastZ4));
					hue5 += exp(-hueMultiplier * length(z - lastZ5));
					hue6 += exp(-hueMultiplier * length(z - lastZ6));
					hue7 += exp(-hueMultiplier * length(z - lastZ7));
					hue8 += exp(-hueMultiplier * length(z - lastZ8));
					hue9 += exp(-hueMultiplier * length(z - lastZ9));
					hue10 += exp(-hueMultiplier * length(z - lastZ10));
					hue11 += exp(-hueMultiplier * length(z - lastZ11));
					hue12 += exp(-hueMultiplier * length(z - lastZ12));
					hue13 += exp(-hueMultiplier * length(z - lastZ13));
				}
			}
		`;

		this.wilsonJulia.render.shaderPrograms = [];
		this.wilsonJulia.render.loadNewShader(fragShaderSource);
		this.wilsonJulia.gl.useProgram(this.wilsonJulia.render.shaderPrograms[0]);

		this.wilsonJulia.render.initUniforms([
			"juliaMode",
			"aspectRatio",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"a",
			"b",
			"numIterations",
			"exposure",
			"brightnessScale"
		], 0);



		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);

		this.wilsonHidden.render.initUniforms([
			"juliaMode",
			"aspectRatio",
			"worldCenterX",
			"worldCenterY",
			"worldSize",
			"a",
			"b",
			"numIterations",
			"exposure",
			"brightnessScale"
		], 0);


		this.juliaMode = 0;

		this.pastBrightnessScales = [];

		this.wilson.worldWidth = 4;
		this.wilson.worldHeight = 4;
		this.wilson.worldCenterX = 0;
		this.wilson.worldCenterY = 0;

		this.zoom.init();



		// Render the inital frame.
		this.wilsonJulia.gl.uniform1f(this.wilsonJulia.uniforms["aspectRatio"][0], 1);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"][0], 1);

		this.resume();
	}



	onGrabCanvas(x, y, event)
	{
		this.pan.onGrabCanvas();
		this.zoom.onGrabCanvas();

		this.wilson.canvas.style.opacity = 1;



		if (event.type === "touchstart")
		{
			this.numTouches = event.touches.length;

			if (this.numTouches === 1)
			{
				this.showOrbit(x, y);
			}

			else
			{
				changeOpacity(this.wilson.canvas, 0);
			}
		}

		else
		{
			this.moved = 0;
			this.showOrbit(x, y);
		}
	}



	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (event.type === "mousemove" || (event.type === "touchmove" && this.numTouches >= 2))
		{
			this.pan.onDragCanvas(x, y, xDelta, yDelta);

			this.moved++;

			if (this.moved >= 10)
			{
				this.wilson.ctx.clearRect(0, 0, this.resolution, this.resolution);
			}

			this.needNewFrame = true;
		}

		else
		{
			this.showOrbit(x, y);
		}
	}



	onHoverCanvas(x, y)
	{
		this.showOrbit(x, y);

		this.moved = 0;
	}



	onReleaseCanvas(x, y, event)
	{
		this.pan.onReleaseCanvas();
		this.zoom.onReleaseCanvas();


		if ((event.type === "touchend" && this.numTouches === 1) || this.moved < 10)
		{
			this.playSound(x, y);

			setTimeout(() => this.numTouches = 0, 50);
		}

		else
		{
			changeOpacity(this.wilson.canvas, 0);
		}

		this.moved = 0;
	}



	showOrbit(x0, y0)
	{
		this.wilson.ctx.lineWidth = 2;

		this.wilson.canvas.style.opacity = 1;
		this.wilson.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilson.ctx.clearRect(0, 0, this.resolution, this.resolution);

		this.wilson.ctx.beginPath();
		let coords = this.wilson.utils.interpolate.worldToCanvas(x0, y0);
		this.wilson.ctx.moveTo(coords[1], coords[0]);

		let x = x0;
		let y = y0;
		const a = x0;
		const b = y0;

		let next = this.currentFractalFunction(x, y, a, b);

		x = 0;
		y = 0;

		for (let i = 0; i < 300; i++)
		{
			if (Math.abs(next[0]) > 10 || Math.abs(next[1]) > 10)
			{
				return;
			}

			x = next[0];
			y = next[1];

			next = this.currentFractalFunction(x, y, a, b);

			coords = this.wilson.utils.interpolate.worldToCanvas(x, y);
			this.wilson.ctx.lineTo(coords[1], coords[0]);
		}

		this.wilson.ctx.stroke();
	}



	playSound(x0, y0)
	{
		const audioContext = new AudioContext();

		const sampleRate = 44100;
		const numFrames = 44100;
		const samplesPerFrame = 12;
		const numSamples = Math.floor(numFrames / samplesPerFrame);

		let x = x0;
		let y = y0;
		const a = x0;
		const b = y0;

		let next = this.currentFractalFunction(x, y, a, b);

		x = 0;
		y = 0;

		let maxValue = 0;

		const unscaledLeftData = new Array(numSamples);
		const unscaledRightData = new Array(numSamples);



		const buffer = audioContext.createBuffer(2, numFrames, sampleRate);

		const leftData = buffer.getChannelData(0);
		const rightData = buffer.getChannelData(1);

		for (let i = 0; i < numSamples; i++)
		{
			if (Math.abs(next[0]) > 100 || Math.abs(next[1]) > 100)
			{
				return;
			}

			if (Math.abs(next[0]) > maxValue)
			{
				maxValue = Math.abs(next[0]);
			}

			if (Math.abs(next[1]) > maxValue)
			{
				maxValue = Math.abs(next[1]);
			}

			unscaledLeftData[i] = x;
			unscaledRightData[i] = y;

			x = next[0];
			y = next[1];

			next = this.currentFractalFunction(x, y, a, b);
		}



		for (let i = 0; i < numSamples; i++)
		{
			unscaledLeftData[i] /= maxValue;
			unscaledRightData[i] /= maxValue;
		}



		for (let i = 0; i < numSamples - 1; i++)
		{
			for (let j = 0; j < samplesPerFrame; j++)
			{
				const t = .5 + .5 * Math.sin(Math.PI * j / samplesPerFrame - Math.PI / 2);

				leftData[samplesPerFrame * i + j] =
					(1 - t) * (unscaledLeftData[i] / 2) + t * (unscaledLeftData[i + 1] / 2);

				rightData[samplesPerFrame * i + j] =
					(1 - t) * (unscaledRightData[i] / 2) + t * (unscaledRightData[i + 1] / 2);
			}
		}



		const source = audioContext.createBufferSource();
		source.buffer = buffer;

		const audioGainNode = audioContext.createGain();
		source.connect(audioGainNode);
		audioGainNode.connect(audioContext.destination);

		source.start(0);
		audioGainNode.gain.exponentialRampToValueAtTime(.0001, numFrames / 44100);
	}



	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
	}

	drawFrame()
	{
		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldCenterX"][0],
			this.wilson.worldCenterX
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldCenterY"][0],
			this.wilson.worldCenterY
		);
		
		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["worldSize"][0],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilsonHidden.gl.uniform1i(
			this.wilsonHidden.uniforms["numIterations"][0],
			this.numIterations
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["exposure"][0],
			1
		);

		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms["brightnessScale"][0],
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



		this.wilsonJulia.gl.uniform1f(
			this.wilsonJulia.uniforms["aspectRatio"][0],
			this.aspectRatio
		);

		this.wilsonJulia.gl.uniform1f(
			this.wilsonJulia.uniforms["worldCenterX"][0],
			this.wilson.worldCenterX
		);

		this.wilsonJulia.gl.uniform1f(
			this.wilsonJulia.uniforms["worldCenterY"][0],
			this.wilson.worldCenterY
		);

		this.wilsonJulia.gl.uniform1f(
			this.wilsonJulia.uniforms["worldSize"][0],
			Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2
		);

		this.wilsonJulia.gl.uniform1i(
			this.wilsonJulia.uniforms["numIterations"][0],
			this.numIterations
		);

		this.wilsonJulia.gl.uniform1f(
			this.wilsonJulia.uniforms["exposure"][0],
			this.exposure
		);

		this.wilsonJulia.gl.uniform1f(
			this.wilsonJulia.uniforms["brightnessScale"][0],
			brightnessScale
		);

		this.wilsonJulia.render.drawFrame();
	}



	switchFullscreen()
	{
		document.body.querySelectorAll(".wilson-applet-canvas-container")
			.forEach(element => element.style.setProperty(
				"background-color",
				"rgba(0, 0, 0, 0)",
				"important"
			));

		const exitFullScreenButtonElement =
			document.body.querySelector(".wilson-exit-fullscreen-button");

		if (exitFullScreenButtonElement)
		{
			exitFullScreenButtonElement.style.setProperty("z-index", "300", "important");
		}

		this.wilson.fullscreen.switchFullscreen();

		this.changeAspectRatio(true, [this.wilson, this.wilsonJulia]);
	}
}