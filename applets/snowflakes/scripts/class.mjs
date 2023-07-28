import { Applet } from "/scripts/src/applets.mjs"

export class Snowflake extends Applet
{
	loadPromise = null;
	
	resolution = 500;
	
	lastTimestamp = -1;
	
	computationsPerFrame = 20;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		
		
		const fragShaderSourceInit = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float rho;
			uniform float beta;
			uniform float alpha;
			uniform float theta;
			uniform float kappa;
			uniform float mu;
			uniform float gamma;
			
			uniform float resolution;
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (length(center - vec2(.5, .5)) < step)
				{
					gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, rho);
			}
		`;
		
		
		
		const fragShaderSourceDiffuse = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float rho;
			uniform float beta;
			uniform float alpha;
			uniform float theta;
			uniform float kappa;
			uniform float mu;
			uniform float gamma;
			
			uniform float resolution;
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(step, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-step, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, step));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -step));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-step, -step));
					state6 = texture2D(uTexture, center + vec2(step, -step));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-step, step));
					state6 = texture2D(uTexture, center + vec2(step, step));
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
		
		
		
		const fragShaderSourceFreeze = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float rho;
			uniform float beta;
			uniform float alpha;
			uniform float theta;
			uniform float kappa;
			uniform float mu;
			uniform float gamma;
			
			uniform float resolution;
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(step, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-step, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, step));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -step));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-step, -step));
					state6 = texture2D(uTexture, center + vec2(step, -step));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-step, step));
					state6 = texture2D(uTexture, center + vec2(step, step));
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
		
		
		
		const fragShaderSourceAttach = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float rho;
			uniform float beta;
			uniform float alpha;
			uniform float theta;
			uniform float kappa;
			uniform float mu;
			uniform float gamma;
			
			uniform float resolution;
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(step, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-step, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, step));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -step));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-step, -step));
					state6 = texture2D(uTexture, center + vec2(step, -step));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-step, step));
					state6 = texture2D(uTexture, center + vec2(step, step));
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
		
		
		
		const fragShaderSourceMelt = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float rho;
			uniform float beta;
			uniform float alpha;
			uniform float theta;
			uniform float kappa;
			uniform float mu;
			uniform float gamma;
			
			uniform float resolution;
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(uTexture, center);
				vec4 newState = state;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, newState.w);
					return;
				}
				
				vec4 state1 = texture2D(uTexture, center + vec2(step, 0.0));
				vec4 state2 = texture2D(uTexture, center + vec2(-step, 0.0));
				vec4 state3 = texture2D(uTexture, center + vec2(0.0, step));
				vec4 state4 = texture2D(uTexture, center + vec2(0.0, -step));
				vec4 state5;
				vec4 state6;
				
				if (mod(floor(center.x * resolution), 2.0) == 0.0)
				{
					state5 = texture2D(uTexture, center + vec2(-step, -step));
					state6 = texture2D(uTexture, center + vec2(step, -step));
				}
				
				else
				{
					state5 = texture2D(uTexture, center + vec2(-step, step));
					state6 = texture2D(uTexture, center + vec2(step, step));
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
		
		
		
		const fragShaderSourceDraw = `
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
		
		const options =
		{
			renderer: "gpu",
			
			shader: fragShaderSourceInit,
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			
			
			
			useFullscreen: true,
			
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.loadNewShader(fragShaderSourceDiffuse);
		this.wilson.render.loadNewShader(fragShaderSourceFreeze);
		this.wilson.render.loadNewShader(fragShaderSourceAttach);
		this.wilson.render.loadNewShader(fragShaderSourceMelt);
		this.wilson.render.loadNewShader(fragShaderSourceDraw);
		
		this.wilson.render.initUniforms(["rho", "beta", "alpha", "theta", "kappa", "mu", "gamma", "resolution", "step"], 0);
		this.wilson.render.initUniforms(["rho", "beta", "alpha", "theta", "kappa", "mu", "gamma", "resolution", "step"], 1);
		this.wilson.render.initUniforms(["rho", "beta", "alpha", "theta", "kappa", "mu", "gamma", "resolution", "step"], 2);
		this.wilson.render.initUniforms(["rho", "beta", "alpha", "theta", "kappa", "mu", "gamma", "resolution", "step"], 3);
		this.wilson.render.initUniforms(["rho", "beta", "alpha", "theta", "kappa", "mu", "gamma", "resolution", "step"], 4);
		
		this.wilson.render.createFramebufferTexturePair();
		this.wilson.render.createFramebufferTexturePair();
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
	}
	
	
	
	run(resolution = 500, computationsPerFrame = 25, rho = .635, beta = 1.6, alpha = .4, theta = .025, kappa = .0025, mu = .015, gamma = .0005)
	{
		this.resume();
		
		this.resolution = resolution;
		this.computationsPerFrame = computationsPerFrame;
		
		for (let i = 0; i <= 4; i++)
		{
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[i]);
			
			this.wilson.gl.uniform1f(this.wilson.uniforms["resolution"][i], this.resolution);
			this.wilson.gl.uniform1f(this.wilson.uniforms["step"][i], 1 / this.resolution);
			this.wilson.gl.uniform1f(this.wilson.uniforms["rho"][i], rho);
			this.wilson.gl.uniform1f(this.wilson.uniforms["beta"][i], beta);
			this.wilson.gl.uniform1f(this.wilson.uniforms["alpha"][i], alpha);
			this.wilson.gl.uniform1f(this.wilson.uniforms["theta"][i], theta);
			this.wilson.gl.uniform1f(this.wilson.uniforms["kappa"][i], kappa);
			this.wilson.gl.uniform1f(this.wilson.uniforms["mu"][i], mu);
			this.wilson.gl.uniform1f(this.wilson.uniforms["gamma"][i], gamma);
		}
		
		
		
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvasWidth, this.wilson.canvasHeight, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, null);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvasWidth, this.wilson.canvasHeight, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, null);
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[0].framebuffer);
		
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
		
		
		
		for (let i = 0; i < this.computationsPerFrame; i++)
		{
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);
			
			this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[1].framebuffer);
			
			this.wilson.render.drawFrame();
			
			
			
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);
			
			this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
			this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[0].framebuffer);
			
			this.wilson.render.drawFrame();
			
			
			
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[3]);
			
			this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
			this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[1].framebuffer);
			
			this.wilson.render.drawFrame();
			
			
			
			this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[4]);
			
			this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
			this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[0].framebuffer);
			
			this.wilson.render.drawFrame();
			
			
			
			this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		}
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[5]);
		
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		this.wilson.render.drawFrame();
		
		
		
		const pixels = this.wilson.render.getPixelData();
		
		const threshhold = Math.floor(this.resolution / 10);
		
		for (let i = threshhold; i < this.resolution - threshhold; i++)
		{
			const index1 = this.resolution * i + threshhold;
			const index2 = this.resolution * i + (this.resolution - threshhold);
			const index3 = this.resolution * threshhold + i;
			const index4 = this.resolution * (this.resolution - threshhold) + i;
			
			if (pixels[4 * index1] || pixels[4 * index2] || pixels[4 * index3] || pixels[4 * index4])
			{
				this.pause();
			}
		}
		
		
		
		if (!this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	}