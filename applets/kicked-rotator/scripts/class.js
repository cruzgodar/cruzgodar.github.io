import { getFloatGlsl, tempShader } from "../../../scripts/applets/applet.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { doubleEncodingGlsl, loadGlsl } from "/scripts/src/complexGlsl.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class KickedRotator extends AnimationFrameApplet
{
	resolution = 1000;
	computeResolution = 1000;

	wilsonUpdate;
	loadPromise;
	texture;

	imageData;
	maxBrightness = 1;
	frame;
	numIterations;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		const optionsUpdate =
		{
			shader: tempShader,

			canvasWidth: this.computeResolution,

			worldCenterX: Math.PI,
			worldCenterY: Math.PI,

			worldWidth: 2 * Math.PI,
		};

		this.wilsonUpdate = new WilsonGPU(hiddenCanvas, optionsUpdate);



		const shader = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float maxBrightness;

			vec3 hsvToRgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			void main(void)
			{
				float state = pow(
					texture2D(uTexture, (uv + vec2(1.0)) * 0.5).x / (maxBrightness * 2.25),
					0.475
				) * 2.25;
				
				gl_FragColor = vec4(hsvToRgb(vec3(
					atan(uv.x, uv.y) / 6.283,
					min(length(uv) * 1.5, 1.0),
					state))
				, 1.0);
			}
		`;

		const options = {
			shader,

			uniforms: {
				maxBrightness: 1
			},

			canvasWidth: this.resolution,

			fullscreenOptions: {
				onSwitch: this.switchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonGPU(canvas, options);

		this.loadPromise = loadGlsl();
	}



	run({ resolution = 1000, k = 0.75 })
	{
		this.resolution = resolution;
		this.computeResolution = resolution;

		this.wilsonUpdate.resizeCanvas({ width: this.computeResolution });
		this.wilsonUpdate.createFramebufferTexturePair({
			id: "update",
			textureType: "float"
		});

		this.wilsonUpdate.useFramebuffer(null);
		this.wilsonUpdate.useTexture("update");

		

		this.wilson.resizeCanvas({ width: this.resolution });
		this.wilson.createFramebufferTexturePair({
			id: "output",
			textureType: "float"
		});

		this.wilson.useFramebuffer(null);
		this.wilson.useTexture("output");



		const shaderUpdateBase = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			const float pi = ${Math.PI};

			${doubleEncodingGlsl}

			float rand(vec2 co)
			{
				co += vec2(${Math.random()}, ${Math.random()});

				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			void main(void)
			{
				vec2 state = texture2D(uTexture, (uv + vec2(1.0)) * 0.5).xy;

				float newY = state.y + ${getFloatGlsl(k)} * sin(state.x);

				state = mod(
					vec2(
						state.x + newY,
						newY
					),
					2.0 * pi
				);
			`;

		const shaderUpdateX = /* glsl */`
				${shaderUpdateBase}

				gl_FragColor = encodeFloat(state.x);
			}
		`;

		const shaderUpdateY = /* glsl */`
				${shaderUpdateBase}

				gl_FragColor = encodeFloat(state.y);
			}
		`;

		this.texture = new Float32Array(this.computeResolution * this.computeResolution * 4);
		this.imageData = new Float32Array(this.resolution * this.resolution * 4);

		this.maxBrightness = 1;
		this.wilson.setUniforms({
			maxBrightness: 1
		});

		for (let i = 0; i < this.computeResolution; i++)
		{
			for (let j = 0; j < this.computeResolution; j++)
			{
				const index = this.computeResolution * i + j;
				const worldCoordinates = this.wilsonUpdate.interpolateCanvasToWorld([i, j]);

				this.texture[4 * index] = (worldCoordinates[0] - Math.PI) / 22 + Math.PI
					+ (Math.random() - 0.5) * 0.2;

				this.texture[4 * index + 1] = worldCoordinates[1];
				this.texture[4 * index + 2] = 0;
				this.texture[4 * index + 3] = 1;
			}
		}

		this.wilsonUpdate.loadShader({
			id: "updateX",
			source: shaderUpdateX,
		});

		this.wilsonUpdate.loadShader({
			id: "updateY",
			source: shaderUpdateY,
		});

		this.frame = 0;
		this.numIterations = 100;
		
		this.resume();
	}

	prepareFrame()
	{
		this.frame++;
		this.needNewFrame = this.frame < this.numIterations;
	}

	drawFrame()
	{
		this.wilsonUpdate.setTexture({
			id: "update",
			data: this.texture
		});

		this.wilsonUpdate.useShader("updateX");
		this.wilsonUpdate.drawFrame();
		const floatsX = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		this.wilsonUpdate.useShader("updateY");
		this.wilsonUpdate.drawFrame();
		const floatsY = new Float32Array(this.wilsonUpdate.readPixels().buffer);

		for (let i = 0; i < this.computeResolution; i++)
		{
			for (let j = 0; j < this.computeResolution; j++)
			{
				const index = this.computeResolution * i + j;
				this.texture[4 * index] = floatsX[index];
				this.texture[4 * index + 1] = floatsY[index];

				const row = Math.round(
					(
						(floatsY[index] - this.wilsonUpdate.worldCenterY)
							/ this.wilsonUpdate.worldHeight + .5
					) * this.resolution);

				const col = Math.round(
					(
						(floatsX[index] - this.wilsonUpdate.worldCenterX)
							/ this.wilsonUpdate.worldWidth + .5
					) * this.resolution
				);

				if (
					row >= 0
					&& row < this.resolution
					&& col >= 0
					&& col < this.resolution
				) {
					const newIndex = row * this.resolution + col;

					this.imageData[4 * newIndex]++;
					this.maxBrightness = Math.max(
						this.maxBrightness,
						this.imageData[4 * newIndex]
					);
				}
			}
		}

		this.wilson.setTexture({
			id: "output",
			data: this.imageData
		});

		const maxBrightnessAdjust = Math.min(this.frame / 15, 1);

		this.wilson.setUniforms({
			maxBrightness: this.maxBrightness / maxBrightnessAdjust
		});

		this.wilson.drawFrame();
	}

	switchFullscreen()
	{
		this.resume();
	}

	async beforeSwitchFullscreen()
	{
		this.pause();

		await new Promise(resolve => setTimeout(resolve, 33));
	}
}