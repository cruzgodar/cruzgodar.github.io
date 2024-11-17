import { tempShader } from "../../../scripts/applets/applet.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { doubleEncodingGlsl, loadGlsl } from "/scripts/src/complexGlsl.js";
import { Wilson } from "/scripts/wilson.js";

export class BarnsleyFern extends AnimationFrameApplet
{
	resolution = 1000;
	computeResolution = 1000;
	A1 = [0, 0, 0, .16];
	A4 = [-.15, .26, .28, .24];
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
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: this.computeResolution,
			canvasHeight: this.computeResolution,

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

			worldWidth: 12,
			worldHeight: 12,
			worldCenterX: 0,
			worldCenterY: 5,

			useDraggables: true,

			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),

			draggablesMouseupCallback: this.onReleaseDraggable.bind(this),
			draggablesTouchendCallback: this.onReleaseDraggable.bind(this),

			useFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};

		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms(["maxBrightness"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness, 1);

		this.wilson.draggables.add(2.6556, 9.95851);

		this.loadPromise = loadGlsl();
	}



	run({ resolution = 1000 })
	{
		this.resolution = resolution;
		this.computeResolution = Math.round(resolution / 4);

		this.wilsonUpdate.changeCanvasSize(this.computeResolution, this.computeResolution);

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

		this.texture = new Float32Array(this.computeResolution * this.computeResolution * 4);
		this.imageData = new Float32Array(this.resolution * this.resolution * 4);

		this.maxBrightness = 1;
		this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness, 1);

		for (let i = 0; i < this.computeResolution; i++)
		{
			for (let j = 0; j < this.computeResolution; j++)
			{
				const index = this.computeResolution * i + j;
				const worldCoordinates = this.wilsonUpdate.utils.interpolate.canvasToWorld(i, j);

				this.texture[4 * index] = worldCoordinates[0];
				this.texture[4 * index + 1] = worldCoordinates[1];
				this.texture[4 * index + 2] = 0;
				this.texture[4 * index + 3] = 1;
			}
		}

		this.wilsonUpdate.render.shaderPrograms = [];

		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateX);
		this.wilsonUpdate.render.initUniforms(["A1", "A4", "b2"], 0);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A1[0], false, this.A1);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A4[0], false, this.A4);
		this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.b2[0], this.b2);

		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateY);
		this.wilsonUpdate.render.initUniforms(["A1", "A4", "b2"], 1);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A1[1], false, this.A1);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A4[1], false, this.A4);
		this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.b2[1], this.b2);

		

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
		this.wilsonUpdate.gl.texImage2D(
			this.wilsonUpdate.gl.TEXTURE_2D,
			0,
			this.wilsonUpdate.gl.RGBA,
			this.computeResolution,
			this.computeResolution,
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

		const maxBrightnessAdjust = this.resolution / 1000 * Math.min(this.frame / 25, 1);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.maxBrightness,
			this.maxBrightness / maxBrightnessAdjust
		);

		this.wilson.render.drawFrame();
	}

	onDragDraggable(activeDraggable, x, y)
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
		this.A1 = [0, 0, -.16 * s, .16 * c];

		const c2 = Math.cos(2 * theta);
		// The default transformation for this one is orientation-reversing, so we
		// rotate to vertical, apply the usual one, then rotate back.
		this.A4 = [
			0.045 - 0.195 * c2 - 0.54 * c * s,
			-0.01 + 0.27 * c2 - 0.39 * c * s,
			0.01 + 0.27 * c2 - 0.39 * c * s,
			0.045 + 0.195 * c2 + 0.54 * c * s
		];

		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A1[0], false, this.A1);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A4[0], false, this.A4);
		this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.b2[0], this.b2);

		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A1[1], false, this.A1);
		this.wilsonUpdate.gl.uniformMatrix2fv(this.wilsonUpdate.uniforms.A4[1], false, this.A4);
		this.wilsonUpdate.gl.uniform2fv(this.wilsonUpdate.uniforms.b2[1], this.b2);
	}

	onReleaseDraggable()
	{
		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]);
		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]);

		this.run({ resolution: this.resolution });
	}
}