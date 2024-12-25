import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class GameOfLife extends AnimationFrameApplet
{
	wilsonUpscale;

	gridSize = 100;
	resolution = 1000;

	framesPerUpdate = 10;
	updatesPerFrame = 1;
	frame = 0;
	onTorus = false;

	currentFramebuffer = "0";

	pauseUpdating = true;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		// Writes out the current state without iterating it.
		const shaderNoUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
					return;
				}

				vec4 thisPixel = texture2D(uTexture, center);

				float state = thisPixel.z;

				gl_FragColor = vec4(0.0, state, state, 1.0);
			}
		`;

		// Iterates the game one step.
		const shaderUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float stepSize;
			uniform int onTorus;

			const float glowChangeSpeed = 0.15;
			
			vec2 getModdedPos(vec2 xy)
			{
				return mod(xy - vec2(stepSize), 1.0 - 2.0 * stepSize) + vec2(stepSize);
			}
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
					return;
				}

				vec4 thisPixel = texture2D(uTexture, center);

				float state = thisPixel.z;

				float surroundingState;

				if (onTorus != 0)
				{
					surroundingState = (
						texture2D(uTexture, getModdedPos(center + vec2(stepSize, 0.0))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(-stepSize, 0.0))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(0.0, stepSize))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(0.0, -stepSize))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(stepSize, stepSize))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(stepSize, -stepSize))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(-stepSize, stepSize))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(-stepSize, -stepSize))).z
					);
				}

				else
				{
					surroundingState = (
						texture2D(uTexture, center + vec2(stepSize, 0.0)).z
						+ texture2D(uTexture, center + vec2(-stepSize, 0.0)).z
						+ texture2D(uTexture, center + vec2(0.0, stepSize)).z
						+ texture2D(uTexture, center + vec2(0.0, -stepSize)).z
						+ texture2D(uTexture, center + vec2(stepSize, stepSize)).z
						+ texture2D(uTexture, center + vec2(stepSize, -stepSize)).z
						+ texture2D(uTexture, center + vec2(-stepSize, stepSize)).z
						+ texture2D(uTexture, center + vec2(-stepSize, -stepSize)).z
					);
				}

				if (state < 0.5)
				{
					if (surroundingState >= 2.5 && surroundingState <= 3.5)
					{
						// Becoming alive
						gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
						return;
					}
					
					// Staying dead
					gl_FragColor = vec4(max(thisPixel.x - glowChangeSpeed, 0.0), 0.0, 0.0, 1.0);
					return;
				}

				if (surroundingState <= 1.5 || surroundingState >= 3.5)
				{
					// Becoming dead
					gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
					return;
				}

				// Staying alive
				gl_FragColor = vec4(0.0, max(thisPixel.y - glowChangeSpeed, 0.0), 1.0, 1.0);
				return;
			}
		`;

		const optionsHidden =
		{
			shaders: {
				noUpdate: shaderNoUpdate,
				update: shaderUpdate
			},

			uniforms: {
				noUpdate: {
					stepSize: 1 / this.gridSize,
				},
				update: {
					stepSize: 1 / this.gridSize,
					onTorus: this.onTorus ? 1 : 0
				}
			},

			canvasWidth: this.resolution,
		};

		this.wilsonHidden = new WilsonGPU(hiddenCanvas, optionsHidden);


		
		const shaderUpscale = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			uniform vec2 worldCenter;
			uniform vec2 worldSize;

			const vec4 aliveColor = vec4(1.0, 1.0, 1.0, 1.0);
			const vec4 growingColor = vec4(0.5, 0.0, 1.0, 1.0);
			const vec4 dyingColor = vec4(0.0, 0.0, 1.0, 1.0);
			const vec4 deadColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			void main(void)
			{
				vec2 xy = (uv * worldSize / 2.0 + worldCenter) + vec2(0.5, 0.5);

				if (max(xy.x, xy.y) >= 1.0 || min(xy.x, xy.y) <= 0.0)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}

				gl_FragColor = texture2D(uTexture, xy);

				if (gl_FragColor.w == 0.0)
				{
					gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
					return;
				}

				// Convert red to blue and green to purple.
				if (gl_FragColor.z > 0.5)
				{
					gl_FragColor = mix(aliveColor, growingColor, gl_FragColor.y);
					return;
				}

				gl_FragColor = mix(deadColor, dyingColor, gl_FragColor.x);
				return;
			}
		`;

		const options =
		{
			shader: shaderUpscale,

			uniforms: {
				worldCenter: [0, 0],
				worldSize: [1.2, 1.2],
			},

			canvasWidth: this.resolution,

			worldWidth: 1.2,
			minWorldX: -0.6,
			maxWorldX: 0.6,
			minWorldY: -0.6,
			maxWorldY: 0.6,
			minWorldWidth: 0.05,
			minWorldHeight: 0.05,

			interactionOptions: {
				useForPanAndZoom: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			fullscreenOptions: {
				fillScreen: true,
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			}
		};

		this.wilson = new WilsonGPU(canvas, options);
	}



	// Loads a state paused and draws just the initial frame.
	run({
		resolution = 1000,
		gridSize = 100,
		state,
		pauseUpdating = true,
		onTorus = this.onTorus
	}) {
		this.gridSize = gridSize;
		this.resolution = Math.max(resolution, this.gridSize * 2);
		this.onTorus = onTorus;

		this.pauseUpdating = pauseUpdating;

		this.wilsonHidden.setUniforms({
			stepSize: 1 / this.gridSize
		}, "noUpdate");

		this.wilsonHidden.setUniforms({
			stepSize: 1 / this.gridSize,
			onTorus: this.onTorus ? 1 : 0
		}, "update");

		this.wilsonHidden.useShader(this.pauseUpdating ? "noUpdate" : "update");

		this.wilsonHidden.resizeCanvas({ width: this.gridSize });
		this.wilson.resizeCanvas({ width: this.resolution });

		this.wilson.createFramebufferTexturePair({
			id: "draw",
			width: this.gridSize,
			height: this.gridSize,
			textureType: "unsignedByte"
		});

		this.wilsonHidden.createFramebufferTexturePair({
			id: "0",
			textureType: "unsignedByte"
		});

		this.wilsonHidden.createFramebufferTexturePair({
			id: "1",
			textureType: "unsignedByte"
		});

		this.wilsonHidden.useTexture("0");
		this.wilsonHidden.useFramebuffer(null);

		this.wilsonHidden.setTexture({
			id: "1",
			data: null
		});

		this.wilsonHidden.useTexture("0");

		

		this.loadState(state);



		this.frame = 0;

		this.currentFramebuffer = "1";

		this.resume();
	}



	drawFrame()
	{
		if (this.frame % this.framesPerUpdate === 0)
		{
			this.frame = 0;
			this.updateGame();
		}

		this.wilson.setUniforms({
			worldCenter: [this.wilson.worldCenterX, this.wilson.worldCenterY],
			worldSize: [this.wilson.worldWidth, this.wilson.worldHeight]
		});

		this.wilson.drawFrame();

		this.frame++;
		this.needNewFrame = true;
	}

	updateGame()
	{
		if (this.animationPaused)
		{
			return;
		}

		for (let i = 0; i < this.updatesPerFrame * !this.pauseUpdating; i++)
		{
			this.wilsonHidden.useFramebuffer(this.currentFramebuffer);
			this.wilsonHidden.drawFrame();

			this.wilsonHidden.useTexture(this.currentFramebuffer);
			this.currentFramebuffer = this.currentFramebuffer === "0" ? "1" : "0";
		}

		this.wilsonHidden.useFramebuffer(null);
		this.wilsonHidden.drawFrame();

		this.wilson.setTexture({
			id: "draw",
			data: this.wilsonHidden.readPixels()
		});

		this.wilson.useFramebuffer(null);
	}

	resumeUpdating()
	{
		this.pauseUpdating = false;

		this.wilsonHidden.useShader("update");
		this.wilsonHidden.setUniforms({
			stepSize: 1 / this.gridSize,
		}, "update");
	}



	// state is a Uint8Array of 0s and 1s, and we'll create the actual
	// texture data by quadrupling every one (and multiplying by 255).
	loadState(state)
	{
		const stateSize = Math.sqrt(state.length);

		if (stateSize !== this.gridSize)
		{
			console.error("Invalid state size!");
			return;
		}

		const pixelData = new Uint8Array(state.length * 4);

		for (let i = 0; i < state.length; i++)
		{
			pixelData[4 * i] = 0;
			pixelData[4 * i + 1] = state[i] * 255;
			pixelData[4 * i + 2] = state[i] * 255;
			pixelData[4 * i + 3] = state[i] * 255;
		}

		this.wilsonHidden.setTexture({
			id: "0",
			data: pixelData
		});

		this.wilsonHidden.setTexture({
			id: "1",
			data: pixelData
		});
	}
}