import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { getFloatGlsl } from "/scripts/applets/applet.js";
import { WilsonGPU } from "/scripts/wilson.js";

const moveToHereVecs = {
	north: "vec2(0.0, stepSize)",
	east: "vec2(stepSize, 0.0)",
	south: "vec2(0.0, -stepSize)",
	west: "vec2(-stepSize, 0.0)",
};

const directionValues = {
	north: getFloatGlsl(1),
	south: getFloatGlsl(0.75),
	east: getFloatGlsl(0.5),
	west: getFloatGlsl(0.25),
};

// Direction is one of "north", "east", "south", or "west".
function getUpdateShader(direction)
{
	const directionValue = directionValues[direction];

	return /* glsl */`
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D uTexture;
		uniform float stepSize;
		
		void main(void)
		{
			vec2 center = (uv + vec2(1.0, 1.0)) * 0.5;

			float here = texture2D(uTexture, center).x;

			if (here == 0.0)
			{
				float adjacent = texture2D(uTexture, mod(center - ${moveToHereVecs[direction]}, 1.0)).x;

				if (adjacent == ${directionValue})
				{
					gl_FragColor = vec4(${directionValue}, 0.0, 0.0, 1.0);
				}

				else
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				}
			}

			else if (here == ${directionValue})
			{
				float adjacent = texture2D(uTexture, mod(center + ${moveToHereVecs[direction]}, 1.0)).x;

				if (adjacent == 0.0)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				}

				else
				{
					gl_FragColor = vec4(${directionValue}, 0.0, 0.0, 1.0);
				}
			}

			else
			{
				gl_FragColor = vec4(here, 0.0, 0.0, 1.0);
			}
		}
	`;
}

export class AbelianSandpiles extends AnimationFrameApplet
{
	resolution = 500;
	density = 0.5;
	northAmount = 0.5;
	computationsPerFrame = 1;



	constructor({ canvas })
	{
		super(canvas);

		const shaderInit = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float seed;
			uniform float density;
			uniform float northAmount;
			
			float rand(vec2 co)
			{
				co += vec2(seed, seed);
				return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
			}
			
			void main(void)
			{
				float random = rand(uv);

				if (random < density * northAmount)
				{
					// North
					gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
				}

				else if (random < density)
				{
					// East
					gl_FragColor = vec4(0.5, 0.0, 0.0, 1.0);
				}

				else
				{
					// Empty
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				}
			}
		`;

		const shaderDraw = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) * 0.5;

				float here = texture2D(uTexture, center).x;

				if (here == 1.0)
				{
					gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
				}

				else if (here == 0.5)
				{
					gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
				}

				else
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				}
			}
		`;

		const options = {
			shaders: {
				init: shaderInit,
				updateNorth: getUpdateShader("north"),
				updateEast: getUpdateShader("east"),
				draw: shaderDraw,
			},

			uniforms: {
				init: {
					seed: Math.random(),
					density: this.density,
					northAmount: this.northAmount,
				},
				updateNorth: {
					stepSize: 1 / this.resolution,
				},
				updateEast: {
					stepSize: 1 / this.resolution,
				},
			},

			canvasWidth: this.resolution,

			fullscreenOptions: {
				onSwitch: this.switchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
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
		density = 0.5,
		northAmount = 0.5,
		computationsPerFrame = 1,
	}) {
		this.resolution = resolution;
		this.density = density;
		this.northAmount = northAmount;
		this.computationsPerFrame = computationsPerFrame;

		this.wilson.setUniforms({
			seed: Math.random(),
			density: this.density,
			northAmount: this.northAmount,
		}, "init");

		this.wilson.setUniforms({
			stepSize: 1 / this.resolution,
		}, "updateNorth");

		this.wilson.setUniforms({
			stepSize: 1 / this.resolution,
		}, "updateEast");

		this.wilson.resizeCanvas({ width: this.resolution });

		this.wilson.createFramebufferTexturePair({
			id: "0",
			textureType: "float"
		});

		this.wilson.createFramebufferTexturePair({
			id: "1",
			textureType: "float"
		});

		this.wilson.useShader("init");
		this.wilson.useTexture("1");
		this.wilson.useFramebuffer("0");
		this.wilson.drawFrame();

		this.resume();
	}



	drawFrame()
	{
		for (let i = 0; i < this.computationsPerFrame; i++)
		{
			this.wilson.useShader("updateNorth");
			this.wilson.useTexture("0");
			this.wilson.useFramebuffer("1");
			this.wilson.drawFrame();

			this.wilson.useShader("updateEast");
			this.wilson.useTexture("1");
			this.wilson.useFramebuffer("0");
			this.wilson.drawFrame();
		}

		this.wilson.useShader("draw");
		this.wilson.useTexture("0");
		this.wilson.useFramebuffer(null);
		this.wilson.drawFrame();

		this.needNewFrame = true;
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