import { tempShader } from "../../../scripts/applets/applet.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { doubleEncodingGlsl, loadGlsl } from "/scripts/src/complexGlsl.js";
import { Wilson } from "/scripts/wilson.js";

export class BarnsleyFern extends AnimationFrameApplet
{
	resolution = 1000;

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
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			worldWidth: 12,
			worldHeight: 12,
			worldCenterX: 0,
			worldCenterY: 5,
		};

		this.wilsonUpdate = new Wilson(hiddenCanvas, optionsUpdate);



		const fragShaderSource = /* glsl */`
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

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSource,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms(["maxBrightness"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness, 1);



		this.loadPromise = loadGlsl();
	}



	run({ resolution = 1000 })
	{
		this.resolution = resolution;

		this.wilsonUpdate.changeCanvasSize(this.resolution, this.resolution);

		this.wilsonUpdate.render.framebuffers = [];
		this.wilsonUpdate.render.createFramebufferTexturePair();

		this.wilsonUpdate.gl.bindFramebuffer(this.wilsonUpdate.gl.FRAMEBUFFER, null);
		this.wilsonUpdate.gl.bindTexture(
			this.wilsonUpdate.gl.TEXTURE_2D,
			this.wilsonUpdate.render.framebuffers[0].texture
		);

		

		this.wilson.changeCanvasSize(this.resolution, this.resolution);

		this.wilson.render.framebuffers = [];
		this.wilson.render.createFramebufferTexturePair();

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		

		const fragShaderSourceUpdateBase = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			const mat2 A1 = mat2(0.0, 0.0, 0.0, .16);
			const mat2 A2 = mat2(.85, -.04, .04, .85);
			const mat2 A3 = mat2(.2, .23, -.26, .22);
			const mat2 A4 = mat2(-.15, .26, .28, .24);

			const vec2 b1 = vec2(0.0, 0.0);
			const vec2 b2 = vec2(0.0, 1.6);
			const vec2 b3 = vec2(0.0, 1.6);
			const vec2 b4 = vec2(0.0, .44);

			${doubleEncodingGlsl}

			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			void main(void)
			{
				vec2 state = texture2D(uTexture, (uv + vec2(1.0)) * 0.5).xy;

				float r = rand(uv + state);

				if (r < .01)
				{
					state = A1 * state + b1;
				}

				else if (r < .86)
				{
					state = A2 * state + b2;
				}

				else if (r < .93)
				{
					state = A3 * state + b3;
				}

				else
				{
					state = A4 * state + b4;
				}
		`;

		const fragShaderSourceUpdateX = /* glsl */`
				${fragShaderSourceUpdateBase}

				gl_FragColor = encodeFloat(state.x);
			}
		`;

		const fragShaderSourceUpdateY = /* glsl */`
				${fragShaderSourceUpdateBase}

				gl_FragColor = encodeFloat(state.y);
			}
		`;

		this.texture = new Float32Array(this.resolution * this.resolution * 4);
		this.imageData = new Float32Array(this.resolution * this.resolution * 4);

		this.maxBrightness = 1;
		this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness, 1);

		for (let i = 0; i < this.resolution; i++)
		{
			for (let j = 0; j < this.resolution; j++)
			{
				const index = this.resolution * i + j;
				const worldCoordinates = this.wilsonUpdate.utils.interpolate.canvasToWorld(i, j);

				this.texture[4 * index] = worldCoordinates[0];
				this.texture[4 * index + 1] = worldCoordinates[1];
				this.texture[4 * index + 2] = 0;
				this.texture[4 * index + 3] = 1;
			}
		}

		this.wilsonUpdate.render.shaderPrograms = [];

		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateX);
		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateY);



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
		this.wilsonUpdate.gl.texImage2D(
			this.wilsonUpdate.gl.TEXTURE_2D,
			0,
			this.wilsonUpdate.gl.RGBA,
			this.resolution,
			this.resolution,
			0,
			this.wilsonUpdate.gl.RGBA,
			this.wilsonUpdate.gl.FLOAT,
			this.texture
		);

		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]);
		this.wilsonUpdate.render.drawFrame();
		const floatsX = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);

		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]);
		this.wilsonUpdate.render.drawFrame();
		const floatsY = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);

		for (let i = 0; i < this.resolution; i++)
		{
			for (let j = 0; j < this.resolution; j++)
			{
				const index = this.resolution * i + j;
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

		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.resolution,
			this.resolution,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.FLOAT,
			this.imageData
		);

		this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness, this.maxBrightness);

		this.wilson.render.drawFrame();
	}
}