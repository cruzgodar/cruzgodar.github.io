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
				if (length(uv) < 0.5)
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

				float state = texture2D(uTexture, center).x;

				float surroundingState = (
					texture2D(uTexture, center + vec2(step, 0.0)).x
					+ texture2D(uTexture, center + vec2(-step, 0.0)).x
					+ texture2D(uTexture, center + vec2(0.0, step)).x
					+ texture2D(uTexture, center + vec2(0.0, -step)).x
					+ texture2D(uTexture, center + vec2(step, step)).x
					+ texture2D(uTexture, center + vec2(step, -step)).x
					+ texture2D(uTexture, center + vec2(-step, step)).x
					+ texture2D(uTexture, center + vec2(-step, -step)).x
				);
				gl_FragColor = vec4(state, 0.0, 0.0, 1.0);
				return;

				if (state < 0.5)
				{
					if (surroundingState >= 3.5 && surroundingState <= 4.5)
					{
						gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
						return;
					}
					
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}

				if (surroundingState <= 1.5 || surroundingState >= 3.5)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}

				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				return;
			}
		`;

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSourceInit,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution
		};

		this.wilson = new Wilson(hiddenCanvas, options);

		this.wilson.render.loadNewShader(fragShaderSourceUpdate);

		this.wilson.render.initUniforms(["step"], 1);

		this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);
		this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);


		
		const fragShaderSourceUpscale = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				gl_FragColor = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0);
			}
		`;

		const optionsUpscale =
		{
			renderer: "gpu",

			shader: fragShaderSourceUpscale,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,



			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilsonUpscale = new Wilson(canvas, optionsUpscale);

		this.wilsonUpscale.render.createFramebufferTexturePair(this.wilsonUpscale.gl.UNSIGNED_BYTE);
	}



	run({ resolution = 1000, gridSize = 100 })
	{
		this.resolution = resolution;
		this.gridSize = gridSize;

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"][1], 1 / this.gridSize);



		this.wilson.changeCanvasSize(this.gridSize, this.gridSize);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.UNSIGNED_BYTE,
			null
		);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[1].texture
		);

		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.UNSIGNED_BYTE,
			null
		);



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(
			this.wilson.gl.FRAMEBUFFER,
			this.wilson.render.framebuffers[0].framebuffer
		);

		this.wilson.render.drawFrame();

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);



		this.resume();
	}



	drawFrame()
	{
		this.wilson.gl.bindFramebuffer(
			this.wilson.gl.FRAMEBUFFER,
			this.wilson.render.framebuffers[1].framebuffer
		);

		this.wilson.render.drawFrame();



		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[1].texture
		);

		this.wilson.gl.bindFramebuffer(
			this.wilson.gl.FRAMEBUFFER,
			this.wilson.render.framebuffers[0].framebuffer
		);

		this.wilson.render.drawFrame();

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);

		this.wilson.render.drawFrame();



		const pixelData = this.wilson.render.getPixelData();

		this.wilsonUpscale.gl.texImage2D(
			this.wilsonUpscale.gl.TEXTURE_2D,
			0,
			this.wilsonUpscale.gl.RGBA,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight,
			0,
			this.wilsonUpscale.gl.RGBA,
			this.wilsonUpscale.gl.UNSIGNED_BYTE,
			pixelData
		);

		this.wilsonUpscale.gl.bindFramebuffer(this.wilsonUpscale.gl.FRAMEBUFFER, null);

		this.wilsonUpscale.render.drawFrame();

		this.needNewFrame = true;
	}
}