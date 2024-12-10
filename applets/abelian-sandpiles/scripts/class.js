import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class AbelianSandpile extends AnimationFrameApplet
{
	numGrains = 10000;
	floodGrains = 0;
	resolution = 319;

	computationsPerFrame = 20;

	lastPixelData;



	constructor({ canvas })
	{
		super(canvas);

		const fragShaderSourceInit = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float stepSize;
			
			uniform vec4 startGrains;
			uniform vec4 floodGrains;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (length(center - vec2(.5, .5)) < stepSize / 2.0)
				{
					gl_FragColor = startGrains;
					
					return;
				}
				
				gl_FragColor = floodGrains;
			}
		`;



		const fragShaderSourceUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				float leftover = mod(floor(256.0 * state.w), 4.0) / 256.0;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(stepSize, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-stepSize, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, stepSize));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -stepSize));
				
				
				
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

		const fragShaderSourceDraw = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;

			uniform vec3 color1;
			uniform vec3 color2;
			uniform vec3 color3;
			
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
					gl_FragColor = vec4(color1, 1.0);
					return;
				}
				
				if (state.y == 2.0)
				{
					gl_FragColor = vec4(color2, 1.0);
					return;
				}
				
				if (state.y == 3.0)
				{
					gl_FragColor = vec4(color3, 1.0);
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

		const options = {
			shaders: {
				init: fragShaderSourceInit,
				update: fragShaderSourceUpdate,
				draw: fragShaderSourceDraw,
			},

			uniforms: {
				init: {
					stepSize: 0,
					startGrains: [0, 0, 0, 0],
					floodGrains: [0, 0, 0, 0],
				},
				update: {
					stepSize: 0,
				},
				draw: {
					color1: [0, 0, 0],
					color2: [0, 0, 0],
					color3: [0, 0, 0],
				}
			},

			canvasWidth: this.resolution,

			reduceMotion: siteSettings.reduceMotion,

			fullscreenOptions: {
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			},
		};

		this.wilson = new WilsonGPU(canvas, options);
		this.canvas.style.imageRendering = "pixelated";
	}



	run({
		resolution = 100,
		numGrains = 10000,
		floodGrains = 0,
		computationsPerFrame = 25,
		palette = [[229, 190, 237], [149, 147, 217], [124, 144, 219]],
	}) {
		this.resolution = resolution;
		this.numGrains = numGrains;
		this.floodGrains = floodGrains;
		this.computationsPerFrame = computationsPerFrame;

		const grains = [
			(Math.floor(this.numGrains / (256 * 256 * 256)) % 256) / 256,
			(Math.floor(this.numGrains / (256 * 256)) % 256) / 256,
			(Math.floor(this.numGrains / 256) % 256) / 256,
			(this.numGrains % 256) / 256
		];

		this.wilson.setUniform({
			shader: "init",
			name: "stepSize",
			value: 1 / this.resolution
		});

		this.wilson.setUniform({
			shader: "init",
			name: "startGrains",
			value: grains
		});

		this.wilson.setUniform({
			shader: "init",
			name: "floodGrains",
			value: [0, 0, 0, this.floodGrains / 256]
		});

		this.wilson.setUniform({
			shader: "update",
			name: "stepSize",
			value: 1 / this.resolution
		});

		this.wilson.setUniform({
			shader: "draw",
			name: "color1",
			value: [
				palette[0][0] / 255,
				palette[0][1] / 255,
				palette[0][2] / 255
			]
		});

		this.wilson.setUniform({
			shader: "draw",
			name: "color2",
			value: [
				palette[1][0] / 255,
				palette[1][1] / 255,
				palette[1][2] / 255
			]
		});

		this.wilson.setUniform({
			shader: "draw",
			name: "color3",
			value: [
				palette[2][0] / 255,
				palette[2][1] / 255,
				palette[2][2] / 255
			]
		});

		this.wilson.resizeCanvas({ width: this.resolution });



		this.wilson.createFramebufferTexturePair({
			id: "0",
			textureType: "float"
		});

		this.wilson.createFramebufferTexturePair({
			id: "1",
			textureType: "float"
		});

		this.wilson.useTexture("0");
		this.wilson.useFramebuffer(null);

		this.wilson.useShader("update");
		this.wilson.setTexture({
			id: "0",
			data: null
		});
		this.wilson.setTexture({
			id: "1",
			data: null
		});

		this.wilson.useShader("init");
		this.wilson.useTexture("1");
		this.wilson.useFramebuffer("0");
		this.wilson.drawFrame();

		this.wilson.useTexture("0");

		this.resume();
	}



	drawFrame()
	{
		this.wilson.useShader("update");

		for (let i = 0; i < this.computationsPerFrame; i++)
		{
			this.wilson.useFramebuffer("1");
			this.wilson.drawFrame();

			this.wilson.useTexture("1");
			this.wilson.useFramebuffer("0");
			this.wilson.drawFrame();

			this.wilson.useTexture("0");
		}

		this.wilson.useShader("draw");
		this.wilson.useFramebuffer(null);
		this.wilson.drawFrame();



		const pixelData = this.wilson.readPixels();

		if (this.lastPixelData)
		{
			let foundDiff = false;

			for (let i = Math.floor(pixelData.length / 2 - 4); i < pixelData.length; i++)
			{
				if (pixelData[i] !== this.lastPixelData[i])
				{
					foundDiff = true;
					break;
				}
			}

			if (!foundDiff)
			{
				this.pause();
				return;
			}
		}

		this.lastPixelData = pixelData;

		this.needNewFrame = true;
	}
}