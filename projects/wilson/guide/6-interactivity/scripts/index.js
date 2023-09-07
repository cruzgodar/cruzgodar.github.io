import { showPage } from "/scripts/src/load-page.mjs";
import {
	$,
	$$,
	addTemporaryListener
} from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

!function()
{
	"use strict";
	
	
	
	let elements = $$("pre code");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.add("highlightable");
	}
	
	hljs.highlightAll();
	
	
	
	{
		let fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			
			uniform float a;
			uniform float b;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * 2.0 + worldCenterX, uv.y * 2.0 + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * 2.0 + worldCenterX, uv.y / aspectRatio * 2.0 + worldCenterY);
				}
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				vec2 c = vec2(a, b);
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (iteration == 99)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		let options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 1000,
			canvasHeight: 1000,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0,
			
			
			
			useDraggables: true,
			
			draggablesMousemoveCallback: onDrag,
			draggablesTouchmoveCallback: onDrag,
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: changeAspectRatio,
			
			
			
			mousedragCallback: onDragCanvas,
			touchmoveCallback: onDragCanvas
		};
		
		let optionsHidden =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 100,
			canvasHeight: 100
		};
		
		
		
		let wilson = new Wilson($("#output-canvas-1"), options);

		wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "a", "b", "brightnessScale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilsonHidden = new Wilson($("#hidden-canvas-1"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "a", "b", "brightnessScale"]);
		
		
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilsonHidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
		let aspectRatio = 1;
		
		let a = 0;
		let b = 1;
		
		let resolution = 1000;
		let resolutionHidden = 100;
		
		let lastTimestamp = -1;
		
		

		let resolutionInputElement = $("#resolution-1-input");
		
		resolutionInputElement.addEventListener("input", () =>
		{
			resolution = parseInt(resolutionInputElement.value || 1000);
			
			wilson.changeCanvasSize(resolution, resolution);
		});
		
		
		
		let downloadButtonElement = $("#download-1-button");
		
		downloadButtonElement.addEventListener("click", () =>
		{
			wilson.downloadFrame("a-julia-set.png");
		});
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], 1);
		
		window.requestAnimationFrame(drawJuliaSet);
		
		
		
		function onDrag(activeDraggable, x, y, event)
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(drawJuliaSet);
		}
		
		
		
		function onDragCanvas(x, y, xDelta, yDelta, event)
		{
			wilson.worldCenterX -= xDelta;
			wilson.worldCenterY -= yDelta;
			
			wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, -2), 2);
			wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, -2), 2);
			
			window.requestAnimationFrame(drawJuliaSet);
			
			wilson.draggables.recalculateLocations();
		}



		function drawJuliaSet(timestamp)
		{
			let timeElapsed = timestamp - lastTimestamp;
			
			lastTimestamp = timestamp;
			
			
			
			if (timeElapsed === 0)
			{
				return;
			}
			
			
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterX"], wilson.worldCenterX);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterY"], wilson.worldCenterY);
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["a"], a);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["b"], b);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["brightnessScale"], 20);
			
			wilsonHidden.render.drawFrame();
			
			
			
			let pixelData = wilsonHidden.render.getPixelData();
			
			let brightnesses = new Array(resolutionHidden * resolutionHidden);
			
			for (let i = 0; i < resolutionHidden * resolutionHidden; i++)
			{
				brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
			}
			
			brightnesses.sort((a, b) => a - b);
			
			let brightnessScale = brightnesses[Math.floor(resolutionHidden * resolutionHidden * .98)] / 255 * 18;
			
			brightnessScale = Math.max(brightnessScale, .1);
			
			
			
			wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], aspectRatio);
			
			wilson.gl.uniform1f(wilson.uniforms["worldCenterX"], wilson.worldCenterX);
			wilson.gl.uniform1f(wilson.uniforms["worldCenterY"], wilson.worldCenterY);
			
			wilson.gl.uniform1f(wilson.uniforms["a"], a);
			wilson.gl.uniform1f(wilson.uniforms["b"], b);
			wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
			
			wilson.render.drawFrame();
		}
		
		
		
		function changeAspectRatio()
		{
			if (wilson.fullscreen.currentlyFullscreen)
			{
				aspectRatio = window.innerWidth / window.innerHeight;
				
				if (aspectRatio >= 1)
				{
					wilson.changeCanvasSize(resolution, Math.floor(resolution / aspectRatio));
					
					wilson.worldWidth = 4 * aspectRatio;
					wilson.worldHeight = 4;
				}
				
				else
				{
					wilson.changeCanvasSize(Math.floor(resolution * aspectRatio), resolution);
					
					wilson.worldWidth = 4;
					wilson.worldHeight = 4 / aspectRatio;
				}
			}
			
			else
			{
				aspectRatio = 1;
				
				wilson.changeCanvasSize(resolution, resolution);
				
				wilson.worldWidth = 4;
				wilson.worldHeight = 4;
			}
			
			window.requestAnimationFrame(drawJuliaSet);
		}

		addTemporaryListener({
			object: window,
			event: "resize",
			callback: changeAspectRatio
		});
	}
	
	
	
	
	{
		let fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform float brightnessScale;
			
			
			
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
				
				
				
				vec2 c = vec2(a, b);
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (iteration == 99)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		let options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 1000,
			canvasHeight: 1000,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0,
			
			
			
			useDraggables: true,
			
			draggablesMousemoveCallback: onDrag,
			draggablesTouchmoveCallback: onDrag,
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: changeAspectRatio,
			
			
			
			mousedragCallback: onDragCanvas,
			touchmoveCallback: onDragCanvas,
			
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
		
		
		
		let wilson = new Wilson($("#output-canvas-2"), options);

		wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "brightnessScale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilsonHidden = new Wilson($("#hidden-canvas-2"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "brightnessScale"]);
		
		
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilsonHidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
		let aspectRatio = 1;
		
		let zoomLevel = 0;
		
		let a = 0;
		let b = 1;
		
		let resolution = 1000;
		let resolutionHidden = 100;
		
		let fixedPointX = 0;
		let fixedPointY = 0;
		
		let lastTimestamp = -1;
		
		

		let resolutionInputElement = $("#resolution-2-input");
		
		resolutionInputElement.addEventListener("input", () =>
		{
			resolution = parseInt(resolutionInputElement.value || 1000);
			
			wilson.changeCanvasSize(resolution, resolution);
		});
		
		
		
		let downloadButtonElement = $("#download-2-button");
		
		downloadButtonElement.addEventListener("click", () =>
		{
			wilson.downloadFrame("a-julia-set.png");
		});
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], 1);
		
		window.requestAnimationFrame(drawJuliaSet);
		
		
		
		function onDrag(activeDraggable, x, y, event)
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(drawJuliaSet);
		}
		
		
		
		function onDragCanvas(x, y, xDelta, yDelta, event)
		{
			wilson.worldCenterX -= xDelta;
			wilson.worldCenterY -= yDelta;
			
			wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, -2), 2);
			wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, -2), 2);
			
			window.requestAnimationFrame(drawJuliaSet);
			
			wilson.draggables.recalculateLocations();
		}
		
		
		
		function onWheelCanvas(x, y, scrollAmount, event)
		{
			fixedPointX = x;
			fixedPointY = y;
			
			zoomLevel += scrollAmount / 100;
			
			zoomLevel = Math.min(zoomLevel, 1);
			
			zoomCanvas(x, y);
		}
		
		
		
		function onPinchCanvas(x, y, touchDistanceDelta, event)
		{
			if (aspectRatio >= 1)
			{
				zoomLevel -= touchDistanceDelta / wilson.worldWidth * 10;
			}
			
			else
			{
				zoomLevel -= touchDistanceDelta / wilson.worldHeight * 10;
			}
			
			zoomLevel = Math.min(zoomLevel, 1);
			
			fixedPointX = x;
			fixedPointY = y;
			
			zoomCanvas();
		}
		
		
		
		function zoomCanvas()
		{
			if (aspectRatio >= 1)
			{
				let newWorldCenter = wilson.input.getZoomedWorldCenter(fixedPointX, fixedPointY, 4 * Math.pow(2, zoomLevel) * aspectRatio, 4 * Math.pow(2, zoomLevel));
				
				wilson.worldWidth = 4 * Math.pow(2, zoomLevel) * aspectRatio;
				wilson.worldHeight = 4 * Math.pow(2, zoomLevel);
				
				wilson.worldCenterX = newWorldCenter[0];
				wilson.worldCenterY = newWorldCenter[1];
			}
			
			else
			{
				let newWorldCenter = wilson.input.getZoomedWorldCenter(fixedPointX, fixedPointY, 4 * Math.pow(2, zoomLevel), 4 * Math.pow(2, zoomLevel) / aspectRatio);
				
				wilson.worldWidth = 4 * Math.pow(2, zoomLevel);
				wilson.worldHeight = 4 * Math.pow(2, zoomLevel) / aspectRatio;
				
				wilson.worldCenterX = newWorldCenter[0];
				wilson.worldCenterY = newWorldCenter[1];
			}
			
			window.requestAnimationFrame(drawJuliaSet);
			
			wilson.draggables.recalculateLocations();
		}



		function drawJuliaSet(timestamp)
		{
			let timeElapsed = timestamp - lastTimestamp;
			
			lastTimestamp = timestamp;
			
			
			
			if (timeElapsed === 0)
			{
				return;
			}
			
			
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterX"], wilson.worldCenterX);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterY"], wilson.worldCenterY);
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["a"], a);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["b"], b);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["brightnessScale"], 20);
			
			wilsonHidden.render.drawFrame();
			
			
			
			let pixelData = wilsonHidden.render.getPixelData();
			
			let brightnesses = new Array(resolutionHidden * resolutionHidden);
			
			for (let i = 0; i < resolutionHidden * resolutionHidden; i++)
			{
				brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
			}
			
			brightnesses.sort((a, b) => a - b);
			
			let brightnessScale = brightnesses[Math.floor(resolutionHidden * resolutionHidden * .98)] / 255 * 18;
			
			brightnessScale = Math.max(brightnessScale, .1);
			
			
			
			wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], aspectRatio);
			
			wilson.gl.uniform1f(wilson.uniforms["worldCenterX"], wilson.worldCenterX);
			wilson.gl.uniform1f(wilson.uniforms["worldCenterY"], wilson.worldCenterY);
			
			wilson.gl.uniform1f(wilson.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
			
			wilson.gl.uniform1f(wilson.uniforms["a"], a);
			wilson.gl.uniform1f(wilson.uniforms["b"], b);
			wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
			
			wilson.render.drawFrame();
		}
		
		
		
		function changeAspectRatio()
		{
			if (wilson.fullscreen.currentlyFullscreen)
			{
				aspectRatio = window.innerWidth / window.innerHeight;
				
				if (aspectRatio >= 1)
				{
					wilson.changeCanvasSize(resolution, Math.floor(resolution / aspectRatio));
					
					wilson.worldWidth = 4 * Math.pow(2, zoomLevel) * aspectRatio;
					wilson.worldHeight = 4 * Math.pow(2, zoomLevel);
				}
				
				else
				{
					wilson.changeCanvasSize(Math.floor(resolution * aspectRatio), resolution);
					
					wilson.worldWidth = 4 * Math.pow(2, zoomLevel);
					wilson.worldHeight = 4 * Math.pow(2, zoomLevel) / aspectRatio;
				}
			}
			
			else
			{
				aspectRatio = 1;
				
				wilson.changeCanvasSize(resolution, resolution);
				
				wilson.worldWidth = 4 * Math.pow(2, zoomLevel);
				wilson.worldHeight = 4 * Math.pow(2, zoomLevel);
			}
			
			window.requestAnimationFrame(drawJuliaSet);
		}

		addTemporaryListener({
			object: window,
			event: "resize",
			callback: changeAspectRatio
		});
	}
	
	
	
	
	
	{
		let fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float a;
			uniform float b;
			uniform float brightnessScale;
			
			
			
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
				
				
				
				vec2 c = vec2(a, b);
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (iteration == 99)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
			}
		`;



		let options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 1000,
			canvasHeight: 1000,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0,
			
			
			
			useDraggables: true,
			
			draggablesMousemoveCallback: onDrag,
			draggablesTouchmoveCallback: onDrag,
			
			
			
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
		
		
		
		let wilson = new Wilson($("#output-canvas-3"), options);

		wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "brightnessScale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilsonHidden = new Wilson($("#hidden-canvas-3"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "brightnessScale"]);
		
		
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilsonHidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
		let aspectRatio = 1;
		
		let zoomLevel = 0;
		
		let a = 0;
		let b = 1;
		
		let resolution = 1000;
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
		
		

		let resolutionInputElement = $("#resolution-3-input");
		
		resolutionInputElement.addEventListener("input", () =>
		{
			resolution = parseInt(resolutionInputElement.value || 1000);
			
			wilson.changeCanvasSize(resolution, resolution);
		});
		
		
		
		let downloadButtonElement = $("#download-3-button");
		
		downloadButtonElement.addEventListener("click", () =>
		{
			wilson.downloadFrame("a-julia-set.png");
		});
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], 1);
		
		window.requestAnimationFrame(drawJuliaSet);
		
		
		
		function onDrag(activeDraggable, x, y, event)
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(drawJuliaSet);
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
			
			nextPanVelocityX = -xDelta;
			nextPanVelocityY = -yDelta;
			
			wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, -2), 2);
			wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, -2), 2);
			
			window.requestAnimationFrame(drawJuliaSet);
			
			wilson.draggables.recalculateLocations();
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
			
			window.requestAnimationFrame(drawJuliaSet);
		}
		
		
		
		function onWheelCanvas(x, y, scrollAmount, event)
		{
			fixedPointX = x;
			fixedPointY = y;
			
			if (Math.abs(scrollAmount / 100) < .3)
			{
				zoomLevel += scrollAmount / 100;
				
				zoomLevel = Math.min(zoomLevel, 1);
			}
			
			else
			{
				zoomVelocity += Math.sign(scrollAmount) * .05;
			}
			
			zoomCanvas(x, y);
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
			
			zoomLevel = Math.min(zoomLevel, 1);
			
			fixedPointX = x;
			fixedPointY = y;
			
			zoomCanvas();
		}
		
		
		
		function zoomCanvas()
		{
			if (aspectRatio >= 1)
			{
				let newWorldCenter = wilson.input.getZoomedWorldCenter(fixedPointX, fixedPointY, 4 * Math.pow(2, zoomLevel) * aspectRatio, 4 * Math.pow(2, zoomLevel));
				
				wilson.worldWidth = 4 * Math.pow(2, zoomLevel) * aspectRatio;
				wilson.worldHeight = 4 * Math.pow(2, zoomLevel);
				
				wilson.worldCenterX = newWorldCenter[0];
				wilson.worldCenterY = newWorldCenter[1];
			}
			
			else
			{
				let newWorldCenter = wilson.input.getZoomedWorldCenter(fixedPointX, fixedPointY, 4 * Math.pow(2, zoomLevel), 4 * Math.pow(2, zoomLevel) / aspectRatio);
				
				wilson.worldWidth = 4 * Math.pow(2, zoomLevel);
				wilson.worldHeight = 4 * Math.pow(2, zoomLevel) / aspectRatio;
				
				wilson.worldCenterX = newWorldCenter[0];
				wilson.worldCenterY = newWorldCenter[1];
			}
			
			window.requestAnimationFrame(drawJuliaSet);
			
			wilson.draggables.recalculateLocations();
		}



		function drawJuliaSet(timestamp)
		{
			let timeElapsed = timestamp - lastTimestamp;
			
			lastTimestamp = timestamp;
			
			
			
			if (timeElapsed === 0)
			{
				return;
			}
			
			
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterX"], wilson.worldCenterX);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldCenterY"], wilson.worldCenterY);
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
			
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["a"], a);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["b"], b);
			wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["brightnessScale"], 20);
			
			wilsonHidden.render.drawFrame();
			
			
			
			let pixelData = wilsonHidden.render.getPixelData();
			
			let brightnesses = new Array(resolutionHidden * resolutionHidden);
			
			for (let i = 0; i < resolutionHidden * resolutionHidden; i++)
			{
				brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
			}
			
			brightnesses.sort((a, b) => a - b);
			
			let brightnessScale = brightnesses[Math.floor(resolutionHidden * resolutionHidden * .98)] / 255 * 18;
			
			brightnessScale = Math.max(brightnessScale, .1);
			
			
			
			wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], aspectRatio);
			
			wilson.gl.uniform1f(wilson.uniforms["worldCenterX"], wilson.worldCenterX);
			wilson.gl.uniform1f(wilson.uniforms["worldCenterY"], wilson.worldCenterY);
			
			wilson.gl.uniform1f(wilson.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
			
			wilson.gl.uniform1f(wilson.uniforms["a"], a);
			wilson.gl.uniform1f(wilson.uniforms["b"], b);
			wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
			
			wilson.render.drawFrame();
			
			
			
			if (panVelocityX !== 0 || panVelocityY !== 0 || zoomVelocity !== 0)
			{
				wilson.worldCenterX += panVelocityX;
				wilson.worldCenterY += panVelocityY;
				
				wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, -2), 2);
				wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, -2), 2);
				
				
				
				panVelocityX *= panFriction;
				panVelocityY *= panFriction;
				
				if (Math.sqrt(panVelocityX * panVelocityX + panVelocityY * panVelocityY) < panVelocityStopThreshhold * Math.min(wilson.worldWidth, wilson.worldHeight))
				{
					panVelocityX = 0;
					panVelocityY = 0;
				}
				
				
				
				zoomLevel += zoomVelocity;
				
				zoomLevel = Math.min(zoomLevel, 1);
				
				zoomCanvas(fixedPointX, fixedPointY);
				
				zoomVelocity *= zoomFriction;
				
				if (Math.abs(zoomVelocity) < zoomVelocityStopThreshhold)
				{
					zoomVelocity = 0;
				}
				
				
				
				window.requestAnimationFrame(drawJuliaSet);
				
				wilson.draggables.recalculateLocations();
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
					
					wilson.worldWidth = 4 * Math.pow(2, zoomLevel) * aspectRatio;
					wilson.worldHeight = 4 * Math.pow(2, zoomLevel);
				}
				
				else
				{
					wilson.changeCanvasSize(Math.floor(resolution * aspectRatio), resolution);
					
					wilson.worldWidth = 4 * Math.pow(2, zoomLevel);
					wilson.worldHeight = 4 * Math.pow(2, zoomLevel) / aspectRatio;
				}
			}
			
			else
			{
				aspectRatio = 1;
				
				wilson.changeCanvasSize(resolution, resolution);
				
				wilson.worldWidth = 4 * Math.pow(2, zoomLevel);
				wilson.worldHeight = 4 * Math.pow(2, zoomLevel);
			}
			
			window.requestAnimationFrame(drawJuliaSet);
		}

		addTemporaryListener({
			object: window,
			event: "resize",
			callback: changeAspectRatio
		});
	}
	
	
	
	showPage();
	}()