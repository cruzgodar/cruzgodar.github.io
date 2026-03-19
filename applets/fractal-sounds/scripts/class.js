import { getGlslBundle, loadGlsl } from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import { $$ } from "/scripts/src/main.js";
import { sleep } from "/scripts/src/utils.js";
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

	audioNodes = [];



	constructor({ canvas, lineDrawerCanvas })
	{
		super(canvas);

		const optionsJulia =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			useResetButton: true,
			resetButtonIconPath: "/graphics/general-icons/reset.png",
			onReset: () => this.wilson.reset(),

			fullscreenOptions: {
				onSwitch: this.onSwitchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},

			verbose: window.DEBUG,
		};

		this.wilsonJulia = new WilsonGPU(canvas, optionsJulia);



		const hiddenCanvas = this.createHiddenCanvas();

		const optionsHidden =
		{
			shader: tempShader,

			canvasWidth: this.resolutionHidden,

			verbose: window.DEBUG,
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
				animate: false,
				closeWithEscape: false,
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonCPU(lineDrawerCanvas, options);
		this.wilsonForFullscreen = this.wilsonJulia;

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

		const numHarmonics = 8;

		const shader = /* glsl */`
			precision highp float;

			varying vec2 uv;

			uniform vec2 worldSize;
			uniform vec2 worldCenter;

			uniform int numIterations;
			uniform float brightnessScale;

			const int numHarmonics = ${numHarmonics};
			const float hueMultiplier = 100.0;



			${getGlslBundle(glslCode)}



			vec3 hsvToRgb(vec3 c)
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



				vec2 lastZ[numHarmonics];
				vec3 harmonicColors[numHarmonics];

				for (int i = 0; i < numHarmonics; i++)
				{
					lastZ[i] = vec2(0.0, 0.0);
					harmonicColors[i] = hsvToRgb(vec3(
						float(i) / float(numHarmonics), 1.0, 1.0
					));
				}

				vec3 color = vec3(0.0, 0.0, 0.0);



				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						gl_FragColor = vec4(
							brightness / brightnessScale * normalize(color), 1.0
						);
						return;
					}

					if (length(z) >= 10.0)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}

					for (int i = numHarmonics - 1; i >= 1; i--)
					{
						lastZ[i] = lastZ[i - 1];
					}
					lastZ[0] = z;

					z = ${glslCode};



					brightness += exp(-max(length(z), .5));

					for (int k = 0; k < numHarmonics; k++)
					{
						color += exp(-hueMultiplier * length(z - lastZ[k]))
							* harmonicColors[k];
					}
				}
			}
		`;

		this.wilsonJulia.loadShader({
			shader,
			uniforms: {
				worldSize: [this.wilson.worldWidth, this.wilson.worldHeight],
				worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
				numIterations: this.numIterations,
				brightnessScale: 1,
			},
		});

		this.wilsonHidden.loadShader({
			shader,
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
		this.wilsonJulia.showResetButton();

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
		this.wilsonJulia.showResetButton();

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

		const audioNode = [audioContext, source, audioGainNode];
		this.audioNodes.push(audioNode);

		source.onended = () =>
		{
			const index = this.audioNodes.indexOf(audioNode);

			if (index !== -1)
			{
				this.audioNodes.splice(index, 1);
			}

			audioContext.close();
		};

		source.start(0);
		audioGainNode.gain.exponentialRampToValueAtTime(
			.0001,
			audioContext.currentTime + numFrames / sampleRate
		);
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
		if (isFullscreen)
		{
			this.wilson.enterFullscreen();

			const containers = document.querySelectorAll(".WILSON_canvas-container");

			const buttonContainers = document.querySelectorAll(".WILSON_button-container");

			containers[0].appendChild(buttonContainers[2]);
		}

		else
		{
			this.wilson.exitFullscreen();
		}

		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.pause();

		await sleep(33);
	}

	destroyAudioNodes()
	{
		for (const [audioContext, , audioGainNode] of this.audioNodes)
		{
			audioGainNode.gain.linearRampToValueAtTime(
				0.0001,
				audioContext.currentTime + 0.05
			);

			setTimeout(() => audioContext.close(), 50);
		}

		this.audioNodes = [];
	}

	pause()
	{
		for (const [audioContext] of this.audioNodes)
		{
			audioContext.suspend();
		}

		super.pause();
	}

	resume()
	{
		super.resume();

		for (const [audioContext] of this.audioNodes)
		{
			audioContext.resume();
		}
	}

	destroy()
	{
		this.destroyAudioNodes();

		super.destroy();
	}

	downloadHighResFrame(filename, resolution)
	{
		this.wilsonJulia.downloadHighResFrame(filename, resolution);
	}
}