import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { hsvToRgb } from "/scripts/applets/applet.js";
import { buttonAnimationTime, changeOpacity } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import { siteSettings } from "/scripts/src/settings.js";
import { WilsonCPU, WilsonGPU } from "/scripts/wilson.js";

export class DoublePendulumFractal extends AnimationFrameApplet
{
	resolution = 1000;
	centerUnstableEquilibrium = false;

	dt = .005;

	drawnFractal = false;
	pendulumCanvas;
	drawingFractal = true;



	wilsonPendulum;
	resolutionPendulum = 2000;
	pendulumCanvasVisibility = 0;
	lastTimestampPendulum = -1;

	theta1 = 0;
	theta2 = 0;
	p1 = 0;
	p2 = 0;

	frame = 0;

	initialTheta1 = 0;
	initialTheta2 = 0;



	constructor({ canvas, pendulumCanvas })
	{
		super(canvas);

		this.pendulumCanvas = pendulumCanvas;



		const shaderInit = /* glsl */`
			precision highp float;
			
			varying vec2 uv;

			uniform float movementAdjust;
			
			void main(void)
			{
				gl_FragColor = fract(vec4((uv + vec2(1.0 + movementAdjust)) / 2.0, 0.5, 0.5));
				
				return;
			}
		`;



		const shaderUpdate = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			const float dt = .002;
			
			
			
			void main(void)
			{
				vec4 state = (texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5)) * (3.14159265358 * 2.0);
				
				float denom = 16.0 - 9.0 * cos(state.x - state.y) * cos(state.x - state.y);
				
				vec4 dState = vec4(6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / denom, 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / denom, 0.0, 0.0);
				
				dState.z = -(dState.x * dState.y * sin(state.x - state.y) + 3.0 * sin(state.x)) / 2.0;
				
				dState.w = (dState.x * dState.y * sin(state.x - state.y) - sin(state.y)) / 2.0;
				
				
				
				state = ((dt * dState + state) / (3.14159265358 * 2.0)) + vec4(.5, .5, .5, .5);
				
				state.xy = fract(state.xy);
				
				gl_FragColor = state;
			}
		`;



		const shaderDraw = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float movementAdjust;
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			void main(void)
			{
				vec4 state = (texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5));
				
				float h = atan(state.y, state.x) / 6.283;
				
				float s = min((state.x * state.x + state.y * state.y) * 20.0, 1.0);
				
				float vAdd = .9 * (1.0 - 4.0 * ((uv.x * uv.x) / 4.0 + (uv.y * uv.y) / 4.0));
				
				float v = min(2.0 * length(state.zw) + vAdd * (1.0 - movementAdjust), 1.0);
				
				vec3 rgb = hsv2rgb(vec3(h, s, v));
				
				gl_FragColor = vec4(rgb, 1.0);
			}
		`;



		const options =
		{
			shaders: {
				init: shaderInit,
				update: shaderUpdate,
				draw: shaderDraw
			},

			uniforms: {
				init: {
					movementAdjust: 0
				},
				draw: {
					movementAdjust: 0
				}
			},

			canvasWidth: this.resolution,

			reduceMotion: siteSettings.reduceMotion,

			fullscreenOptions: {
				useFullscreenButton: true,
				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonGPU(canvas, options);
		this.wilsonForFullscreen = this.wilson;



		const optionsPendulum =
		{
			canvasWidth: this.resolutionPendulum,

			reduceMotion: siteSettings.reduceMotion,

			interactionOptions: {
				callbacks: {
					mousemove: this.drawPreviewPendulum.bind(this),
					touchmove: this.drawPreviewPendulum.bind(this),
					mousedown: this.startPendulumAnimation.bind(this),
					touchend: this.startPendulumAnimation.bind(this),

					mouseleave: () =>
					{
						if (this.pendulumCanvasVisibility === 1 || this.frame < 3)
						{
							changeOpacity({
								element: this.pendulumCanvas,
								opacity: 0,
								duration: buttonAnimationTime
							});

							this.pendulumCanvasVisibility = 0;
						}
					}
				}
			}
		};

		this.wilsonPendulum = new WilsonCPU(this.pendulumCanvas, optionsPendulum);

		this.wilsonPendulum.ctx.lineWidth = this.resolutionPendulum / 100;
		this.wilsonPendulum.ctx.strokeStyle = convertColor(127, 0, 255);
		this.wilsonPendulum.ctx.fillStyle = convertColor(0, 0, 0);
	}



	run({ resolution, centerUnstableEquilibrium = false })
	{
		this.drawnFractal = false;
		this.drawingFractal = true;

		this.resolution = resolution;
		this.centerUnstableEquilibrium = centerUnstableEquilibrium;
		
		this.wilson.resizeCanvas({ width: this.resolution });

		this.wilson.createFramebufferTexturePair({
			id: "0",
			textureType: "float"
		});

		this.wilson.createFramebufferTexturePair({
			id: "1",
			textureType: "float"
		});

		this.wilson.setUniforms({
			movementAdjust: this.centerUnstableEquilibrium ? 1 : 0
		}, "init");

		this.wilson.setUniforms({
			movementAdjust: this.centerUnstableEquilibrium ? 1 : 0
		}, "draw");

		this.wilson.useShader("init");
		this.wilson.useTexture("0");
		this.wilson.useFramebuffer("0");
		this.wilson.drawFrame();

		this.resume();
		this.needNewFrame = true;
		this.drawnFractal = true;
	}



	drawFrame(timeElapsed)
	{
		const numInternalFrames = timeElapsed > 10 ? 3 : 1;

		this.wilson.useShader("update");

		for (let i = 0; i < numInternalFrames; i++)
		{
			this.wilson.useTexture("0");
			this.wilson.useFramebuffer("1");
			this.wilson.drawFrame();

			this.wilson.useTexture("1");
			this.wilson.useFramebuffer("0");
			this.wilson.drawFrame();
		}

		this.wilson.useShader("draw");
		this.wilson.useTexture("0");
		this.wilson.useFramebuffer(null);
		this.wilson.drawFrame();

		if (this.drawingFractal)
		{
			this.needNewFrame = true;
		}
	}



	drawPreviewPendulum({ x, y })
	{
		if (this.drawingFractal)
		{
			return;
		}

		if (this.centerUnstableEquilibrium)
		{
			x = (x + 2) % 2 - 1;
			y = (y + 2) % 2 - 1;
		}
		
		if (this.pendulumCanvasVisibility === 0)
		{
			this.showPendulumCanvasPreview();
		}

		if (this.pendulumCanvasVisibility !== 2)
		{
			this.theta1 = x * Math.PI;
			this.theta2 = y * Math.PI;

			this.p1 = 0;
			this.p2 = 0;

			requestAnimationFrame(this.drawFramePendulum.bind(this));
		}
	}



	startPendulumAnimation()
	{
		if (this.pendulumCanvasVisibility === 1)
		{
			this.initialTheta1 = this.theta1;
			this.initialTheta2 = this.theta2;

			this.p1 = 0;
			this.p2 = 0;

			this.frame = 0;

			this.showPendulumCanvas();
		}
	}



	showPendulumCanvasPreview()
	{
		if (!this.drawnFractal)
		{
			return;
		}

		this.drawingFractal = false;

		changeOpacity({
			element: this.pendulumCanvas,
			opacity: .5,
			duration: buttonAnimationTime
		});

		this.pendulumCanvasVisibility = 1;
	}

	showPendulumCanvas()
	{
		if (!this.drawnFractal)
		{
			return;
		}

		this.wilsonForFullscreen = this.wilsonPendulum;

		changeOpacity({
			element: this.pendulumCanvas,
			opacity: 1,
			duration: buttonAnimationTime
		});

		this.pendulumCanvasVisibility = 2;

		requestAnimationFrame(this.drawFramePendulum.bind(this));
	}

	hidePendulumCanvas()
	{
		if (!this.drawnFractal)
		{
			return;
		}

		this.drawingFractal = true;

		this.wilsonForFullscreen = this.wilson;

		changeOpacity({
			element: this.pendulumCanvas,
			opacity: 0,
			duration: buttonAnimationTime
		});

		this.pendulumCanvasVisibility = 0;

		requestAnimationFrame(this.drawFrame.bind(this));
	}



	drawFramePendulum(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestampPendulum;
		this.lastTimestampPendulum = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.frame++;



		this.wilsonPendulum.ctx.fillRect(0, 0, this.resolutionPendulum, this.resolutionPendulum);



		const x = this.theta1 / Math.PI;
		const y = this.theta2 / Math.PI;

		const z = this.p1 / Math.PI;
		const w = this.p2 / Math.PI;

		const hue = Math.atan2(y, x) / Math.PI + 1;
		const saturation = Math.min(
			Math.min(
				(x * x + y * y) * 50,
				(1 - Math.max(Math.abs(x), Math.abs(y))) * 5
			),
			1
		);

		const valueAdd = .9 * (
			(1 - this.initialTheta1 / (2 * Math.PI))
				* (1 - this.initialTheta1 / (2 * Math.PI))
			+ (1 - this.initialTheta2 / (2 * Math.PI))
				* (1 - this.initialTheta2 / (2 * Math.PI))
		) * 4;

		const value = Math.min(Math.pow(z * z + w * w, .5) + valueAdd, 1);
		const rgb = hsvToRgb(hue, saturation, value);
		this.wilsonPendulum.ctx.strokeStyle = convertColor(...rgb);

		this.wilsonPendulum.ctx.beginPath();
		this.wilsonPendulum.ctx.moveTo(this.resolutionPendulum / 2, this.resolutionPendulum / 2);
		this.wilsonPendulum.ctx.lineTo(
			this.resolutionPendulum / 2 + this.resolutionPendulum / 6 * Math.sin(this.theta1),
			this.resolutionPendulum / 2 + this.resolutionPendulum / 6 * Math.cos(this.theta1)
		);
		this.wilsonPendulum.ctx.moveTo(
			this.resolutionPendulum / 2
				+ (this.resolutionPendulum / 6 - this.resolutionPendulum / 200)
					* Math.sin(this.theta1),
			this.resolutionPendulum / 2
				+ (this.resolutionPendulum / 6 - this.resolutionPendulum / 200)
					* Math.cos(this.theta1)
		);
		this.wilsonPendulum.ctx.lineTo(
			this.resolutionPendulum / 2
				+ this.resolutionPendulum / 6 * Math.sin(this.theta1)
				+ this.resolutionPendulum / 6 * Math.sin(this.theta2),
			this.resolutionPendulum / 2
				+ this.resolutionPendulum / 6 * Math.cos(this.theta1)
				+ this.resolutionPendulum / 6 * Math.cos(this.theta2)
		);
		this.wilsonPendulum.ctx.stroke();

		if (this.pendulumCanvasVisibility === 2)
		{
			this.updateAngles();

			requestAnimationFrame(this.drawFramePendulum.bind(this));
		}
	}



	updateAngles()
	{
		const dTheta1 = 6 * (
			2 * this.p1 - 3 * Math.cos(this.theta1 - this.theta2) * this.p2
		) / (
			16 - 9 * Math.pow(Math.cos(this.theta1 - this.theta2), 2)
		);

		const dTheta2 = 6 * (
			8 * this.p2 - 3 * Math.cos(this.theta1 - this.theta2) * this.p1
		) / (
			16 - 9 * Math.pow(Math.cos(this.theta1 - this.theta2), 2)
		);

		const dP1 = -(
			dTheta1 * dTheta2 * Math.sin(this.theta1 - this.theta2)
			+ 3 * Math.sin(this.theta1)
		) / 2;

		const dP2 = (
			dTheta1 * dTheta2 * Math.sin(this.theta1 - this.theta2)
			- Math.sin(this.theta2)
		) / 2;



		this.theta1 += dTheta1 * this.dt * 2.5;
		this.theta2 += dTheta2 * this.dt * 2.5;
		this.p1 += dP1 * this.dt * 2.5;
		this.p2 += dP2 * this.dt * 2.5;



		if (this.theta1 >= Math.PI)
		{
			this.theta1 -= 2 * Math.PI;
		}

		else if (this.theta1 < -Math.PI)
		{
			this.theta1 += 2 * Math.PI;
		}

		if (this.theta2 >= Math.PI)
		{
			this.theta2 -= 2 * Math.PI;
		}

		else if (this.theta2 < -Math.PI)
		{
			this.theta2 += 2 * Math.PI;
		}
	}
}