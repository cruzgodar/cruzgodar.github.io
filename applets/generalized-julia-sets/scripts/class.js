"use strict";

class GeneralizedJuliaSet extends Applet
{
	loadPromise = null;
	
	generatingCode = "cadd(cpow(z, 2.0), c)";
	
	wilsonHidden = null;
	
	switchJuliaModeButtonElement = null;
	
	juliaMode = 0;
	
	aspectRatio = 1;
	
	numIterations = 200;
	
	exposure = 1;
	
	zoomLevel = 0;
	
	pastBrightnessScales = [];
	
	a = 0;
	b = 0;
	
	resolution = 500;
	resolutionHidden = 50;
	
	fixedPointX = 0;
	fixedPointY = 0;
	
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
	
	
	
	constructor(canvas, generatingCode, switchJuliaModeButtonElement = null)
	{
		super(canvas);
		
		this.switchJuliaModeButtonElement = switchJuliaModeButtonElement;
		
		const hiddenCanvas = this.createHiddenCanvas();
		
		
		
		const tempShader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: this.changeAspectRatio.bind(this),
			
			
			
			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),
			
			mousemoveCallback: this.onHoverCanvas.bind(this),
			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),
			
			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this),
			
			wheelCallback: this.onWheelCanvas.bind(this),
			pinchCallback: this.onPinchCanvas.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		const optionsHidden =
		{
			renderer: "gpu",
			
			shader: tempShader,
			
			canvasWidth: this.resolutionHidden,
			canvasHeight: this.resolutionHidden
		};
		
		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);
		
		
		
		const boundFunction = this.changeAspectRatio.bind(this);
		window.addEventListener("resize", boundFunction);
		this.handlers.push([window, "resize", boundFunction]);
		
		this.loadPromise = new Promise(async (resolve, reject) =>
		{
			await Site.loadGLSL();
			
			resolve();
		});
	}
	
	
	
	run(generatingCode = "cpow(z, 2.0) + c", resolution = 500, exposure = 1, numIterations = 200)
	{
		this.generatingCode = generatingCode;
		
		this.resolution = resolution;
		this.exposure = exposure;
		this.numIterations = numIterations;
		
		
		
		const fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform int juliaMode;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform float exposure;
			uniform int numIterations;
			uniform float brightnessScale;
			
			
			
			${Site.getGlslBundle(generatingCode)}
			
			
			
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
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				if (juliaMode == 0)
				{
					vec2 c = z;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 1000.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
				}
				
				
				
				else if (juliaMode == 1)
				{
					vec2 c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * exposure * color, 1.0);
				}
				
				
				
				else
				{
					vec2 c = z;
					
					bool broken = false;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightnessScale * exposure * color, 1.0);
					}
					
					
					
					z = vec2(uv.x * aspectRatio * 2.0, uv.y * 2.0);
					color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
					brightness = exp(-length(z));
					
					broken = false;
					
					c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == numIterations)
						{
							gl_FragColor.xyz /= 4.0;
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generatingCode};
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightnessScale * exposure * color, 0.0);
					}
				}
			}
		`;
		
		
		
		this.wilson.render.shaderPrograms = [];
		this.wilson.render.loadNewShader(fragShaderSource);
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.render.initUniforms(["juliaMode", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "exposure", "numIterations", "brightnessScale"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], 1);
		
		this.wilsonHidden.render.shaderPrograms = [];
		this.wilsonHidden.render.loadNewShader(fragShaderSource);
		this.wilsonHidden.gl.useProgram(this.wilsonHidden.render.shaderPrograms[0]);
		this.wilsonHidden.render.initUniforms(["juliaMode", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "exposure", "numIterations", "brightnessScale"]);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);
		
		this.nextPanVelocityX = 0;
		this.nextPanVelocityY = 0;
		this.nextZoomVelocity = 0;
		
		this.panVelocityX = 0;
		this.panVelocityY = 0;
		this.zoomVelocity = 0;
		
		this.wilson.worldWidth = 4;
		this.wilson.worldHeight = 4;
		this.wilson.worldCenterX = 0;
		this.wilson.worldCenterY = 0;
		
		this.juliaMode = 0;
		this.zoomLevel = 0;
		
		this.pastBrightnessScales = [];
		
		
		
		//Render the inital frame.
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["aspectRatio"], 1);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	switchJuliaMode()
	{
		try
		{
			Page.Animate.changeOpacity(this.switchJuliaModeButtonElement, 0, Site.opacityAnimationTime);
			
			setTimeout(() =>
			{
				if (this.juliaMode === 2)
				{
					this.switchJuliaModeButtonElement.textContent = "Return to Mandelbrot Set";
				}
				
				else if (this.juliaMode === 0)
				{
					this.switchJuliaModeButtonElement.textContent = "Pick Julia Set";
					
					Page.Animate.changeOpacity(this.switchJuliaModeButtonElement, 1, Site.opacityAnimationTime);
				}
			}, Site.opacityAnimationTime);
		}
		
		catch(ex) {}
		
		
		
		if (this.juliaMode === 0)
		{
			this.juliaMode = 2;
			
			this.a = 0;
			this.b = 0;
			
			this.panVelocityX = 0;
			this.panVelocityY = 0;
			this.zoomVelocity = 0;
			
			this.nextPanVelocityX = 0;
			this.nextPanVelocityY = 0;
			this.nextZoomVelocity = 0;
			
			this.pastBrightnessScales = [];
			
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
		
		else if (this.juliaMode === 1)
		{
			this.juliaMode = 0;
			
			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;
			this.zoomLevel = 0;
			
			this.pastBrightnessScales = [];
			
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	onGrabCanvas(x, y, event)
	{
		this.panVelocityX = 0;
		this.panVelocityY = 0;
		this.zoomVelocity = 0;
		
		this.nextPanVelocityX = 0;
		this.nextPanVelocityY = 0;
		this.nextZoomVelocity = 0;
		
		
		
		if (this.juliaMode === 2 && event.type === "mousedown")
		{
			this.juliaMode = 1;
			
			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;
			this.zoomLevel = 0;
			
			this.pastBrightnessScales = [];
			
			try {Page.Animate.changeOpacity(this.switchJuliaModeButtonElement, 1, Site.opacityAnimationTime)}
			catch(ex) {}
			
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "touchmove")
		{
			this.a = x;
			this.b = y;
		}
		
		else
		{
			this.wilson.worldCenterX -= xDelta;
			this.wilson.worldCenterY -= yDelta;
			
			this.nextPanVelocityX = -xDelta / this.wilson.worldWidth;
			this.nextPanVelocityY = -yDelta / this.wilson.worldHeight;
		}
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	onHoverCanvas(x, y, xDelta, yDelta, event)
	{
		if (this.juliaMode === 2 && event.type === "mousemove")
		{
			this.a = x;
			this.b = y;
			
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	onReleaseCanvas(x, y, event)
	{
		if (this.juliaMode === 2 && event.type === "touchend")
		{
			this.juliaMode = 1;
			
			this.wilson.worldCenterX = 0;
			this.wilson.worldCenterY = 0;
			this.wilson.worldWidth = 4;
			this.wilson.worldHeight = 4;
			this.zoomLevel = 0;
			
			this.pastBrightnessScales = [];
			
			try {Page.Animate.changeOpacity(this.switchJuliaModeButtonElement, 1, Site.opacityAnimationTime)}
			catch(ex) {}
		}
		
		else
		{
			if (this.nextPanVelocityX * this.nextPanVelocityX + this.nextPanVelocityY * this.nextPanVelocityY >= this.panVelocityStartThreshhold * this.panVelocityStartThreshhold)
			{
				this.panVelocityX = this.nextPanVelocityX;
				this.panVelocityY = this.nextPanVelocityY;
			}
			
			if (Math.abs(this.nextZoomVelocity) >= this.zoomVelocityStartThreshhold)
			{
				this.zoomVelocity = this.nextZoomVelocity;
			}
		}
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
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
			this.zoomLevel -= touchDistanceDelta / this.wilson.worldWidth * 10;
			
			this.nextZoomVelocity = -touchDistanceDelta / this.wilson.worldWidth * 10;
		}
		
		else
		{
			this.zoomLevel -= touchDistanceDelta / this.wilson.worldHeight * 10;
			
			this.nextZoomVelocity = -touchDistanceDelta / this.wilson.worldHeight * 10;
		}
		
		this.zoomLevel = Math.min(this.zoomLevel, 1);
		
		this.fixedPointX = x;
		this.fixedPointY = y;
		
		this.zoomCanvas();
	}
	
	
	
	zoomCanvas()
	{
		if (this.aspectRatio >= 1)
		{
			const newWorldCenter = this.wilson.input.getZoomedWorldCenter(this.fixedPointX, this.fixedPointY, 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio, 4 * Math.pow(2, this.zoomLevel));
			
			this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
			this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);
			
			this.wilson.worldCenterX = newWorldCenter[0];
			this.wilson.worldCenterY = newWorldCenter[1];
		}
		
		else
		{
			const newWorldCenter = this.wilson.input.getZoomedWorldCenter(this.fixedPointX, this.fixedPointY, 4 * Math.pow(2, this.zoomLevel), 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio);
			
			this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
			this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;
			
			this.wilson.worldCenterX = newWorldCenter[0];
			this.wilson.worldCenterY = newWorldCenter[1];
		}
		
		this.numIterations = (-this.zoomLevel * 30) + 200;
		
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
		
		
		
		this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms["juliaMode"], this.juliaMode);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilsonHidden.gl.uniform1i(this.wilsonHidden.uniforms["numIterations"], this.numIterations);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["exposure"], 1);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["a"], this.a);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["b"], this.b);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["brightnessScale"], 20 * (Math.abs(this.zoomLevel) + 1));
		
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
		
		let denom = this.pastBrightnessScales.length;
		
		if (denom > 10)
		{
			this.pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(this.pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["juliaMode"], this.juliaMode);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspectRatio"], this.aspectRatio);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterX"], this.wilson.worldCenterX);
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldCenterY"], this.wilson.worldCenterY);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["worldSize"], Math.min(this.wilson.worldHeight, this.wilson.worldWidth) / 2);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["numIterations"], this.numIterations);
		this.wilson.gl.uniform1f(this.wilson.uniforms["exposure"], this.exposure);
		this.wilson.gl.uniform1f(this.wilson.uniforms["a"], this.a);
		this.wilson.gl.uniform1f(this.wilson.uniforms["b"], this.b);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightnessScale"], brightnessScale);
		
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
			this.wilson.worldCenterX += this.panVelocityX * this.wilson.worldWidth;
			this.wilson.worldCenterY += this.panVelocityY * this.wilson.worldHeight;
			
			
			
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
	
	
	
	changeAspectRatio()
	{
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			this.aspectRatio = window.innerWidth / window.innerHeight;
			
			if (this.aspectRatio >= 1)
			{
				this.wilson.changeCanvasSize(this.resolution, Math.floor(this.resolution / this.aspectRatio));
				
				this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel) * this.aspectRatio;
				this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);
			}
			
			else
			{
				this.wilson.changeCanvasSize(Math.floor(this.resolution * this.aspectRatio), this.resolution);
				
				this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
				this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel) / this.aspectRatio;
			}
		}
		
		else
		{
			this.aspectRatio = 1;
			
			this.wilson.changeCanvasSize(this.resolution, this.resolution);
			
			this.wilson.worldWidth = 4 * Math.pow(2, this.zoomLevel);
			this.wilson.worldHeight = 4 * Math.pow(2, this.zoomLevel);
		}
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	}