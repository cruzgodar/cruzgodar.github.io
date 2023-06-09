!function()
{
	"use strict";
	
	
	
	let wilson = null;
	let wilsonHidden = null;
	
	
	
	let aspectRatio = 1;
	
	let numIterations = 100;
	
	let zoomLevel = 1;
	
	let pastBrightnessScales = [];
	
	let resolution = 500;
	let resolutionHidden = 100;
	
	let fixedPointX = 0;
	let fixedPointY = 0;
	
	let nextPanVelocityX = 0;
	let nextPanVelocityY = 0;
	let nextZoomVelocity = 0;
	
	let panVelocityX = 0;
	let panVelocityY = 0;
	let zoomVelocity = 0;
	
	const panFriction = .96;
	const panVelocityStartThreshhold = .005;
	const panVelocityStopThreshhold = .0005;
	
	const zoomFriction = .93;
	const zoomVelocityStartThreshhold = .01;
	const zoomVelocityStopThreshhold = .001;
	
	let lastTimestamp = -1;
	
	
	
	
	
	let generatingStringInputElement = Page.element.querySelector("#generating-string-input");
	
	
	
	let generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", useNewCode);
	
	
	

	let resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		resolution = parseInt(resolutionInputElement.value || 500);
		
		wilson.changeCanvasSize(resolution, resolution);
		
		window.requestAnimationFrame(drawFrame);
	});
	
	
	
	let downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-lyapunov-fractal.png");
	});
	
	
	
	let canvasLocationElement = Page.element.querySelector("#canvas-location");
	
	
	
	useNewCode();
	
	
	
	Page.show();
	
	
	
	function useNewCode()
	{
		let generatingString = (generatingStringInputElement.value || "AB").toUpperCase();
		
		let generatingCode = [];
		
		for (let i = 0; i < generatingString.length; i++)
		{
			if (generatingString[i] === "B")
			{
				generatingCode.push(1);
			}
			
			else
			{
				generatingCode.push(0);
			}
		}
		
		
		
		let fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float brightnessScale;
			
			uniform int seq[12];
			
			
			
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
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				float x = .5;
				
				float lambda = 0.0;
				
				vec3 color = vec3(0.0, 0.0, 0.0);
				
				for (int iteration = 0; iteration < ${Math.floor(250 / generatingString.length)}; iteration++)
				{
					for (int index = 0; index < ${generatingString.length}; index++)
					{
						if (seq[index] == 0)
						{
							x = z.x * x * (1.0 - x);
							
							color.x += abs(z.x) / 40.0;
						}
						
						else
						{
							x = z.y * x * (1.0 - x);
							
							color.y += abs(z.y) / 40.0;
						}
						
						lambda += log(abs(1.0 - 2.0*x));
						
						color.z = -lambda / 100.0;
					}
				}
				
				lambda /= 10000.0;
				
				if (lambda <= 0.0)
				{
					gl_FragColor = vec4(-lambda / brightnessScale * color, 1.0);
					
					return;
				}
			}
		`;
		


		let options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 500,
			canvasHeight: 500,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 2,
			worldCenterY: 2,
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: changeAspectRatio,
			
			
			
			mousedownCallback: onGrabCanvas,
			touchstartCallback: onGrabCanvas,
			
			mousedragCallback: onDragCanvas,
			touchmoveCallback: onDragCanvas,
			
			mouseupCallback: onReleaseCanvas,
			touchendCallback: onReleaseCanvas,
			
			wheelCallback: onWheelCanvas,
			pinchCallback: onPinchCanvas
		};
		
		let optionsHidden =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 100,
			canvasHeight: 100
		};
		
		
		
		try
		{
			wilson.outputCanvasContainer.parentNode.remove();
			wilsonHidden.outputCanvasContainer.parentNode.remove();
			
			canvasLocationElement.insertAdjacentHTML("beforebegin", `
				<div>
					<canvas id="output-canvas" class="output-canvas"></canvas>
					<canvas id="hidden-canvas" class="hidden-canvas"></canvas>
				</div>
			`);
		}
		
		catch(ex) {}
		
		
		
		wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);

		wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "brightnessScale", "seq"]);
		
		
		
		wilsonHidden = new Wilson(Page.element.querySelector("#hidden-canvas"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "brightnessScale", "seq"]);
		
		
		
		pastBrightnessScales = [];
		
		zoomLevel = .415;
		
		nextPanVelocityX = 0;
		nextPanVelocityY = 0;
		nextZoomVelocity = 0;
		
		panVelocityX = 0;
		panVelocityY = 0;
		zoomVelocity = 0;
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], 1);
		
		wilson.gl.uniform1iv(wilson.uniforms["seq"], generatingCode);
		wilsonHidden.gl.uniform1iv(wilsonHidden.uniforms["seq"], generatingCode);
		
		
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function onGrabCanvas(x, y, event)
	{
		panVelocityX = 0;
		panVelocityY = 0;
		zoomVelocity = 0;
		
		nextPanVelocityX = 0;
		nextPanVelocityY = 0;
		nextZoomVelocity = 0;
	}
	
	
	
	function onDragCanvas(x, y, xDelta, yDelta, event)
	{
		wilson.worldCenterX -= xDelta;
		wilson.worldCenterY -= yDelta;
		
		wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, wilson.worldWidth / 2), 4 - wilson.worldWidth / 2);
		wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, wilson.worldHeight / 2), 4 - wilson.worldHeight / 2);
		
		
		
		nextPanVelocityX = -xDelta;
		nextPanVelocityY = -yDelta;
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function onReleaseCanvas(x, y, event)
	{
		if (Math.sqrt(nextPanVelocityX * nextPanVelocityX + nextPanVelocityY * nextPanVelocityY) >= panVelocityStartThreshhold * Math.min(wilson.worldWidth, wilson.worldHeight))
		{
			panVelocityX = nextPanVelocityX;
			panVelocityY = nextPanVelocityY;
		}
		
		if (Math.abs(nextZoomVelocity) >= zoomVelocityStartThreshhold)
		{
			zoomVelocity = nextZoomVelocity;
		}
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function onWheelCanvas(x, y, scrollAmount, event)
	{
		fixedPointX = x;
		fixedPointY = y;
		
		if (Math.abs(scrollAmount / 100) < .3)
		{
			zoomLevel += scrollAmount / 100;
		}
		
		else
		{
			zoomVelocity += Math.sign(scrollAmount) * .05;
		}
		
		zoomLevel = Math.min(zoomLevel, .415);
		
		zoomCanvas();
	}
	
	
	
	function onPinchCanvas(x, y, touchDistanceDelta, event)
	{
		if (aspectRatio >= 1)
		{
			zoomLevel -= touchDistanceDelta / wilson.worldWidth * 10;
			
			nextZoomVelocity = -touchDistanceDelta / wilson.worldWidth * 10;
		}
		
		else
		{
			zoomLevel -= touchDistanceDelta / wilson.worldHeight * 10;
			
			nextZoomVelocity = -touchDistanceDelta / wilson.worldHeight * 10;
		}
		
		zoomLevel = Math.min(zoomLevel, .415);
		
		fixedPointX = x;
		fixedPointY = y;
		
		zoomCanvas();
	}
	
	
	
	function zoomCanvas()
	{
		//This is backward from how it usually is, since we don't want to expand the viewport in fullscreen.
		if (aspectRatio < 1)
		{
			let newWorldCenter = wilson.input.getZoomedWorldCenter(fixedPointX, fixedPointY, 3 * Math.pow(2, zoomLevel) * aspectRatio, 3 * Math.pow(2, zoomLevel));
			
			wilson.worldWidth = 3 * Math.pow(2, zoomLevel) * aspectRatio;
			wilson.worldHeight = 3 * Math.pow(2, zoomLevel);
			
			wilson.worldCenterX = newWorldCenter[0];
			wilson.worldCenterY = newWorldCenter[1];
		}
		
		else
		{
			let newWorldCenter = wilson.input.getZoomedWorldCenter(fixedPointX, fixedPointY, 3 * Math.pow(2, zoomLevel), 3 * Math.pow(2, zoomLevel) / aspectRatio);
			
			wilson.worldWidth = 3 * Math.pow(2, zoomLevel);
			wilson.worldHeight = 3 * Math.pow(2, zoomLevel) / aspectRatio;
			
			wilson.worldCenterX = newWorldCenter[0];
			wilson.worldCenterY = newWorldCenter[1];
		}
		
		wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, wilson.worldWidth / 2), 4 - wilson.worldWidth / 2);
		wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, wilson.worldHeight / 2), 4 - wilson.worldHeight / 2);
		
		window.requestAnimationFrame(drawFrame);
	}
	


	function drawFrame(timestamp)
	{
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], aspectRatio);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterX"], wilson.worldCenterX);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterY"], wilson.worldCenterY);
		
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
		
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["brightnessScale"], 20);
		
		wilsonHidden.render.drawFrame();
		
		
		
		let pixelData = wilsonHidden.render.getPixelData();
		
		let brightnesses = new Array(resolutionHidden * resolutionHidden);
		
		for (let i = 0; i < resolutionHidden * resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = (brightnesses[Math.floor(resolutionHidden * resolutionHidden * .96)] + brightnesses[Math.floor(resolutionHidden * resolutionHidden * .98)]) / 255 * 6;
		
		pastBrightnessScales.push(brightnessScale);
		
		let denom = pastBrightnessScales.length;
		
		if (denom > 10)
		{
			pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], aspectRatio);
		wilson.gl.uniform1f(wilson.uniforms["worldCenterX"], wilson.worldCenterX);
		wilson.gl.uniform1f(wilson.uniforms["worldCenterY"], wilson.worldCenterY);
		
		wilson.gl.uniform1f(wilson.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
		
		wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
		
		wilson.render.drawFrame();
		
		
		
		if (timeElapsed >= 50)
		{
			panVelocityX = 0;
			panVelocityY = 0;
			zoomVelocity = 0;
			
			nextPanVelocityX = 0;
			nextPanVelocityY = 0;
			nextZoomVelocity = 0;
		}
		
		
		
		if (panVelocityX !== 0 || panVelocityY !== 0 || zoomVelocity !== 0)
		{
			wilson.worldCenterX += panVelocityX;
			wilson.worldCenterY += panVelocityY;
			
			
			
			panVelocityX *= panFriction;
			panVelocityY *= panFriction;
			
			if (Math.sqrt(panVelocityX * panVelocityX + panVelocityY * panVelocityY) < panVelocityStopThreshhold * Math.min(wilson.worldWidth, wilson.worldHeight))
			{
				panVelocityX = 0;
				panVelocityY = 0;
			}
			
			
			
			zoomLevel += zoomVelocity;
			
			zoomLevel = Math.min(zoomLevel, .415);
			
			zoomCanvas(fixedPointX, fixedPointY);
			
			zoomVelocity *= zoomFriction;
			
			if (Math.abs(zoomVelocity) < zoomVelocityStopThreshhold)
			{
				zoomVelocity = 0;
			}
			
			
			
			wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, wilson.worldWidth / 2), 4 - wilson.worldWidth / 2);
			wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, wilson.worldHeight / 2), 4 - wilson.worldHeight / 2);
			
			
			
			window.requestAnimationFrame(drawFrame);
		}
	}
	
	
	
	function changeAspectRatio()
	{
		if (wilson.fullscreen.currentlyFullscreen)
		{
			aspectRatio = window.innerWidth / window.innerHeight;
			
			if (aspectRatio >= 1)
			{
				wilson.changeCanvasSize(resolution, Math.floor(resolution / aspectRatio));
				
				//This is backward from how it usually is, since we don't want to expand the viewport in fullscreen.
				wilson.worldWidth = 3 * Math.pow(2, zoomLevel);
				wilson.worldHeight = 3 * Math.pow(2, zoomLevel) / aspectRatio;
			}
			
			else
			{
				wilson.changeCanvasSize(Math.floor(resolution * aspectRatio), resolution);
				
				//This is backward from how it usually is, since we don't want to expand the viewport in fullscreen.
				wilson.worldWidth = 3 * Math.pow(2, zoomLevel) * aspectRatio;
				wilson.worldHeight = 3 * Math.pow(2, zoomLevel);
			}
		}
		
		else
		{
			aspectRatio = 1;
			
			wilson.changeCanvasSize(resolution, resolution);
			
			wilson.worldWidth = 3 * Math.pow(2, zoomLevel);
			wilson.worldHeight = 3 * Math.pow(2, zoomLevel);
		}
		
		
		
		wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, wilson.worldWidth / 2), 4 - wilson.worldWidth / 2);
		wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, wilson.worldHeight / 2), 4 - wilson.worldHeight / 2);
		
		
		
		window.requestAnimationFrame(drawFrame);
	}

	window.addEventListener("resize", changeAspectRatio);
	Page.temporaryHandlers["resize"].push(changeAspectRatio);
	}()