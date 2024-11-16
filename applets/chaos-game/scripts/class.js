import { getVectorGlsl, tempShader } from "../../../scripts/applets/applet.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { doubleEncodingGlsl, loadGlsl } from "/scripts/src/complexGlsl.js";
import { Wilson } from "/scripts/wilson.js";

export class ChaosGame extends AnimationFrameApplet
{
	resolution = 1000;
	computeResolution = 1000;
	numVertices = 5;

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
		};

		this.wilsonUpdate = new Wilson(hiddenCanvas, optionsUpdate);



		const fragShaderSource = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float maxBrightness;
			uniform vec2 center;

			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			void main(void)
			{
				float state = texture2D(uTexture, (uv + vec2(1.0)) * 0.5).x / maxBrightness * 2.5;

				vec2 uvForColor = uv - center;
				
				gl_FragColor = vec4(hsv2rgb(vec3(
					atan(uvForColor.x, uvForColor.y) / 6.283,
					min(length(uvForColor) * 1.5, 1.0),
					state))
				, 1.0);
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

		this.wilson.render.initUniforms(["maxBrightness", "center"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms.maxBrightness, 1);
		this.wilson.gl.uniform2fv(this.wilson.uniforms.center, [0, 0]);

		this.loadPromise = loadGlsl();
	}



	run({ resolution = 1000, numVertices = 5 })
	{
		this.resolution = resolution;
		this.computeResolution = Math.round(resolution / 3);

		this.numVertices = numVertices;

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



		const vertices = [];

		for (let i = 0; i < numVertices; i++)
		{
			const angle = i / numVertices * 2 * Math.PI;

			vertices.push([.85 * Math.sin(angle), .85 * Math.cos(angle)]);
		}

		if (numVertices === 3)
		{
			for (const vertex of vertices)
			{
				vertex[1] -= .125;
			}

			this.wilson.gl.uniform2fv(this.wilson.uniforms.center, [0, -.125]);
		}

		else
		{
			this.wilson.gl.uniform2fv(this.wilson.uniforms.center, [0, 0]);
		}

		const vertexGlsl = vertices.map((v, index) =>
		{
			return `const vec2 vertex${index + 1} = ${getVectorGlsl(v)};`;
		}).join("");

		const updateGlsl = vertices.map((v, index) =>
		{
			const conditional = index === 0
				? `if (r < ${(index + 1) / numVertices})`
				: index === numVertices - 1
					? "else"
					: `else if (r < ${(index + 1) / numVertices})`;

			return /* glsl */`
				${conditional}
				{
					state = mix(state, vertex${index + 1}, 0.5);
				}
			`;
		}).join("");



		const fragShaderSourceUpdateBase = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			${vertexGlsl}

			${doubleEncodingGlsl}

			float rand(vec2 co)
			{
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			void main(void)
			{
				vec2 state = texture2D(uTexture, (uv + vec2(1.0)) * 0.5).xy;

				float r = rand(uv + state);

				${updateGlsl}
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

		console.log(fragShaderSourceUpdateX);
		console.log(fragShaderSourceUpdateY);

		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateX);
		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateY);

		

		const numIterationsByNumVertices = {
			3: 50,
			4: 100,
			5: 175,
			6: 125,
			7: 125,
		};

		this.frame = 0;
		this.numIterations = numIterationsByNumVertices[numVertices] ?? 200;
		
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

		const maxBrightnessAdjustByNumVertices = {
			3: 1,
			4: 1,
			5: .9,
			6: 1.5,
			7: 1.3,
		};

		const maxBrightnessAdjust = Math.min(this.frame / 15, 1)
			* maxBrightnessAdjustByNumVertices[this.numVertices];

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.maxBrightness,
			this.maxBrightness / maxBrightnessAdjust
		);

		this.wilson.render.drawFrame();
	}
}