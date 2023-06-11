"use strict";

class FractalSounds extends Applet
{
	loadPromise = null;
	
	wilsonHidden = null;
	wilsonLineDrawer = null;
	
	juliaMode = 0;
	
	aspectRatio = 1;
	
	numIterations = 200;
	
	exposure = 1;
	
	zoomLevel = 0;
	
	pastBrightnessScales = [];
	
	resolution = 500;
	resolutionHidden = 200;
	
	needToClear = false;
	
	fixedPointX = 0;
	fixedPointY = 0;
	
	numTouches = 0;
	
	moved = 0;
	
	lastX = 0;
	lastY = 0;	
	zoomingWithMouse = false;
	
	nextPanVelocityX = 0;
	nextPanVelocityY = 0;
	nextZoomVelocity = 0;
	
	panVelocityX = 0;
	panVelocityY = 0;
	zoomVelocity = 0;
	
	panFriction = .96;
	panVelocityStartThreshhold = .0025;
	panVelocityStopThreshhold = .00025;
	
	zoomFriction = .93;
	zoomVelocityStartThreshhold = .01;
	zoomVelocityStopThreshhold = .001;
	
	lastTimestamp = -1;
	
	
	
	constructor(canvas, lineDrawerCanvas)
	{
		super(canvas);
		
		const tempShader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0,
			
			useFullscreen: true,
		
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: this.switchFullscreen.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		
		
		const hiddenCanvas = this.createHiddenCanvas();
		
		const optionsHidden =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};
		
		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);
		
		
		
		const optionsLineDrawer =
		{
			renderer: "cpu",
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0,
			
			mousemoveCallback: this.onHoverCanvas.bind(this),
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),
			
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),
			
			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),
			
			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this),
			
			useFullscreen: true,
		
			trueFullscreen: true,
		
			useFullscreenButton: false
		};
		
		this.wilsonLineDrawer = new Wilson(lineDrawerCanvas, optionsLineDrawer);
		
		const elements = Page.element.querySelectorAll(".wilson-fullscreen-components-container");
		
		elements[0].style.setProperty("z-index", 200, "important");
		elements[1].style.setProperty("z-index", 300, "important");
		
		this.wilsonLineDrawer.ctx.lineWidth = 40;
		
		
		
		const boundFunction = this.changeAspectRatio.bind(this);
		window.addEventListener("resize", boundFunction);
		this.handlers.push([window, "resize", boundFunction]);
		
		
		
		this.loadPromise = new Promise(async (resolve, reject) =>
		{
			await Site.loadGLSL();
			
			resolve();
		});
	}
	
	
	
	run(glslCode, jsCode, resolution, exposure, numIterations)
	{
		this.currentFractalFunction = jsCode;
		
		this.resolution = resolution;
		this.exposure = exposure;
		this.numIterations = numIterations;
		
		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			const float hueMultiplier = 100.0;
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(1.0, .4157, 0.0);
			const vec3 color3 = vec3(1.0, .8471, 0.0);
			const vec3 color4 = vec3(.7333, 1.0, 0.0);
			const vec3 color5 = vec3(.2980, 1.0, 0.0);
			const vec3 color6 = vec3(0.0, 1.0, .1137);
			const vec3 color7 = vec3(0.0, 1.0, .5490);
			const vec3 color8 = vec3(0.0, 1.0, .9647);
			const vec3 color9 = vec3(0.0, .6, 1.0);
			const vec3 color10 = vec3(0.0, .1804, 1.0);
			const vec3 color11 = vec3(.2471, 0.0, 1.0);
			const vec3 color12 = vec3(.6667, 0.0, 1.0);
			const vec3 color13 = vec3(1.0, 0.0, .8980);
			
			
			
			${Site.getGLSLBundle(glslCode)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				float brightness = exp(-max(length(z), .5));
				
				vec2 c = z;
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				vec2 lastZ1 = vec2(0.0, 0.0);
				vec2 lastZ2 = vec2(0.0, 0.0);
				vec2 lastZ3 = vec2(0.0, 0.0);
				vec2 lastZ4 = vec2(0.0, 0.0);
				vec2 lastZ5 = vec2(0.0, 0.0);
				vec2 lastZ6 = vec2(0.0, 0.0);
				vec2 lastZ7 = vec2(0.0, 0.0);
				vec2 lastZ8 = vec2(0.0, 0.0);
				vec2 lastZ9 = vec2(0.0, 0.0);
				vec2 lastZ10 = vec2(0.0, 0.0);
				vec2 lastZ11 = vec2(0.0, 0.0);
				vec2 lastZ12 = vec2(0.0, 0.0);
				vec2 lastZ13 = vec2(0.0, 0.0);
				
				float hue1 = 0.0;
				float hue2 = 0.0;
				float hue3 = 0.0;
				float hue4 = 0.0;
				float hue5 = 0.0;
				float hue6 = 0.0;
				float hue7 = 0.0;
				float hue8 = 0.0;
				float hue9 = 0.0;
				float hue10 = 0.0;
				float hue11 = 0.0;
				float hue12 = 0.0;
				float hue13 = 0.0;
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == numIterations)
					{
						vec3 color = hue1 * color1 + hue2 * color2 + hue3 * color3 + hue4 * color4 + hue5 * color5 + hue6 * color6 + hue7 * color7 + hue8 * color8 + hue9 * color9 + hue10 * color10 + hue11 * color11 + hue12 * color12 + hue13 * color13;
						gl_FragColor = vec4(brightness / brightnessScale * exposure * normalize(color), 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					lastZ13 = lastZ12;
					lastZ12 = lastZ11;
					lastZ11 = lastZ10;
					lastZ10 = lastZ9;
					lastZ9 = lastZ8;
					lastZ8 = lastZ7;
					lastZ7 = lastZ6;
					lastZ6 = lastZ5;
					lastZ5 = lastZ4;
					lastZ4 = lastZ3;
					lastZ3 = lastZ2;
					lastZ2 = lastZ1;
					lastZ1 = z;
					z = ${glslCode};
					
					
					
					brightness += exp(-max(length(z), .5));
					
					hue1 += exp(-hueMultiplier * length(z - lastZ1));
					hue2 += exp(-hueMultiplier * length(z - lastZ2));
					hue3 += exp(-hueMultiplier * length(z - lastZ3));
					hue4 += exp(-hueMultiplier * length(z - lastZ4));
					hue5 += exp(-hueMultiplier * length(z - lastZ5));
					hue6 += exp(-hueMultiplier * length(z - lastZ6));
					hue7 += exp(-hueMultiplier * length(z - lastZ7));
					hue8 += exp(-hueMultiplier * length(z - lastZ8));
					hue9 += exp(-hueMultiplier * length(z - lastZ9));
					hue10 += exp(-hueMultiplier * length(z - lastZ10));
					hue11 += exp(-hueMultiplier * length(z - lastZ11));
					hue12 += exp(-hueMultiplier * length(z - lastZ12));
					hue13 += exp(-hueMultiplier * length(z - lastZ13));
				}
			}
		`;

		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);

		this.wilson.render.initUniforms(["juliaMode", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "numIterations", "exposure", "brightnessScale"], 0);
		
		
		
		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);
		
		this.wilsonHidden.render.initUniforms(["juliaMode", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "numIterations", "exposure", "brightnessScale"], 0);
		
		
		this.juliaMode = 0;
		this.zoomLevel = 0;
		
		this.pastBrightnessScales = [];
		
		this.wilsonLineDrawer.worldWidth = 4;
		this.wilsonLineDrawer.worldHeight = 4;
		this.wilsonLineDrawer.worldCenterX = 0;
		this.wilsonLineDrawer.worldCenterY = 0;
		
		
		
		//Render the inital frame.
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"][0], 1);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"][0], 1);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	onGrabCanvas(x, y, event)
	{
		this.panVelocityX = 0;
		this.panVelocityY = 0;
		this.zoomVelocity = 0;
		
		this.nextPanVelocityX = 0;
		this.nextPanVelocityY = 0;
		this.nextZoomVelocity = 0;
		
		this.wilsonLineDrawer.canvas.style.opacity = 1;
		
		
		
		if (event.type === "touchstart")
		{
			this.numTouches = event.touches.length;
			
			if (this.numTouches === 1)
			{
				this.showOrbit(x, y);
				this.playSound(x, y);
			}
		}
		
		else
		{
			this.moved = 0;
			this.showOrbit(x, y);
		}
	}
	
	
	
	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (event.type === "mousemove" || this.numTouches >= 2)
		{
			if (this.numTouches >= 2 || Math.abs(xDelta) > 0 || Math.abs(yDelta) > 0)
			{
				this.wilsonLineDrawer.ctx.clearRect(0, 0, this.resolution, this.resolution);
			}	
			
			this.wilsonLineDrawer.worldCenterX -= xDelta;
			this.wilsonLineDrawer.worldCenterY -= yDelta;
			
			this.nextPanVelocityX = -xDelta / this.wilson.worldWidth;
			this.nextPanVelocityY = -yDelta / this.wilson.worldHeight;
			
			this.wilsonLineDrawer.worldCenterX = Math.min(Math.max(this.wilsonLineDrawer.worldCenterX, -2), 2);
			this.wilsonLineDrawer.worldCenterY = Math.min(Math.max(this.wilsonLineDrawer.worldCenterY, -2), 2);
			
			this.moved++;
			
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
		
		else
		{
			this.showOrbit(x, y);
		}	
	}
	
	
	
	onHoverCanvas(x, y, xDelta, yDelta, event)
	{
		this.showOrbit(x, y);
		
		this.moved = 0;
	}
	
	
	
	onReleaseCanvas(x, y, event)
	{
		if (event.type === "mouseup" || this.numTouches >= 2)
		{
			if (this.nextPanVelocityX * this.nextPanVelocityX + this.nextPanVelocityY * this.nextPanVelocityY >= this.panVelocityStartThreshhold * this.panVelocityStartThreshhold)
			{
				this.panVelocityX = this.nextPanVelocityX;
				this.panVelocityY = this.nextPanVelocityY;
				
				this.moved = 10;
			}
			
			if (Math.abs(this.nextZoomVelocity) >= this.zoomVelocityStartThreshhold)
			{
				this.zoomVelocity = this.nextZoomVelocity;
				
				this.moved = 10;
			}
			
			if (this.moved < 10 && event.type === "mouseup")
			{
				this.playSound(x, y);
			}
		}
		
		else
		{
			anime({
				targets: this.wilsonLineDrawer.canvas,
				opacity: 0,
				easing: "linear",
				duration: 300
			});
		}
		
		setTimeout(() => this.numTouches = 0, 50);
		this.moved = 0;
	}
	
	
	
	showOrbit(x0, y0)
	{
		this.wilsonLineDrawer.ctx.lineWidth = 2;
		
		this.wilsonLineDrawer.canvas.style.opacity = 1;
		this.wilsonLineDrawer.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilsonLineDrawer.ctx.clearRect(0, 0, this.resolution, this.resolution);
		
		this.wilsonLineDrawer.ctx.beginPath();
		let coords = this.wilsonLineDrawer.utils.interpolate.worldToCanvas(x0, y0);
		this.wilsonLineDrawer.ctx.moveTo(coords[1], coords[0]);
		
		let x = x0;
		let y = y0;
		let a = x0;
		let b = y0;
		
		let next = this.currentFractalFunction(x, y, a, b);
		
		x = 0;
		y = 0;
		
		for (let i = 0; i < 300; i++)
		{
			if (Math.abs(next[0]) > 10 || Math.abs(next[1]) > 10)
			{
				return;
			}
			
			x = next[0];
			y = next[1];
			
			next = this.currentFractalFunction(x, y, a, b);
			
			coords = this.wilsonLineDrawer.utils.interpolate.worldToCanvas(x, y);
			this.wilsonLineDrawer.ctx.lineTo(coords[1], coords[0]);
		}
		
		this.wilsonLineDrawer.ctx.stroke();
	}
	
	
	
	playSound(x0, y0)
	{
		const audioContext = new AudioContext();
		
		const sampleRate = 44100;
		const numFrames = 44100;
		const samplesPerFrame = 12;
		const numSamples = Math.floor(numFrames / samplesPerFrame);
		
		let x = x0;
		let y = y0;
		let a = x0;
		let b = y0;
		
		let next = this.currentFractalFunction(x, y, a, b);
		
		x = 0;
		y = 0;
		
		let maxValue = 0;
		
		let unscaledLeftData = new Array(numSamples);
		let unscaledRightData = new Array(numSamples);
		
		
		
		let buffer = audioContext.createBuffer(2, numFrames, sampleRate);
		
		let leftData = buffer.getChannelData(0);
		let rightData = buffer.getChannelData(1);
		
		for (let i = 0; i < numSamples; i++)
		{
			if (Math.abs(next[0]) > 100 || Math.abs(next[1]) > 100)
			{
				return;
			}
			
			if (Math.abs(next[0]) > maxValue)
			{
				maxValue = Math.abs(next[0]);
			}
			
			if (Math.abs(next[1]) > maxValue)
			{
				maxValue = Math.abs(next[1]);
			}
			
			unscaledLeftData[i] = x;
			unscaledRightData[i] = y;
			
			x = next[0];
			y = next[1];
			
			next = this.currentFractalFunction(x, y, a, b);
		}
		
		
		
		for (let i = 0; i < numSamples; i++)
		{
			unscaledLeftData[i] /= maxValue;
			unscaledRightData[i] /= maxValue;
		}
		
		
		
		for (let i = 0; i < numSamples - 1; i++)
		{
			for (let j = 0; j < samplesPerFrame; j++)
			{
				let t = .5 + .5 * Math.sin(Math.PI * j / samplesPerFrame - Math.PI / 2);
				
				leftData[samplesPerFrame * i + j] = (1 - t) * (unscaledLeftData[i] / 2) + t * (unscaledLeftData[i + 1] / 2);
				rightData[samplesPerFrame * i + j] = (1 - t) * (unscaledRightData[i] / 2) + t * (unscaledRightData[i + 1] / 2);
			}
		}
		
		
		
		let source = audioContext.createBufferSource();
		source.buffer = buffer;
		
		let audioGainNode = audioContext.createGain();
		source.connect(audioGainNode);
		audioGainNode.connect(audioContext.destination);

		source.start(0);
		audioGainNode.gain.exponentialRampToValueAtTime(.0001, numFrames / 44100);
	}
	
	
	
	onWheelCanvas(x, y, scrollAmount, event)
	{
		this.fixedPointX = x;
		this.fixedPointY = y;
		
		if (Math.abs(scrollAmount / 100) < .3)
		{
			this.zoomLevel += scrollAmount / 100;
			
			this.zoomLevel = Math.min(this.zoomLevel, 1);
		}
		
		else
		{
			this.zoomVelocity += Math.sign(scrollAmount) * .05;
		}
		
		this.lastX = x;
		this.lastY = y;
		this.zoomingWithMouse = true;
		
		this.zoomCanvas();
	}
	
	
	
	onPinchCanvas(x, y, touchDistanceDelta, event)
	{
		if (this.juliaMode === 2)
		{
			return;
		}
		
		
		
		if (this.aspectRatio >= 1)
		{
			this.zoomLevel -= touchDistanceDelta / this.wilsonLineDrawer.worldWidth * 10;
			
			this.nextZoomVelocity = -touchDistanceDelta / this.wilsonLineDrawer.worldWidth * 10;
		}
		
		else
		{
			this.zoomLevel -= touchDistanceDelta / this.wilsonLineDrawer.worldHeight * 10;
			
			this.nextZoomVelocity = -touchDistanceDelta / this.wilsonLineDrawer.worldHeight * 10;
		}
		
		this.zoomLevel = Math.min(this.zoomLevel, 1);
		
		this.fixedPointX = x;
		this.fixedPointY = y;
		
		this.zoomingWithMouse = false;
		
		this.zoomCanvas();
	}
	
	
	
	zoomCanvas()
	{
		if (this.aspectRatio >= 1)
		{
			const newWorldCenter = this.wilsonLineDrawer.input.getZoomedWorldCenter(this.fixedPointX, this.fixedPointY, 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio, 4 * Math.pow(2, this.zoomLevel));
			
			this.wilsonLineDrawer.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
			this.wilsonLineDrawer.worldHeight = 4 * Math.pow(2, this.zoomLevel);
			
			this.wilsonLineDrawer.worldCenterX = newWorldCenter[0];
			this.wilsonLineDrawer.worldCenterY = newWorldCenter[1];
		}
		
		else
		{
			const newWorldCenter = this.wilsonLineDrawer.input.getZoomedWorldCenter(this.fixedPointX, this.fixedPointY, 4 * Math.pow(2, this.zoomLevel), 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio);
			
			this.wilsonLineDrawer.worldWidth = 4 * Math.pow(2, this.zoomLevel);
			this.wilsonLineDrawer.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;
			
			this.wilsonLineDrawer.worldCenterX = this.newWorldCenter[0];
			this.wilsonLineDrawer.worldCenterY = this.newWorldCenter[1];
		}
		
		if (this.zoomingWithMouse)
		{
			this.showOrbit(this.lastX, this.lastY);
		}	
		
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
		
		
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterX"][0], this.wilsonLineDrawer.worldCenterX);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterY"][0], this.wilsonLineDrawer.worldCenterY);
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldSize"][0], Math.min(this.wilsonLineDrawer.worldHeight, this.wilsonLineDrawer.worldWidth) / 2);
		
		this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms["numIterations"][0], this.numIterations);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["exposure"][0], 1);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["brightnessScale"][0], 20 * (Math.abs(this.zoomLevel) + 1));
		
		this.wilsonHidden.render.drawFrame();
		
		
		
		const pixelData = this.wilsonHidden.render.getPixelData();
		
		let brightnesses = new Array(this.resolutionHidden * this.resolutionHidden);
		
		for (let i = 0; i < this.resolutionHidden * this.resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = (brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .96)] + brightnesses[Math.floor(this.resolutionHidden * this.resolutionHidden * .98)]) / 255 * 15 * (Math.abs(this.zoomLevel / 2) + 1);
		
		this.pastBrightnessScales.push(brightnessScale);
		
		const denom = this.pastBrightnessScales.length;
		
		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"][0], this.aspectRatio);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"][0], this.wilsonLineDrawer.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"][0], this.wilsonLineDrawer.worldCenterY);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldSize"][0], Math.min(this.wilsonLineDrawer.worldHeight, this.wilsonLineDrawer.worldWidth) / 2);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["numIterations"][0], this.numIterations);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["exposure"][0], this.exposure);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightnessScale"][0], brightnessScale);
		
		this.wilson.render.drawFrame();
		
		
		
		if (timeElapsed >= 50)
		{
			this.panVelocityX = 0;
			this.panVelocityY = 0;
			this.zoomVelocity = 0;
			
			this.nextPanVelocityX = 0;
			this.nextPanVelocityY = 0;
			this.nextZoomVelocity = 0;
		}
		
		
		
		if (this.panVelocityX !== 0 || this.panVelocityY !== 0 || this.zoomVelocity !== 0)
		{
			this.wilsonLineDrawer.worldCenterX += this.panVelocityX * this.wilsonLineDrawer.worldWidth;
			this.wilsonLineDrawer.worldCenterY += this.panVelocityY * this.wilsonLineDrawer.worldHeight;
			
			this.wilsonLineDrawer.worldCenterX = Math.min(Math.max(this.wilsonLineDrawer.worldCenterX, -2), 2);
			this.wilsonLineDrawer.worldCenterY = Math.min(Math.max(this.wilsonLineDrawer.worldCenterY, -2), 2);
			
			
			
			this.panVelocityX *= this.panFriction;
			this.panVelocityY *= this.panFriction;
			
			if (this.panVelocityX * this.panVelocityX + this.panVelocityY * this.panVelocityY < this.panVelocityStopThreshhold * this.panVelocityStopThreshhold)
			{
				this.panVelocityX = 0;
				this.panVelocityY = 0;
			}
			
			
			
			this.zoomLevel += this.zoomVelocity;
			
			this.zoomLevel = Math.min(this.zoomLevel, 1);
			
			this.zoomCanvas();
			
			this.zoomVelocity *= this.zoomFriction;
			
			if (Math.abs(this.zoomVelocity) < this.zoomVelocityStopThreshhold)
			{
				this.zoomVelocity = 0;
			}
			
			
			
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	switchFullscreen()
	{
		this.changeAspectRatio();
		
		try
		{
			document.body.querySelectorAll(".wilson-applet-canvas-container").forEach(element => element.style.setProperty("background-color", "rgba(0, 0, 0, 0)", "important"));
			
			document.body.querySelector(".wilson-exit-fullscreen-button").style.setProperty("z-index", "300", "important")
		}
		
		catch(ex) {}
		
		this.wilsonLineDrawer.fullscreen.switchFullscreen();
	}
	
	
	
	changeAspectRatio()
	{
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			this.aspectRatio = window.innerWidth / window.innerHeight;
			
			if (this.aspectRatio >= 1)
			{
				this.wilsonLineDrawer.changeCanvasSize(this.resolution, Math.floor(this.resolution / this.aspectRatio));
				this.wilson.changeCanvasSize(this.resolution, Math.floor(this.resolution / this.aspectRatio));
				
				this.wilsonLineDrawer.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
				this.wilsonLineDrawer.worldHeight = 4 * Math.pow(2, this.zoomLevel);
			}
			
			else
			{
				this.wilsonLineDrawer.changeCanvasSize(Math.floor(this.resolution * this.aspectRatio), this.resolution);
				this.wilson.changeCanvasSize(Math.floor(this.resolution * this.aspectRatio), this.resolution);
				
				this.wilsonLineDrawer.worldWidth = 4 * Math.pow(2, this.zoomLevel);
				this.wilsonLineDrawer.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;
			}
		}
		
		else
		{
			this.aspectRatio = 1;
			
			this.wilsonLineDrawer.changeCanvasSize(this.resolution, this.resolution);
			this.wilson.changeCanvasSize(this.resolution, this.resolution);
			
			this.wilsonLineDrawer.worldWidth = 4 * Math.pow(2, this.zoomLevel);
			this.wilsonLineDrawer.worldHeight = 4 * Math.pow(2, this.zoomLevel);
		}
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	}