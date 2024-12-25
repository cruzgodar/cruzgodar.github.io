import { tempShader } from "../../../scripts/applets/applet.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { doubleEncodingGlsl, loadGlsl } from "/scripts/src/complexGlsl.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class BarnsleyFern extends AnimationFrameApplet
{
	resolution = 1000;
	computeResolution = 1000;
	A1 = [[0, 0], [0, .16]];
	A4 = [[-.15, .28], [.26, .24]];
	b2 = [0, 1.6];

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

			worldWidth: 12,
			worldCenterX: 0,
			worldCenterY: 5,
		};

		this.wilsonUpdate = new WilsonGPU(hiddenCanvas, optionsUpdate);



		const shader = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float maxBrightness;
			
			void main(void)
			{
				float state = texture2D(uTexture, (uv + vec2(1.0)) * 0.5).x / maxBrightness * 25.0;
				
				gl_FragColor = vec4(0.0, state, 0.0, 1.0);
			}
		`;

		const options = {
			shader,

			uniforms: {
				maxBrightness: 1
			},

			canvasWidth: this.resolution,

			worldWidth: 12,
			worldCenterX: 0,
			worldCenterY: 5,

			draggableOptions: {
				draggables: {
					tip: [2.6556, 9.95851]
				},
				callbacks: {
					drag: this.onDragDraggable.bind(this),
					release: this.onReleaseDraggable.bind(this)
				}
			},

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



	run({ resolution = 1000 })
	{
		this.resolution = resolution;
		this.computeResolution = Math.round(resolution / 4);

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

			uniform mat2 A1;
			const mat2 A2 = mat2(.85, -.04, .04, .85);
			const mat2 A3 = mat2(.2, .23, -.26, .22);
			uniform mat2 A4;

			uniform vec2 b2;

			${doubleEncodingGlsl}

			float rand(vec2 co)
			{
				co += vec2(${Math.random()}, ${Math.random()});
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			void main(void)
			{
				vec2 state = texture2D(uTexture, (uv + vec2(1.0)) * 0.5).xy;

				float r = rand(uv + state);

				if (r < .01)
				{
					state = A1 * state;
				}

				else if (r < .86)
				{
					state = A2 * state + b2;
				}

				else if (r < .93)
				{
					state = A3 * state + b2 * 0.75;
				}

				else
				{
					state = A4 * state + b2 * 0.25;
				}
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

				this.texture[4 * index] = worldCoordinates[0];
				this.texture[4 * index + 1] = worldCoordinates[1];
				this.texture[4 * index + 2] = 0;
				this.texture[4 * index + 3] = 1;
			}
		}

		this.wilsonUpdate.loadShader({
			id: "updateX",
			source: shaderUpdateX,
			uniforms: {
				A1: this.A1,
				A4: this.A4,
				b2: this.b2
			}
		});

		this.wilsonUpdate.loadShader({
			id: "updateY",
			source: shaderUpdateY,
			uniforms: {
				A1: this.A1,
				A4: this.A4,
				b2: this.b2
			}
		});

		this.frame = 0;
		this.numIterations = 150;
		
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

		const maxBrightnessAdjust = this.resolution / 1000 * Math.min(this.frame / 25, 1);
		this.wilson.setUniforms({
			maxBrightness: this.maxBrightness / maxBrightnessAdjust
		});

		this.wilson.drawFrame();
	}

	onDragDraggable({ x, y })
	{
		this.animationPaused = true;
		this.needNewFrame = false;

		// Apply an inverse transformation I computed manually to convert the tip of the fern
		// back to the first stem point.

		this.b2[0] = .15 * x - 0.04 * y;
		this.b2[1] = .04 * x + 0.15 * y;

		const theta = Math.atan2(-this.b2[0], this.b2[1]);
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		
		// An affine transformation that points toward the draggable.
		this.A1 = [[0, -.16 * s], [0, .16 * c]];

		const c2 = Math.cos(2 * theta);
		// The default transformation for this one is orientation-reversing, so we
		// rotate to vertical, apply the usual one, then rotate back.
		this.A4 = [
			[
				0.045 - 0.195 * c2 - 0.54 * c * s,
				0.01 + 0.27 * c2 - 0.39 * c * s,
			],
			[
				-0.01 + 0.27 * c2 - 0.39 * c * s,
				0.045 + 0.195 * c2 + 0.54 * c * s
			]
		];

		this.wilsonUpdate.setUniforms({
			A1: this.A1,
			A4: this.A4,
			b2: this.b2
		}, "updateX");

		this.wilsonUpdate.setUniforms({
			A1: this.A1,
			A4: this.A4,
			b2: this.b2
		}, "updateY");
	}

	onReleaseDraggable()
	{
		this.run({ resolution: this.resolution });
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