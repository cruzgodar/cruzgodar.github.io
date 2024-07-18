import {
	doubleEncodingGlsl,
	getGlslBundle,
	loadGlsl
} from "../../../scripts/src/complexGlsl.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { Applet, getMaxGlslString } from "/scripts/applets/applet.js";
import { addTemporaryListener } from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

export class VectorField extends AnimationFrameApplet
{
	loadPromise;

	resolution = 500;

	numParticles = 0;
	maxParticles = 5000;

	aspectRatio = 1;
	zoomLevel = .6515;
	fixedPointX = 0;
	fixedPointY = 0;

	dt = .00375;

	lifetime = 150;

	// A long array of particles of the form [x, y, remaining lifetime].
	particles = [];

	freeParticleSlots = [];

	updateTexture;
	dimTexture;

	updateCanvas;
	dimCanvas;
	wilsonUpdate;
	wilsonDim;

	panVelocityX = 0;
	panVelocityY = 0;
	zoomVelocity = 0;

	nextPanVelocityX = 0;
	nextPanVelocityY = 0;
	nextZoomVelocity = 0;

	lastPanVelocitiesX = [];
	lastPanVelocitiesY = [];
	lastZoomVelocities = [];

	panFriction = .96;
	panVelocityStartThreshhold = .00025;
	panVelocityStopThreshhold = .00025;

	zoomFriction = .9;
	zoomVelocityStartThreshhold = .002;
	zoomVelocityStopThreshhold = .002;

	timeElapsedHistoryLength = 60;
	lastTimeElapsed = new Array(this.timeElapsedHistoryLength);
	averageTimeElapsed;
	frame = 0;
	


	constructor({
		canvas,
		draggable1Location = [1, 0],
		draggable2Location = [-1, 0]
	}) {
		super(canvas);

		this.updateCanvas = this.createHiddenCanvas();
		this.dimCanvas = this.createHiddenCanvas();



		const tempShader = /* glsl */`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const optionsUpdate =
		{
			renderer: "gpu",

			shader: tempShader,

			canvasWidth: 100,
			canvasHeight: 100,
		};

		this.wilsonUpdate = new Wilson(this.updateCanvas, optionsUpdate);



		this.wilsonUpdate.render.createFramebufferTexturePair();

		this.wilsonUpdate.gl.bindTexture(
			this.wilsonUpdate.gl.TEXTURE_2D,
			this.wilsonUpdate.render.framebuffers[0].texture
		);

		this.wilsonUpdate.gl.bindFramebuffer(this.wilsonUpdate.gl.FRAMEBUFFER, null);



		const fragShaderSourceDim = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			uniform float dimAmount;
			
			void main(void)
			{
				vec3 v = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0).xyz;
				
				gl_FragColor = vec4(v.x - dimAmount / 255.0, v.y, v.z, 1.0);
			}
		`;

		const fragShaderSourcePan = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform vec2 pan;
			
			void main(void)
			{
				vec2 texCoord = (uv + vec2(1.0, 1.0)) / 2.0 - pan;
				
				if (texCoord.x >= 0.0 && texCoord.x < 1.0 && texCoord.y >= 0.0 && texCoord.y < 1.0)
				{
					vec3 v = texture2D(uTexture, texCoord).xyz;
					
					gl_FragColor = vec4(v.x, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const fragShaderSourceZoom = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float scale;
			uniform vec2 fixedPoint;
			
			void main(void)
			{
				vec2 texCoord = ((uv + vec2(1.0, 1.0)) / 2.0 - fixedPoint) * scale + fixedPoint;
				
				if (texCoord.x >= 0.0 && texCoord.x < 1.0 && texCoord.y >= 0.0 && texCoord.y < 1.0)
				{
					vec3 v = texture2D(uTexture, texCoord).xyz;
					
					gl_FragColor = vec4(v.x / 1.06, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;

		const optionsDim =
		{
			renderer: "gpu",

			shader: fragShaderSourceDim,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
		};

		this.wilsonDim = new Wilson(this.dimCanvas, optionsDim);

		this.wilsonDim.render.initUniforms(["dimAmount"], 0);



		this.wilsonDim.render.loadNewShader(fragShaderSourcePan);

		this.wilsonDim.render.initUniforms(["pan"], 1);

		this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);



		this.wilsonDim.render.loadNewShader(fragShaderSourceZoom);

		this.wilsonDim.render.initUniforms(["scale", "fixedPoint"], 2);

		this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);



		this.wilsonDim.render.createFramebufferTexturePair(this.wilsonDim.gl.UNSIGNED_BYTE);

		this.wilsonDim.gl.bindTexture(
			this.wilsonDim.gl.TEXTURE_2D,
			this.wilsonDim.render.framebuffers[0].texture
		);

		this.wilsonDim.gl.bindFramebuffer(this.wilsonDim.gl.FRAMEBUFFER, null);

		this.dimTexture = new Uint8Array(this.resolution * this.resolution * 4);



		const fragShaderSourceDraw = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float maxBrightness;

			uniform float stepSizeDownRight;
			uniform float stepSizeUpLeft;
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}

			vec3 getPixel(vec2 uv)
			{
				vec3 v = texture2D(uTexture, (vec2(1.0 + uv.x, 1.0 - uv.y)) / 2.0).xyz;

				return hsv2rgb(vec3(v.y, v.z, v.x / maxBrightness));
			}
			
			void main(void)
			{
				vec3 distance1 = getPixel(uv);

				vec3 distance2 = getPixel(uv + vec2(stepSizeDownRight, 0.0));
				vec3 distance3 = getPixel(uv + vec2(0.0, stepSizeDownRight));
				vec3 distance6 = getPixel(uv + vec2(stepSizeDownRight, stepSizeDownRight));

				vec3 distance4 = getPixel(uv + vec2(-stepSizeUpLeft, 0.0));
				vec3 distance5 = getPixel(uv + vec2(0.0, -stepSizeUpLeft));
				vec3 distance7 = getPixel(uv + vec2(stepSizeUpLeft, -stepSizeUpLeft));
				vec3 distance8 = getPixel(uv + vec2(-stepSizeUpLeft, stepSizeUpLeft));
				vec3 distance9 = getPixel(uv + vec2(-stepSizeUpLeft, -stepSizeUpLeft));
				gl_FragColor = vec4(${getMaxGlslString("distance", 9)}, 1.0);
			}
		`;

		const options =
		{
			renderer: "gpu",

			shader: fragShaderSourceDraw,

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			worldWidth: 2 * Math.PI,
			worldHeight: 2 * Math.PI,
			worldCenterX: 0,
			worldCenterY: 0,



			useFullscreen: true,

			trueFullscreen: true,

			useFullscreenButton: true,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: this.generateNewField.bind(this, {}),



			useDraggables: true,

			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),



			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),

			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};

		this.wilson = new Wilson(canvas, options);

		this.wilson.render.initUniforms(["maxBrightness", "stepSizeDownRight", "stepSizeUpLeft"]);

		this.wilson.gl.uniform1f(this.wilson.uniforms["maxBrightness"], this.lifetime / 255);

		this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);

		this.wilson.gl.bindTexture(
			this.wilson.gl.TEXTURE_2D,
			this.wilson.render.framebuffers[0].texture
		);

		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);



		this.wilson.draggables.add(...draggable1Location);
		this.wilson.draggables.add(...draggable2Location);



		const boundFunction = this.handleResizeEvent.bind(this);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});



		this.loadPromise = loadGlsl();
	}



	run({
		generatingCode,
		resolution = 500,
		maxParticles = 10000,
		dt = .00375,
		lifetime = 150,
		worldCenterX = 0,
		worldCenterY = 0,
		zoomLevel = .6515
	}) {
		this.dt = dt;

		const fragShaderSourceUpdateBase = /* glsl */`
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float dt;
			
			uniform vec2 draggableArg;
			uniform vec2 draggableArg2;
			
			
			
			${getGlslBundle(generatingCode)}
			
			${doubleEncodingGlsl}
			
			
			
			vec2 f(float x, float y)
			{
				return vec2${generatingCode};
			}
			
			
			
			void main(void)
			{
				vec4 sample = texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0);
				
				if (int(sample.z) == 0)
				{
					return;
				}
				
				vec2 d = f(sample.x, sample.y);
		`;

		const fragShaderSourceUpdateX = /* glsl */`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(dt * d.x + sample.x);
			}
		`;

		const fragShaderSourceUpdateY = /* glsl */`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(dt * d.y + sample.y);
			}
		`;

		const fragShaderSourceUpdateH = /* glsl */`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat((atan(d.y, d.x) + 3.14159265) / 6.28318531);
			}
		`;

		const fragShaderSourceUpdateS = /* glsl */`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y)));
			}
		`;

		const fragShaderSourceUpdateS2 = /* glsl */`
				${fragShaderSourceUpdateBase}
				
				gl_FragColor = encodeFloat(1.0 - exp(-1.2 * .9 * (d.x * d.x + d.y * d.y)));
			}
		`;

		this.wilsonUpdate.render.shaderPrograms = [];

		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateX);
		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateY);
		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateH);
		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateS);
		this.wilsonUpdate.render.loadNewShader(fragShaderSourceUpdateS2);

		for (let i = 0; i < 5; i++)
		{
			this.wilsonUpdate.render.initUniforms(["dt", "draggableArg", "draggableArg2"], i);

			this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[i]);
			this.wilsonUpdate.gl.uniform1f(this.wilsonUpdate.uniforms["dt"][i], this.dt);
			
			this.wilsonUpdate.gl.uniform2fv(
				this.wilsonUpdate.uniforms["draggableArg"][i],
				this.wilson.draggables.worldCoordinates[0]
			);

			this.wilsonUpdate.gl.uniform2fv(
				this.wilsonUpdate.uniforms["draggableArg2"][i],
				this.wilson.draggables.worldCoordinates[1]
			);
		}



		this.wilson.draggables.draggables[0].style.display =
			generatingCode.indexOf("draggableArg") !== -1 ? "block" : "none";
		
		this.wilson.draggables.draggables[1].style.display =
			generatingCode.indexOf("draggableArg2") !== -1 ? "block" : "none";



		this.generateNewField({
			resolution,
			maxParticles,
			dt,
			lifetime,
			worldCenterX,
			worldCenterY,
			zoomLevel
		});
	}



	generateNewField({
		resolution = this.resolution,
		maxParticles = this.maxParticles,
		dt = this.dt,
		lifetime = this.lifetime,
		worldCenterX = this.wilson.worldCenterX,
		worldCenterY = this.wilson.worldCenterY,
		zoomLevel = this.zoomLevel
	}) {
		this.resolution = resolution;
		this.maxParticles = maxParticles;
		this.dt = dt;
		this.lifetime = lifetime;

		this.wilson.worldCenterX = worldCenterX;
		this.wilson.worldCenterY = worldCenterY;
		this.zoomLevel = zoomLevel;
		this.zoomCanvas();

		this.wilson.gl.uniform1f(this.wilson.uniforms["maxBrightness"], this.lifetime / 255);

		this.numParticles = 0;

		const updateResolution = Math.ceil(Math.sqrt(maxParticles));
		this.wilsonUpdate.changeCanvasSize(updateResolution, updateResolution);

		this.changeAspectRatio();



		this.particles = new Array(this.maxParticles);
		this.freeParticleSlots = new Array(this.maxParticles);

		for (let i = 0; i < this.maxParticles; i++)
		{
			// x, y, lifetime, hue, saturation
			this.particles[i] = [0, 0, 0];
			this.freeParticleSlots[i] = i;
		}



		this.updateTexture = new Float32Array(
			this.wilsonUpdate.canvasWidth * this.wilsonUpdate.canvasHeight * 4
		);

		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				this.updateTexture[4 * index] = 0.0;
				this.updateTexture[4 * index + 1] = 0.0;
				this.updateTexture[4 * index + 2] = 0.0;
				this.updateTexture[4 * index + 3] = 0.0;
			}
		}



		this.dimTexture = new Uint8Array(this.wilson.canvasWidth * this.wilson.canvasHeight * 4);

		for (let i = 0; i < this.wilson.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilson.canvasWidth; j++)
			{
				const index = this.wilson.canvasWidth * i + j;

				this.dimTexture[4 * index] = 0;
				this.dimTexture[4 * index + 1] = 0;
				this.dimTexture[4 * index + 2] = 0;
			}
		}



		this.resume();
	}



	drawFrame(timeElapsed)
	{
		// Wrapping everything in a try block and eating the occasional error is pretty gross,
		// but it's actually a decent solution: everything is fine unless the user
		// resizes the window faster than the screen refresh rate, meaning we access out of bounds
		// in the middle of this function. We can fix that by just restarting whenever it happens.
		try
		{
			for (let i = 0; i < 5; i++)
			{
				this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[i]);
				
				this.wilsonUpdate.gl.uniform1f(
					this.wilsonUpdate.uniforms["dt"][i],
					this.dt * timeElapsed / 6.944
				);
			}

			this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);

			if (this.frame < this.timeElapsedHistoryLength)
			{
				this.lastTimeElapsed[this.frame] = Math.min(timeElapsed, 16);

				if (this.frame === this.timeElapsedHistoryLength - 1)
				{
					let totalTimeElapsed = 0;

					for (let i = 0; i < this.timeElapsedHistoryLength; i++)
					{
						totalTimeElapsed += this.lastTimeElapsed[i];
					}

					this.wilsonDim.gl.uniform1f(
						this.wilsonDim.uniforms["dimAmount"][0],
						(totalTimeElapsed / this.timeElapsedHistoryLength) / 6.944
					);
				}

				this.frame++;
			}



			// If there's not enough particles, we add what's missing,
			// capped at 1% of the total particle count.
			if (this.numParticles < this.maxParticles)
			{
				// We find the first open slot we can and search from the end
				// of the list so that we can slice more efficiently.
				const numToAdd = Math.min(
					Math.ceil(this.maxParticles / 80),
					this.maxParticles - this.numParticles
				);

				for (
					let i = this.freeParticleSlots.length - numToAdd;
					i < this.freeParticleSlots.length;
					i++
				) {
					this.createParticle(this.freeParticleSlots[i]);
				}

				this.freeParticleSlots.splice(this.freeParticleSlots.length - numToAdd, numToAdd);
			}



			this.lastPanVelocitiesX.push(this.nextPanVelocityX);
			this.lastPanVelocitiesY.push(this.nextPanVelocityY);
			this.lastPanVelocitiesX.shift();
			this.lastPanVelocitiesY.shift();

			// This lets us only move the canvas when we have at least one pixel to move.
			if (this.nextPanVelocityX !== 0 || this.nextPanVelocityY !== 0)
			{
				let xDelta = -this.nextPanVelocityX;
				let yDelta = -this.nextPanVelocityY;



				if (Math.abs(xDelta / this.wilson.worldWidth * this.wilson.canvasWidth) < 1)
				{
					xDelta = 0;
				}

				else
				{
					this.nextPanVelocityX = 0;
				}



				if (Math.abs(yDelta / this.wilson.worldHeight * this.wilson.canvasHeight) < 1)
				{
					yDelta = 0;
				}

				else
				{
					this.nextPanVelocityY = 0;
				}



				if (xDelta !== 0 || yDelta !== 0)
				{
					this.panGrid(xDelta, yDelta);

					this.wilson.worldCenterY -= yDelta;
					this.wilson.worldCenterX -= xDelta;
				}
			}

			else if (this.panVelocityX !== 0 || this.panVelocityY !== 0)
			{
				let xDelta = -this.panVelocityX * timeElapsed / 6.944;
				let yDelta = -this.panVelocityY * timeElapsed / 6.944;

				if (Math.abs(xDelta / this.wilson.worldWidth * this.wilson.canvasWidth) < 1)
				{
					xDelta = 0;
				}

				if (Math.abs(yDelta / this.wilson.worldHeight * this.wilson.canvasHeight) < 1)
				{
					yDelta = 0;
				}

				this.panGrid(xDelta, yDelta);

				this.wilson.worldCenterY -= yDelta;
				this.panVelocityY *= this.panFriction ** (timeElapsed / 6.944);

				this.wilson.worldCenterX -= xDelta;
				this.panVelocityX *= this.panFriction ** (timeElapsed / 6.944);

				if (this.panVelocityX ** 2 + this.panVelocityY ** 2 <
					this.panVelocityStopThreshhold ** 2)
				{
					this.panVelocityX = 0;
					this.panVelocityY = 0;
				}
			}



			this.lastZoomVelocities.push(this.nextZoomVelocity);
			this.lastZoomVelocities.shift();

			if (this.nextZoomVelocity !== 0)
			{
				this.zoomCanvas();

				this.zoomGrid(this.fixedPointX, this.fixedPointY, this.nextZoomVelocity);

				this.nextZoomVelocity = 0;
			}

			if (this.zoomVelocity !== 0)
			{
				this.zoomCanvas(this.fixedPointX, this.fixedPointY);

				this.zoomGrid(this.fixedPointX, this.fixedPointY, this.zoomVelocity);

				this.zoomLevel = Math.min(
					Math.max(
						this.zoomLevel + this.zoomVelocity * timeElapsed / 6.944,
						-3
					),
					3
				);

				this.zoomVelocity *= this.zoomFriction ** (timeElapsed / 6.944);

				if (Math.abs(this.zoomVelocity) < this.zoomVelocityStopThreshhold)
				{
					this.zoomVelocity = 0;
				}
			}



			this.updateParticles(timeElapsed);

			this.drawField();

			this.needNewFrame = true;
		}

		catch(ex)
		{
			this.generateNewField({});
		}
	}



	createParticle(index)
	{
		this.particles[index][0] = this.wilson.worldCenterX
			+ this.wilson.worldWidth * (Math.random() - .5);

		this.particles[index][1] = this.wilson.worldCenterY
			+ this.wilson.worldHeight * (Math.random() - .5);

		this.particles[index][2] = Math.round(this.lifetime * (Math.random() * .5 + .75));

		this.numParticles++;
	}

	destroyParticle(index)
	{
		// Set the lifetime to 0 if it wasn't already.
		this.particles[index][2] = 0;

		this.freeParticleSlots.push(index);

		this.numParticles--;
	}

	updateParticles()
	{
		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				if (index < this.particles.length && this.particles[index][2])
				{
					this.updateTexture[4 * index] = this.particles[index][0];
					this.updateTexture[4 * index + 1] = this.particles[index][1];
					this.updateTexture[4 * index + 2] = 1.0;
				}

				else
				{
					this.updateTexture[4 * index + 2] = 0.0;
				}
			}
		}



		this.wilsonUpdate.gl.texImage2D(
			this.wilsonUpdate.gl.TEXTURE_2D,
			0,
			this.wilsonUpdate.gl.RGBA,
			this.wilsonUpdate.canvasWidth,
			this.wilsonUpdate.canvasHeight,
			0,
			this.wilsonUpdate.gl.RGBA,
			this.wilsonUpdate.gl.FLOAT,
			this.updateTexture
		);

		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[0]);
		this.wilsonUpdate.render.drawFrame();

		const floatsX = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);



		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[1]);
		this.wilsonUpdate.render.drawFrame();

		const floatsY = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);



		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[2]);
		this.wilsonUpdate.render.drawFrame();

		const floatsH = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);



		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[3]);
		this.wilsonUpdate.render.drawFrame();

		const floatsS = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);



		// Extremely hacky way to fix the saturation bug on iOS.

		this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[4]);
		this.wilsonUpdate.render.drawFrame();

		const floatsS2 = new Float32Array(this.wilsonUpdate.render.getPixelData().buffer);



		for (let i = 0; i < this.wilsonUpdate.canvasHeight; i++)
		{
			for (let j = 0; j < this.wilsonUpdate.canvasWidth; j++)
			{
				const index = this.wilsonUpdate.canvasWidth * i + j;

				if (index < this.particles.length && this.particles[index][2])
				{
					this.particles[index][0] = floatsX[index];
					this.particles[index][1] = floatsY[index];

					const row = Math.round(
						(
							.5 - (
								this.particles[index][1] - this.wilson.worldCenterY
							) / this.wilson.worldHeight
						) * this.wilson.canvasHeight);

					const col = Math.round(
						(
							(this.particles[index][0] - this.wilson.worldCenterX)
								/ this.wilson.worldWidth
								+ .5
						) * this.wilson.canvasWidth
					);

					if (
						row >= 0
						&& row < this.wilson.canvasHeight
						&& col >= 0
						&& col < this.wilson.canvasWidth
					) {
						const newIndex = row * this.wilson.canvasWidth + col;

						this.dimTexture[4 * newIndex] = this.lifetime;
						this.dimTexture[4 * newIndex + 1] = floatsH[index] * 255;

						this.dimTexture[4 * newIndex + 2] =
							Math.max(floatsS[index], floatsS2[index]) * 255;

						this.particles[index][2]--;

						if (this.particles[index][2] <= 0)
						{
							this.destroyParticle(index);
						}
					}

					else
					{
						this.destroyParticle(index);
					}
				}
			}
		}
	}



	drawField()
	{
		this.wilsonDim.gl.texImage2D(
			this.wilsonDim.gl.TEXTURE_2D,
			0,
			this.wilsonDim.gl.RGBA,
			this.wilsonDim.canvasWidth,
			this.wilsonDim.canvasHeight,
			0,
			this.wilsonDim.gl.RGBA,
			this.wilsonDim.gl.UNSIGNED_BYTE,
			this.dimTexture
		);

		this.wilsonDim.render.drawFrame();

		this.dimTexture = this.wilsonDim.render.getPixelData();

		this.wilson.gl.texImage2D(
			this.wilson.gl.TEXTURE_2D,
			0,
			this.wilson.gl.RGBA,
			this.wilson.canvasWidth,
			this.wilson.canvasHeight,
			0,
			this.wilson.gl.RGBA,
			this.wilson.gl.UNSIGNED_BYTE,
			this.dimTexture
		);

		this.wilson.render.drawFrame();
	}



	// Call this before changing the world parameters!
	panGrid(xDelta, yDelta)
	{
		this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[1]);

		this.wilsonDim.gl.uniform2f(
			this.wilsonDim.uniforms["pan"][1],
			xDelta / this.wilson.worldWidth, -yDelta / this.wilson.worldHeight
		);

		this.drawField();

		this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);

		this.wilson.draggables.recalculateLocations();
	}



	// Call this before changing the world parameters!
	zoomGrid(fixedPointX, fixedPointY, zoomDelta)
	{
		if (this.zoomLevel <= -3 || this.zoomLevel >= 3)
		{
			return;
		}

		// Ex: if the scale is 2 and goes to 3, the delta is +1,
		// so we actually want to multiply things by 2^(-1) to get the source places.
		const scale = Math.pow(2, zoomDelta);

		const fixedX = (fixedPointX - this.wilson.worldCenterX) / this.wilson.worldWidth + .5;
		const fixedY = (this.wilson.worldCenterY - fixedPointY) / this.wilson.worldHeight + .5;



		this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[2]);

		this.wilsonDim.gl.uniform1f(this.wilsonDim.uniforms["scale"][2], scale);
		this.wilsonDim.gl.uniform2f(this.wilsonDim.uniforms["fixedPoint"][2], fixedX, fixedY);

		this.drawField();

		this.wilsonDim.gl.useProgram(this.wilsonDim.render.shaderPrograms[0]);

		this.wilson.draggables.recalculateLocations();


		// When we zoom out, we also cull the particles a little.
		if (zoomDelta > 0)
		{
			const chance = Math.pow(2, zoomDelta * 1.5);

			for (let i = 0; i < this.particles.length; i++)
			{
				if (this.particles[i][2] && (i % chance >= 1))
				{
					this.destroyParticle(i);
				}
			}
		}
	}



	onDragDraggable(
		activeDraggable = 0,
		x = this.wilson.draggables.worldCoordinates[0][0],
		y = this.wilson.draggables.worldCoordinates[0][1]
	) {
		const uniforms = activeDraggable === 0
			? this.wilsonUpdate.uniforms["draggableArg"]
			: this.wilsonUpdate.uniforms["draggableArg2"];

		for (let i = 0; i < 5; i++)
		{
			this.wilsonUpdate.gl.useProgram(this.wilsonUpdate.render.shaderPrograms[i]);
			this.wilsonUpdate.gl.uniform2f(uniforms[i], x, y);
		}
	}



	onGrabCanvas()
	{
		this.panVelocityX = 0;
		this.panVelocityY = 0;
		this.zoomVelocity = 0;

		this.lastPanVelocitiesX = [0, 0, 0, 0];
		this.lastPanVelocitiesY = [0, 0, 0, 0];
		this.lastZoomVelocities = [0, 0, 0, 0];
	}

	onDragCanvas(x, y, xDelta, yDelta)
	{
		// The += here lets us only move the canvas when we have at least one pixel to move.
		this.nextPanVelocityX += -xDelta;
		this.nextPanVelocityY += -yDelta;
	}

	onReleaseCanvas()
	{
		let maxIndex = 0;

		this.lastPanVelocitiesX.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > this.panVelocityX)
			{
				this.panVelocityX = Math.abs(velocity);
				maxIndex = index;
			}
		});

		if (this.panVelocityX < this.panVelocityStartThreshhold)
		{
			this.panVelocityX = 0;
		}

		else
		{
			this.panVelocityX = this.lastPanVelocitiesX[maxIndex];
		}



		this.lastPanVelocitiesY.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > this.panVelocityY)
			{
				this.panVelocityY = Math.abs(velocity);
				maxIndex = index;
			}
		});

		if (this.panVelocityY < this.panVelocityStartThreshhold)
		{
			this.panVelocityY = 0;
		}

		else
		{
			this.panVelocityY = this.lastPanVelocitiesY[maxIndex];
		}



		this.lastZoomVelocities.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > this.zoomVelocity)
			{
				this.zoomVelocity = Math.abs(velocity);
				maxIndex = index;
			}
		});

		if (this.zoomVelocity < this.zoomVelocityStartThreshhold)
		{
			this.zoomVelocity = 0;
		}

		else
		{
			this.zoomVelocity = this.lastZoomVelocities[maxIndex];
		}
	}



	onWheelCanvas(x, y, scrollAmount)
	{
		this.fixedPointX = x;
		this.fixedPointY = y;

		if (Math.abs(scrollAmount / 100) < .3)
		{
			this.nextZoomVelocity = scrollAmount / 100;

			this.zoomLevel = Math.min(Math.max(this.zoomLevel + scrollAmount / 100, -3), 3);
		}

		else
		{
			this.zoomVelocity += Math.sign(scrollAmount) * .05;
		}
	}



	onPinchCanvas(x, y, touchDistanceDelta)
	{
		let zoomDelta;

		if (this.aspectRatio >= 1)
		{
			zoomDelta = touchDistanceDelta / this.wilson.worldWidth * 10;
		}

		else
		{
			zoomDelta = touchDistanceDelta / this.wilson.worldHeight * 10;
		}

		this.zoomLevel = Math.min(Math.max(this.zoomLevel - zoomDelta, -3), 3);
		this.nextZoomVelocity = -zoomDelta;

		this.fixedPointX = x;
		this.fixedPointY = y;
	}



	zoomCanvas()
	{
		if (this.aspectRatio >= 1)
		{
			const newWorldCenter = this.wilson.input.getZoomedWorldCenter(
				this.fixedPointX,
				this.fixedPointY,
				4 * Math.pow(2, this.zoomLevel) * this.aspectRatio,
				4 * Math.pow(2, this.zoomLevel)
			);

			this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
			this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);

			this.wilson.worldCenterX = newWorldCenter[0];
			this.wilson.worldCenterY = newWorldCenter[1];
		}

		else
		{
			const newWorldCenter = this.wilson.input.getZoomedWorldCenter(
				this.fixedPointX,
				this.fixedPointY,
				4 * Math.pow(2, this.zoomLevel),
				4 * Math.pow(2, this.zoomLevel) / this.aspectRatio
			);

			this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
			this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;

			this.wilson.worldCenterX = newWorldCenter[0];
			this.wilson.worldCenterY = newWorldCenter[1];
		}

		this.wilson.draggables.recalculateLocations();
	}



	changeAspectRatio()
	{
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			this.aspectRatio = window.innerWidth / window.innerHeight;

			this.wilson.changeCanvasSize(
				...Applet.getEqualPixelFullScreen(this.resolution)
			);

			this.wilsonDim.changeCanvasSize(
				...Applet.getEqualPixelFullScreen(this.resolution)
			);
			
			if (this.aspectRatio >= 1)
			{
				this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
				this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);
			}

			else
			{
				this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
				this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;
			}
		}

		else
		{
			this.aspectRatio = 1;

			this.wilson.changeCanvasSize(this.resolution, this.resolution);
			this.wilsonDim.changeCanvasSize(this.resolution, this.resolution);

			this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
			this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);
		}

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["stepSizeDownRight"],
			this.resolution >= 750 ? 2 / this.resolution : 0
		);

		this.wilson.gl.uniform1f(
			this.wilson.uniforms["stepSizeUpLeft"],
			this.resolution >= 1500 ? 2 / this.resolution : 0
		);
	}



	handleResizeEvent()
	{
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			this.generateNewField({});
		}
	}
}