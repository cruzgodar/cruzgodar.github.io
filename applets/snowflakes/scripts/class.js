import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonGPU } from "/scripts/wilson.js";

export class Snowflake extends AnimationFrameApplet
{
	resolution = 500;

	computationsPerFrame = 20;



	constructor({ canvas })
	{
		super(canvas);

		const shaderInit = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float rho;
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (length(center - vec2(.5, .5)) < stepSize)
				{
					gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, rho);
			}
		`;

		const shaderDiffuse = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float resolution;
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(stepSize, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-stepSize, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, stepSize));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -stepSize));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, -stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, -stepSize));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, stepSize));
				}
				
				
				
				//The diffusion step: distribute the vapor mass. If it's on the boundary, only distribute mass from other cells not in the flake.
				if (state.x == 0.0)
				{
					float nearbyMass = state.w;
					
					
					
					if (state1.x == 0.0)
					{
						nearbyMass += state1.w;
					}
					
					else
					{
						nearbyMass += state.w;
					}
					
					
					
					if (state2.x == 0.0)
					{
						nearbyMass += state2.w;
					}
					
					else
					{
						nearbyMass += state.w;
					}
					
					
					
					if (state3.x == 0.0)
					{
						nearbyMass += state3.w;
					}
					
					else
					{
						nearbyMass += state.w;
					}
					
					
					
					if (state4.x == 0.0)
					{
						nearbyMass += state4.w;
					}
					
					else
					{
						nearbyMass += state.w;
					}
					
					
					
					if (state5.x == 0.0)
					{
						nearbyMass += state5.w;
					}
					
					else
					{
						nearbyMass += state.w;
					}
					
					
					
					if (state6.x == 0.0)
					{
						nearbyMass += state6.w;
					}
					
					else
					{
						nearbyMass += state.w;
					}
					
					
					
					newState.w = nearbyMass / 7.0;
				}
				
				gl_FragColor = newState;
			}
		`;

		const shaderFreeze = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float kappa;
			
			uniform float resolution;
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(stepSize, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-stepSize, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, stepSize));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -stepSize));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, -stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, -stepSize));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, stepSize));
				}
				
				
				
				//Figure out if we're on the boundary: if we're not in the flake but a neighbor is.
				if (state.x == 0.0 && (state1.x == 1.0 || state2.x == 1.0 || state3.x == 1.0 || state4.x == 1.0 || state5.x == 1.0 || state6.x == 1.0))
				{
					//The freezing step: add mass on the boundary.
					newState.y = state.y + (1.0 - kappa) * state.w;
					newState.z = state.z + kappa * state.w;
					newState.w = 0.0;
				}
				
				gl_FragColor = newState;
			}
		`;

		const shaderAttach = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float beta;
			uniform float alpha;
			uniform float theta;
			
			uniform float resolution;
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(stepSize, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-stepSize, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, stepSize));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -stepSize));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, -stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, -stepSize));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, stepSize));
				}
				
				
				
				//Figure out if we're on the boundary: if we're not in the flake but a neighbor is.
				if (state.x == 0.0 && (state1.x == 1.0 || state2.x == 1.0 || state3.x == 1.0 || state4.x == 1.0 || state5.x == 1.0 || state6.x == 1.0))
				{
					//The attachment step: add cells to the flake.
					int numAttachedNeighbors = 0;
					
					
					
					if (state1.x == 1.0)
					{
						numAttachedNeighbors += 1;
					}
					
					if (state2.x == 1.0)
					{
						numAttachedNeighbors += 1;
					}
					
					if (state3.x == 1.0)
					{
						numAttachedNeighbors += 1;
					}
					
					if (state4.x == 1.0)
					{
						numAttachedNeighbors += 1;
					}
					
					if (state5.x == 1.0)
					{
						numAttachedNeighbors += 1;
					}
					
					if (state6.x == 1.0)
					{
						numAttachedNeighbors += 1;
					}
					
					
					
					if (numAttachedNeighbors == 1 || numAttachedNeighbors == 2)
					{
						if (state.y >= beta)
						{
							newState.x = 1.0;
						}
					}
					
					else if (numAttachedNeighbors == 3)
					{
						if (state.y >= 1.0)
						{
							newState.x = 1.0;
						}
						
						else if (state.y >= alpha)
						{
							float nearbyMass = state.w + state1.w + state2.w + state3.w + state4.w + state5.w + state6.w;
							
							if (nearbyMass < theta)
							{
								newState.x = 1.0;
							}
						}
					}
					
					else if (numAttachedNeighbors >= 4)
					{
						newState.x = 1.0;
					}
					
					
					
					if (newState.x == 1.0)
					{
						newState.z = state.y + state.z;
						newState.y = 0.0;
					}
				}
				
				gl_FragColor = newState;
			}
		`;



		const shaderMelt = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float mu;
			uniform float gamma;
			
			uniform float resolution;
			uniform float stepSize;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= stepSize || center.x >= 1.0 - stepSize || center.y <= stepSize || center.y >= 1.0 - stepSize)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(stepSize, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-stepSize, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, stepSize));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -stepSize));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, -stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, -stepSize));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-stepSize, stepSize));
					state6 = texture2D(uTexture, center + vec2(stepSize, stepSize));
				}
				
				
				
				//Figure out if we're on the boundary: if we're not in the flake but a neighbor is.
				if (state.x == 0.0 && (state1.x == 1.0 || state2.x == 1.0 || state3.x == 1.0 || state4.x == 1.0 || state5.x == 1.0 || state6.x == 1.0))
				{
					//The melting step: move around mass on the boundary.
					newState.y = (1.0 - mu) * state.y;
					newState.z = (1.0 - gamma) * state.z;
					newState.w = state.w + mu * state.y + gamma * state.z;
				}
				
				gl_FragColor = newState;
			}
		`;



		const shaderDraw = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				//We stretch the y-coordinate by 2/sqrt(3) to account for the squishing of the flake.
				vec3 v = texture2D(uTexture, vec2(uv.x + 1.0, uv.y / 1.15470053838 + 1.0) / 2.0).zzz;
				
				gl_FragColor = vec4(v * .8, 1.0);
			}
		`;

		const options = {
			shaders: {
				init: shaderInit,
				diffuse: shaderDiffuse,
				freeze: shaderFreeze,
				attach: shaderAttach,
				melt: shaderMelt,
				draw: shaderDraw,
			},

			uniforms: {
				init: {
					rho: 0,
					stepSize: 1 / this.resolution,
				},
				diffuse: {
					resolution: this.resolution,
					stepSize: 1 / this.resolution,
				},
				freeze: {
					kappa: 0,
					resolution: this.resolution,
					stepSize: 1 / this.resolution,
				},
				attach: {
					beta: 0,
					alpha: 0,
					theta: 0,
					resolution: this.resolution,
					stepSize: 1 / this.resolution,
				},
				melt: {
					mu: 0,
					gamma: 0,
					resolution: this.resolution,
					stepSize: 1 / this.resolution,
				},
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
	}



	run({
		resolution = 500,
		computationsPerFrame = 25,
		rho = .635,
		beta = 1.6,
		alpha = .4,
		theta = .025,
		kappa = .0025,
		mu = .015,
		gamma = .0005
	}) {
		this.resolution = resolution;
		this.computationsPerFrame = computationsPerFrame;

		this.wilson.setUniforms({
			rho,
			stepSize: 1 / this.resolution,
		}, "init");

		this.wilson.setUniforms({
			resolution: this.resolution,
			stepSize: 1 / this.resolution,
		}, "diffuse");

		this.wilson.setUniforms({
			kappa,
			resolution: this.resolution,
			stepSize: 1 / this.resolution,
		}, "freeze");

		this.wilson.setUniforms({
			beta,
			alpha,
			theta,
			resolution: this.resolution,
			stepSize: 1 / this.resolution,
		}, "attach");

		this.wilson.setUniforms({
			mu,
			gamma,
			resolution: this.resolution,
			stepSize: 1 / this.resolution,
		}, "melt");

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
		this.wilson.useFramebuffer("0");
		this.wilson.useTexture("0");
		this.wilson.drawFrame();

		this.resume();
	}



	drawFrame()
	{
		for (let i = 0; i < this.computationsPerFrame; i++)
		{
			this.wilson.useShader("diffuse");
			this.wilson.useFramebuffer("1");
			this.wilson.drawFrame();

			this.wilson.useShader("freeze");
			this.wilson.useFramebuffer("0");
			this.wilson.useTexture("1");
			this.wilson.drawFrame();

			this.wilson.useShader("attach");
			this.wilson.useFramebuffer("1");
			this.wilson.useTexture("0");
			this.wilson.drawFrame();

			this.wilson.useShader("melt");
			this.wilson.useFramebuffer("0");
			this.wilson.useTexture("1");
			this.wilson.drawFrame();

			this.wilson.useTexture("0");
		}

		this.wilson.useShader("draw");
		this.wilson.useFramebuffer(null);
		this.wilson.drawFrame();



		const pixels = this.wilson.readPixels();

		const threshhold = Math.floor(this.resolution / 10);

		for (let i = threshhold; i < this.resolution - threshhold; i++)
		{
			const index1 = this.resolution * i + threshhold;
			const index2 = this.resolution * i + (this.resolution - threshhold);
			const index3 = this.resolution * threshhold + i;
			const index4 = this.resolution * (this.resolution - threshhold) + i;

			if (
				pixels[4 * index1]
				|| pixels[4 * index2]
				|| pixels[4 * index3]
				|| pixels[4 * index4]
			) {
				this.pause();
			}
		}

		this.needNewFrame = true;
	}
}