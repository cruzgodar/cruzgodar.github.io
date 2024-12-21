import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import { $$ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonCPU, WilsonGPU } from "/scripts/wilson.js";

export class FractalSounds extends AnimationFrameApplet
{
	loadPromise;

	wilsonHidden;
	wilsonJulia;

	juliaMode = 0;

	aspectRatio = 1;

	numIterations = 200;

	zoomLevel = 0;

	pastBrightnessScales = [];

	resolution = 500;
	resolutionHidden = 100;

	needToClear = false;

	fixedPointX = 0;
	fixedPointY = 0;

	moved = 0;

	lastX = 0;
	lastY = 0;



	constructor({ canvas, lineDrawerCanvas })
	{
		super(canvas);

		const optionsJulia =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			reduceMotion: siteSettings.reduceMotion,

			fullscreenOptions: {
				fillScreen: true,
				animate: false,
				closeWithEscape: false,
			}
		};

		this.wilsonJulia = new WilsonGPU(canvas, optionsJulia);



		const hiddenCanvas = this.createHiddenCanvas();

		const optionsHidden =
		{
			shader: tempShader,

			canvasWidth: this.resolutionHidden,
		};

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, optionsHidden);



		const options =
		{
			canvasWidth: 1500,

			worldWidth: 4,

			minWorldX: -3,
			maxWorldX: 3,
			minWorldY: -3,
			maxWorldY: 3,

			reduceMotion: siteSettings.reduceMotion,

			onResizeCanvas: () => this.needNewFrame = true,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
				callbacks: {
					mousemove: this.onHoverCanvas.bind(this),
					mousedown: this.onGrabCanvas.bind(this),
					touchstart: this.onGrabCanvas.bind(this),
					mousedrag: this.onDragCanvas.bind(this),
					touchmove: this.onDragCanvas.bind(this),
					mouseup: this.onReleaseCanvas.bind(this),
					touchend: this.onReleaseCanvas.bind(this),
					wheel: this.onWheelCanvas.bind(this),
				}
			},

			fullscreenOptions: {
				fillScreen: true,
				onSwitch: this.onSwitchFullscreen.bind(this),
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonCPU(lineDrawerCanvas, options);
		this.wilsonForFullscreen = this.wilson;
		this.addHoverEventOnFullscreenButton();

		const elements = $$(".WILSON_fullscreen-container");

		elements[0].style.setProperty("z-index", 200, "important");
		elements[1].style.setProperty("z-index", 300, "important");

		this.wilson.ctx.lineWidth = 40;

		this.loadPromise = loadGlsl();
	}



	run({
		glslCode,
		jsCode,
		resolution,
		numIterations
	}) {
		this.currentFractalFunction = jsCode;

		this.resolution = resolution;
		this.numIterations = numIterations;

		const shader = /* glsl */`
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 worldSize;
			uniform vec2 worldCenter;
			
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
				vec2 z = uv * worldSize * 0.5 + worldCenter;
				
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
						vec3 color = hue1 * color1
							+ hue2 * color2
							+ hue3 * color3
							+ hue4 * color4
							+ hue5 * color5
							+ hue6 * color6
							+ hue7 * color7
							+ hue8 * color8
							+ hue9 * color9
							+ hue10 * color10
							+ hue11 * color11
							+ hue12 * color12
							+ hue13 * color13;
						
						gl_FragColor = vec4(brightness / brightnessScale * normalize(color), 1.0);
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

		this.wilsonJulia.loadShader({
			source: shader,
			uniforms: {
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				numIterations: this.numIterations,
				brightnessScale: 1,
			},
		});

		this.wilsonHidden.loadShader({
			source: shader,
			uniforms: {
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				numIterations: this.numIterations,
				brightnessScale: 1,
			},
		});

		this.juliaMode = 0;

		this.pastBrightnessScales = [];

		this.wilson.resizeWorld({
			width: 4,
			height: 4,
			centerX: 0,
			centerY: 0
		});

		this.resume();
	}



	onHoverCanvas({ x, y })
	{
		this.showOrbit(x, y);

		this.moved = 0;
	}

	onGrabCanvas({ x, y, event })
	{
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
				changeOpacity({ element: this.wilson.canvas, opacity: 0 });
			}
		}

		else
		{
			this.moved = 0;
			this.showOrbit(x, y);
		}
	}

	onDragCanvas({ x, y })
	{
		this.moved++;

		if (this.moved >= 10)
		{
			changeOpacity({ element: this.wilson.canvas, opacity: 0 });
		}

		this.showOrbit(x, y);
	}

	onReleaseCanvas({ x, y, event })
	{
		if (this.moved < 10)
		{
			this.playSound(x, y);

			setTimeout(() => this.numTouches = 0, 50);
		}

		if (event.type === "touchend")
		{
			setTimeout(() =>
			{
				changeOpacity({ element: this.wilson.canvas, opacity: 0 });
			}, 150);
		}

		this.moved = 0;
	}

	onWheelCanvas({ x, y })
	{
		this.showOrbit(x, y);
	}


	showOrbit(x0, y0)
	{
		this.wilson.ctx.lineWidth = 2;

		this.wilson.canvas.style.opacity = 1;
		this.wilson.ctx.strokeStyle = convertColor(255, 255, 255);
		this.wilson.ctx.clearRect(0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);

		this.wilson.ctx.beginPath();
		const coords = this.wilson.interpolateWorldToCanvas([x0, y0]);
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

			const coords = this.wilson.interpolateWorldToCanvas([x, y]);
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



	drawFrame()
	{
		const zoomLevel = -Math.log2(this.wilson.worldWidth) + 3;

		this.wilsonHidden.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			numIterations: this.numIterations,
			brightnessScale: 20,
		});

		this.wilsonHidden.drawFrame();



		const pixelData = this.wilsonHidden.readPixels();

		const brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);

		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}

		brightnesses.sort((a, b) => a - b);

		const brightnessScale = (
			brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)]
			+ brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]
		) / 20 + zoomLevel * 2;

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



		this.wilsonJulia.setUniforms({
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			numIterations: this.numIterations,
			brightnessScale: averageBrightnessScale
		});

		this.wilsonJulia.drawFrame();
	}



	onSwitchFullscreen(isFullscreen)
	{
		document.body.querySelectorAll(".WILSON_fullscreen-container")
			.forEach(element => element.style.setProperty(
				"background-color",
				"rgba(0, 0, 0, 0)",
				"important"
			));


		if (isFullscreen)
		{
			this.wilsonJulia.enterFullscreen();
		}

		else
		{
			this.wilsonJulia.exitFullscreen();
		}
	}

	downloadFrame(filename)
	{
		this.wilsonJulia.downloadFrame(filename);
	}
}