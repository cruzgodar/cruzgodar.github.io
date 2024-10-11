import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class GameOfLife extends AnimationFrameApplet
{
	wilsonUpscale;

	gridSize = 100;
	resolution = 1000;

	framesPerUpdate = 10;
	updatesPerFrame = 1;
	frame = 0;
	onTorus = false;

	currentFramebuffer = 0;

	pauseUpdating = true;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		// Writes out the current state without iterating it.
		const fragShaderSourceNoUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
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
		const fragShaderSourceUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float step;
			uniform int torus;

			const float glowChangeSpeed = 0.15;
			
			vec2 getModdedPos(vec2 xy)
			{
				return mod(xy - vec2(step), 1.0 - 2.0 * step) + vec2(step);
			}
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
					return;
				}

				vec4 thisPixel = texture2D(uTexture, center);

				float state = thisPixel.z;

				float surroundingState;

				if (torus != 0)
				{
					surroundingState = (
						texture2D(uTexture, getModdedPos(center + vec2(step, 0.0))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(-step, 0.0))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(0.0, step))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(0.0, -step))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(step, step))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(step, -step))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(-step, step))).z
						+ texture2D(uTexture, getModdedPos(center + vec2(-step, -step))).z
					);
				}

				else
				{
					surroundingState = (
						texture2D(uTexture, center + vec2(step, 0.0)).z
						+ texture2D(uTexture, center + vec2(-step, 0.0)).z
						+ texture2D(uTexture, center + vec2(0.0, step)).z
						+ texture2D(uTexture, center + vec2(0.0, -step)).z
						+ texture2D(uTexture, center + vec2(step, step)).z
						+ texture2D(uTexture, center + vec2(step, -step)).z
						+ texture2D(uTexture, center + vec2(-step, step)).z
						+ texture2D(uTexture, center + vec2(-step, -step)).z
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
			renderer: "gpu",

			shader: fragShaderSourceNoUpdate,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution
		};

		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);

		this.wilsonHidden.render.loadNewShader(fragShaderSourceUpdate);

		this.wilsonHidden.render.initUniforms(["step"], 0);
		this.wilsonHidden.render.initUniforms(["step", "torus"], 1);

		this.wilsonHidden.render.createFramebufferTexturePair(this.wilsonHidden.gl.UNSIGNED_BYTE);
		this.wilsonHidden.render.createFramebufferTexturePair(this.wilsonHidden.gl.UNSIGNED_BYTE);

		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[0].texture
		);

		this.wilsonHidden.gl.bindFramebuffer(this.wilsonHidden.gl.FRAMEBUFFER, null);


		
		const fragShaderSourceUpscale = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			uniform vec2 worldCenter;
			uniform float worldRadius;

			uniform float aspectRatio;

			const vec4 aliveColor = vec4(1.0, 1.0, 1.0, 1.0);
			const vec4 growingColor = vec4(0.5, 0.0, 1.0, 1.0);
			const vec4 dyingColor = vec4(0.0, 0.0, 1.0, 1.0);
			const vec4 deadColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			void main(void)
			{
				vec2 aspectRatio = vec2(max(aspectRatio, 1.0), max(1.0 / aspectRatio, 1.0));
				
				vec2 xy = (uv * aspectRatio * worldRadius + worldCenter) / 2.0 + vec2(0.5, 0.5);

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
			renderer: "gpu",

			shader: fragShaderSourceUpscale,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			worldWidth: 2.2,
			worldHeight: 2.2,

			useFullscreen: true,
			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: () => this.changeAspectRatio(true),



			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),

			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms([
			"worldCenter",
			"worldRadius",
			"aspectRatio",
		]);

		this.zoom.init();

		this.zoom.minLevel = -5;

		this.pan.setBounds({
			minX: -1.1,
			maxX: 1.1,
			minY: -1.1,
			maxY: 1.1,
		});

		this.changeAspectRatio(true);

		this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);

		addTemporaryListener({
			object: window,
			event: "resize",
			callback: () => this.changeAspectRatio(true)
		});
	}



	// Loads a state paused and draws just the initial frame.
	run({
		resolution = 1000,
		gridSize = 100,
		state,
		pauseUpdating = true,
		onTorus = this.onTorus
	}) {
		this.resolution = resolution;
		this.gridSize = gridSize;
		this.onTorus = onTorus;

		this.pauseUpdating = pauseUpdating;



		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[1]);

		this.wilsonHidden.gl.uniform1i(
			this.wilsonHidden.uniforms.torus[1],
			this.onTorus ? 1 : 0
		);



		this.wilsonHidden.gl.useProgram(
			this.wilsonHidden.render.shaderPrograms[this.pauseUpdating ? 0 : 1]
		);
		
		this.wilsonHidden.gl.uniform1f(
			this.wilsonHidden.uniforms.step[this.pauseUpdating ? 0 : 1],
			1 / this.gridSize
		);



		this.wilsonHidden.changeCanvasSize(this.gridSize, this.gridSize);
		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[1].texture
		);

		this.wilsonHidden.gl.texImage2D(
			this.wilsonHidden.gl.TEXTURE_2D,
			0,
			this.wilsonHidden.gl.RGBA,
			this.wilsonHidden.canvasWidth,
			this.wilsonHidden.canvasHeight,
			0,
			this.wilsonHidden.gl.RGBA,
			this.wilsonHidden.gl.UNSIGNED_BYTE,
			null
		);

		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[0].texture
		);

		this.loadState(state);



		this.frame = 0;

		this.currentFramebuffer = 1;

		this.resume();
	}



	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
	}

	drawFrame()
	{
		if (this.frame % this.framesPerUpdate === 0)
		{
			this.frame = 0;
			this.updateGame();
		}

		this.wilson.gl.uniform2f(
			this.wilson.uniforms.worldCenter,
			this.wilson.worldCenterX,
			this.wilson.worldCenterY
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.worldRadius,
			Math.min(this.wilson.worldWidth, this.wilson.worldHeight) / 2
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.aspectRatio,
			this.aspectRatio
		);

		this.wilson.render.drawFrame();

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
			this.wilsonHidden.gl.bindFramebuffer(
				this.wilsonHidden.gl.FRAMEBUFFER,
				this.wilsonHidden.render.framebuffers[this.currentFramebuffer].framebuffer
			);

			this.wilsonHidden.render.drawFrame();

			this.wilsonHidden.gl.bindTexture(
				this.wilsonHidden.gl.TEXTURE_2D,
				this.wilsonHidden.render.framebuffers[this.currentFramebuffer].texture
			);

			this.currentFramebuffer = 1 - this.currentFramebuffer;
		}

		this.wilsonHidden.gl.bindFramebuffer(this.wilsonHidden.gl.FRAMEBUFFER, null);

		this.wilsonHidden.render.drawFrame();



		const pixelData = this.wilsonHidden.render.getPixelData();

		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.wilsonHidden.canvasWidth,
			this.wilsonHidden.canvasHeight,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.UNSIGNED_BYTE,
			pixelData
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
	}

	resumeUpdating()
	{
		this.pauseUpdating = false;

		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[1]);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms.step[1], 1 / this.gridSize);
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

		this.wilsonHidden.gl.texImage2D(
			this.wilsonHidden.gl.TEXTURE_2D,
			0,
			this.wilsonHidden.gl.RGBA,
			this.wilsonHidden.canvasWidth,
			this.wilsonHidden.canvasHeight,
			0,
			this.wilsonHidden.gl.RGBA,
			this.wilsonHidden.gl.UNSIGNED_BYTE,
			pixelData
		);
	}

	changeResolution(newResolution)
	{
		this.resolution = newResolution;
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
	}
}