import { Applet } from "/scripts/src/applets.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class AbelianSandpile extends Applet
{
	wilsonUpscale = null;

	numGrains = 10000;
	resolution = 500;

	lastTimestamp = -1;

	computationsPerFrame = 20;

	lastPixelData = null;



	constructor({ canvas })
	{
		super(canvas);

		const hiddenCanvas = this.createHiddenCanvas();

		const fragShaderSourceInit = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float step;
			
			uniform vec4 startGrains;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (length(center - vec2(.5, .5)) < step / 2.0)
				{
					gl_FragColor = startGrains;
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
			}
		`;



		const fragShaderSourceUpdate = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				float leftover = mod(floor(256.0 * state.w), 4.0) / 256.0;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(step, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-step, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, step));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -step));
				
				
				
				/*
					The general idea: this is carrying in reverse. The largest place is supposed to be divided by four, so we
					start by extracting the portion that is too small for it to see and adding it to the next place down (not
					dividing by 256 effectively multiplies it by 256). Then what's left is divided by 4 and effectively floored.
				*/

				state1.y += mod(floor(state1.x * 256.0), 4.0);
				state1.x = floor(state1.x * 64.0) / 256.0;
				
				state1.z += mod(floor(state1.y * 256.0), 4.0);
				state1.y = floor(state1.y * 64.0) / 256.0;
				
				state1.w += mod(floor(state1.z * 256.0), 4.0);
				state1.z = floor(state1.z * 64.0) / 256.0;
				
				state1.w = floor(state1.w * 64.0) / 256.0;
				
				
				
				state2.y += mod(floor(state2.x * 256.0), 4.0);
				state2.x = floor(state2.x * 64.0) / 256.0;
				
				state2.z += mod(floor(state2.y * 256.0), 4.0);
				state2.y = floor(state2.y * 64.0) / 256.0;
				
				state2.w += mod(floor(state2.z * 256.0), 4.0);
				state2.z = floor(state2.z * 64.0) / 256.0;
				
				state2.w = floor(state2.w * 64.0) / 256.0;
				
				
				
				state3.y += mod(floor(state3.x * 256.0), 4.0);
				state3.x = floor(state3.x * 64.0) / 256.0;
				
				state3.z += mod(floor(state3.y * 256.0), 4.0);
				state3.y = floor(state3.y * 64.0) / 256.0;
				
				state3.w += mod(floor(state3.z * 256.0), 4.0);
				state3.z = floor(state3.z * 64.0) / 256.0;
				
				state3.w = floor(state3.w * 64.0) / 256.0;
				
				
				
				state4.y += mod(floor(state4.x * 256.0), 4.0);
				state4.x = floor(state4.x * 64.0) / 256.0;
				
				state4.z += mod(floor(state4.y * 256.0), 4.0);
				state4.y = floor(state4.y * 64.0) / 256.0;
				
				state4.w += mod(floor(state4.z * 256.0), 4.0);
				state4.z = floor(state4.z * 64.0) / 256.0;
				
				state4.w = floor(state4.w * 64.0) / 256.0;
				
				
				
				
				//The new state should be what used to be here, mod 4, plus the floor of 1/4 of each of the neighbors.
				vec4 newState = vec4(0.0, 0.0, 0.0, leftover) + state1 + state2 + state3 + state4;
				
				newState.z += floor(newState.w) / 256.0;
				newState.w = mod(newState.w, 1.0);
				
				newState.y += floor(newState.z) / 256.0;
				newState.z = mod(newState.z, 1.0);
				
				newState.x += floor(newState.y) / 256.0;
				newState.y = mod(newState.y, 1.0);
				
				gl_FragColor = newState;
			}
		`;



		const fragShaderSourceDraw = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				vec2 state = floor(256.0 * texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0).zw);
				
				if (state.x != 0.0)
				{
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
					return;
				}
				
				if (state.y == 1.0)
				{
					gl_FragColor = vec4(0.0, 0.25, 1.0, 1.0);
					return;
				}
				
				if (state.y == 2.0)
				{
					gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
					return;
				}
				
				if (state.y == 3.0)
				{
					gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
					return;
				}
				
				if (state.y >= 4.0)
				{
					float brightness = (state.y - 3.0) / 512.0 + .5;
					gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
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
		this.wilson.render.loadNewShader(fragShaderSourceDraw);

		this.wilson.render.initUniforms(["step", "startGrains"], 0);
		this.wilson.render.initUniforms(["step"], 1);

		this.wilson.render.createFramebufferTexturePair();
		this.wilson.render.createFramebufferTexturePair();

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);



		const fragShaderSourceUpscale = `
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



	run({ numGrains = 10000, computationsPerFrame = 25 })
	{
		this.resume();

		this.numGrains = numGrains;

		this.resolution = Math.floor(Math.sqrt(this.numGrains)) + 2;
		this.resolution = this.resolution + 1 - (this.resolution % 2);

		this.computationsPerFrame = computationsPerFrame;

		const grains4 = (this.numGrains % 256) / 256;
		const grains3 = (Math.floor(this.numGrains / 256) % 256) / 256;
		const grains2 = (Math.floor(this.numGrains / (256 * 256)) % 256) / 256;
		const grains1 = (Math.floor(this.numGrains / (256 * 256 * 256)) % 256) / 256;

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"][0], 1 / this.resolution);
		
		this.wilson.gl.uniform4f(
			this.wilson.uniforms["startGrains"][0],
			grains1,
			grains2,
			grains3,
			grains4
		);

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"][1], 1 / this.resolution);



		this.wilson.changeCanvasSize(this.resolution, this.resolution);

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
			this.wilson.gl.FLOAT,
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
			this.wilson.gl.FLOAT,
			null
		);



		const outputResolution = Math.max(
			this.resolution,
			this.canvas.getBoundingClientRect().width
		);

		this.wilsonUpscale.gl.bindTexture(
			this.wilsonUpscale.gl.TEXTURE_2D,
			this.wilsonUpscale.render.framebuffers[0].texture
		);

		this.wilsonUpscale.changeCanvasSize(outputResolution, outputResolution);



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



		window.requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.wilson.gl.viewport(0, 0, this.resolution, this.resolution);

		for (let i = 0; i < this.computationsPerFrame; i++)
		{
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);

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
		}



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);

		this.wilson.render.drawFrame();



		const pixelData = this.wilson.render.getPixelData();

		if (this.lastPixelData !== null)
		{
			let foundDiff = false;

			for (let i = 0; i < pixelData.length; i++)
			{
				if (pixelData[i] !== this.lastPixelData[i])
				{
					foundDiff = true;
					break;
				}
			}

			if (!foundDiff)
			{
				return;
			}
		}

		this.lastPixelData = pixelData;



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



		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
}