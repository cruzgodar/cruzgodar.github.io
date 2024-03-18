import { Applet } from "../../../scripts/applets/applet.js";
import { buttonAnimationTime, changeOpacity } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import { Wilson } from "/scripts/wilson.js";

export class DoublePendulumFractal extends Applet
{
	resolution = 1000;
	centerUnstableEquilibrium = false;

	dt = .005;

	drawnFractal = false;

	pendulumCanvas;

	lastTimestamp = -1;

	drawingFractal = true;



	wilsonPendulum;

	resolutionPendulum = 2000;

	lastTimestampPendulum = -1;

	pendulumCanvasVisible = 0;

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



		const fragShaderSourceInit = /* glsl */`
			precision highp float;
			
			varying vec2 uv;

			uniform float movementAdjust;
			
			void main(void)
			{
				gl_FragColor = fract(vec4((uv + vec2(1.0 + movementAdjust)) / 2.0, 0.5, 0.5));
				
				return;
			}
		`;



		const fragShaderSourceUpdate = /* glsl */`
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



		const fragShaderSourceDraw = /* glsl */`
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

		this.wilson.render.initUniforms(["movementAdjust"], 0);
		this.wilson.gl.uniform1f(this.wilson.uniforms.movementAdjust[0], 0);

		this.wilson.render.loadNewShader(fragShaderSourceUpdate);
		this.wilson.render.loadNewShader(fragShaderSourceDraw);
		this.wilson.render.initUniforms(["movementAdjust"], 2);
		this.wilson.gl.uniform1f(this.wilson.uniforms.movementAdjust[2], 0);

		this.wilson.render.createFramebufferTexturePair();
		this.wilson.render.createFramebufferTexturePair();



		const optionsPendulum =
		{
			renderer: "cpu",

			canvasWidth: this.resolutionPendulum,
			canvasHeight: this.resolutionPendulum,

			mousemoveCallback: this.drawPreviewPendulum.bind(this),
			touchmoveCallback: this.drawPreviewPendulum.bind(this),

			mousedownCallback: this.startPendulumAnimation.bind(this),
			touchendCallback: this.startPendulumAnimation.bind(this)
		};

		this.wilsonPendulum = new Wilson(this.pendulumCanvas, optionsPendulum);

		this.wilsonPendulum.ctx.lineWidth = this.resolutionPendulum / 100;

		this.wilsonPendulum.ctx.strokeStyle = convertColor(127, 0, 255);

		this.wilsonPendulum.ctx.fillStyle = convertColor(0, 0, 0);

		this.wilsonPendulum.draggables.container.addEventListener("mouseleave", () =>
		{
			if (this.pendulumCanvasVisible === 1 || this.frame < 3)
			{
				changeOpacity(this.pendulumCanvas, 0, buttonAnimationTime);

				this.pendulumCanvasVisible = 0;
			}
		});
	}



	run({ resolution, centerUnstableEquilibrium = false })
	{
		this.drawnFractal = false;
		this.drawingFractal = true;

		this.resolution = resolution;
		this.centerUnstableEquilibrium = centerUnstableEquilibrium;
		
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

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.movementAdjust[2],
			this.centerUnstableEquilibrium ? 1 : 0
		);



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms.movementAdjust[0],
			this.centerUnstableEquilibrium ? 1 : 0
		);

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



		this.drawnFractal = true;
	}



	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		const numInternalFrames = timeElapsed > 10 ? 3 : 1;

		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);

		for (let i = 0; i < numInternalFrames; i++)
		{
			this.wilson.gl.bindTexture(
				this.wilson.gl.TEXTURE_2D,
				this.wilson.render.framebuffers[0].texture
			);

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
		}



		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);

		this.wilson.render.drawFrame();



		if (this.drawingFractal && !this.animationPaused)
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}



	drawPreviewPendulum(x, y)
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
		
		if (this.pendulumCanvasVisible === 0)
		{
			this.showPendulumCanvasPreview();
		}

		if (this.pendulumCanvasVisible !== 2)
		{
			this.theta1 = x * Math.PI;
			this.theta2 = y * Math.PI;

			this.p1 = 0;
			this.p2 = 0;

			window.requestAnimationFrame(this.drawFramePendulum.bind(this));
		}
	}



	startPendulumAnimation()
	{
		if (this.pendulumCanvasVisible === 1)
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

		changeOpacity(this.pendulumCanvas, .5, buttonAnimationTime);

		this.pendulumCanvasVisible = 1;
	}

	showPendulumCanvas()
	{
		if (!this.drawnFractal)
		{
			return;
		}

		changeOpacity(this.pendulumCanvas, 1, buttonAnimationTime);

		this.pendulumCanvasVisible = 2;

		window.requestAnimationFrame(this.drawFramePendulum.bind(this));
	}

	hidePendulumDrawerCanvas()
	{
		if (!this.drawnFractal)
		{
			return;
		}

		this.drawingFractal = true;

		changeOpacity(this.pendulumCanvas, 0, buttonAnimationTime);

		this.pendulumCanvasVisible = 0;

		window.requestAnimationFrame(this.drawFrame.bind(this));
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

		const rgb = this.wilsonPendulum.utils.hsvToRgb(hue, saturation, value);

		this.wilsonPendulum.ctx.strokeStyle = convertColor(...rgb);



		this.wilsonPendulum.ctx.beginPath();
		this.wilsonPendulum.ctx.moveTo(this.resolutionPendulum / 2, this.resolutionPendulum / 2);

		this.wilsonPendulum.ctx.lineTo(
			this.resolutionPendulum / 2 + this.resolutionPendulum / 6 * Math.sin(this.theta1),
			this.resolutionPendulum / 2 + this.resolutionPendulum / 6 * Math.cos(this.theta1)
		);

		this.wilsonPendulum.ctx.stroke();

		this.wilsonPendulum.ctx.beginPath();
		
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



		if (this.pendulumCanvasVisible === 2)
		{
			this.updateAngles();

			window.requestAnimationFrame(this.drawFramePendulum.bind(this));
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