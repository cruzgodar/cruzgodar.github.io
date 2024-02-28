import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { Wilson } from "/scripts/wilson.js";

export class GameOfLife extends AnimationFrameApplet
{
	wilsonUpscale = null;

	gridSize = 100;
	resolution = 1000;

	lastPixelData = null;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		// Draws a completely black scene into a framebuffer that we can then edit.
		const fragShaderSourceInit = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			void main(void)
			{
				if (abs(uv.y) < 0.01)
				{
					gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
					return;
				}

				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
			}
		`;


		// Iterates the game one step.
		const fragShaderSourceUpdate = /* glsl */`
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

				float state = texture2D(uTexture, center).y;

				float surroundingState = (
					texture2D(uTexture, center + vec2(step, 0.0)).y
					+ texture2D(uTexture, center + vec2(-step, 0.0)).y
					+ texture2D(uTexture, center + vec2(0.0, step)).y
					+ texture2D(uTexture, center + vec2(0.0, -step)).y
					+ texture2D(uTexture, center + vec2(step, step)).y
					+ texture2D(uTexture, center + vec2(step, -step)).y
					+ texture2D(uTexture, center + vec2(-step, step)).y
					+ texture2D(uTexture, center + vec2(-step, -step)).y
				);

				if (state < 0.5)
				{
					if (surroundingState >= 2.5 && surroundingState <= 3.5)
					{
						gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
						return;
					}
					
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}

				if (surroundingState <= 1.5 || surroundingState >= 3.5)
				{
					gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
					return;
				}

				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				return;
			}
		`;

		const optionsHidden =
		{
			renderer: "gpu",

			shader: fragShaderSourceInit,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution
		};

		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);

		this.wilsonHidden.render.loadNewShader(fragShaderSourceUpdate);

		this.wilsonHidden.render.initUniforms(["step"], 1);

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
			
			void main(void)
			{
				gl_FragColor = texture2D(uTexture, (uv + (worldCenter + vec2(1.0, 1.0)) / worldRadius) * worldRadius / 2.0);
			}
		`;

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSourceUpscale,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,



			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",



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

		this.wilson.render.initUniforms(["worldCenter", "worldRadius"]);
		this.zoom.init();

		this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);
	}



	run({ resolution = 1000, gridSize = 100 })
	{
		this.resolution = resolution;
		this.gridSize = gridSize;

		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);

		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[1]);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["step"][1], 1 / this.gridSize);



		this.wilsonHidden.changeCanvasSize(this.gridSize, this.gridSize);
		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[0].texture
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



		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);

		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[0].texture
		);

		this.wilsonHidden.gl.bindFramebuffer(
			this.wilsonHidden.gl.FRAMEBUFFER,
			this.wilsonHidden.render.framebuffers[0].framebuffer
		);

		this.wilsonHidden.render.drawFrame();

		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[1]);



		this.resume();
	}



	prepareFrame(timeElapsed)
	{
		this.pan.update(timeElapsed);
		this.zoom.update(timeElapsed);
	}

	drawFrame()
	{
		this.wilsonHidden.gl.bindFramebuffer(
			this.wilsonHidden.gl.FRAMEBUFFER,
			this.wilsonHidden.render.framebuffers[1].framebuffer
		);

		this.wilsonHidden.render.drawFrame();



		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[1].texture
		);

		this.wilsonHidden.gl.bindFramebuffer(
			this.wilsonHidden.gl.FRAMEBUFFER,
			this.wilsonHidden.render.framebuffers[0].framebuffer
		);

		this.wilsonHidden.render.drawFrame();

		this.wilsonHidden.gl.bindTexture(
			this.wilsonHidden.gl.TEXTURE_2D,
			this.wilsonHidden.render.framebuffers[0].texture
		);

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

		this.wilson.gl.uniform2f(
			this.wilson.uniforms.worldCenter,
			this.wilson.worldCenterX,
			this.wilson.worldCenterY
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.worldRadius,
			this.wilson.worldWidth / 2
		);

		this.wilson.render.drawFrame();

		setTimeout(() => this.needNewFrame = true, 100);
	}
}