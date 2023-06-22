!function()
{
	"use strict";
	
	
	
	let fragShaderSource = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspectRatio;
		
		uniform float worldCenterX;
		uniform float worldCenterY;
		uniform float worldSize;
		
		uniform int numRoots;
		
		uniform vec2 roots[11];
		
		uniform vec3 colors[11];
		
		uniform vec2 a;
		uniform vec2 c;
		
		uniform float brightnessScale;
		
		const float threshhold = .05;
		
		
		
		//Returns z1 * z2.
		vec2 cmul(vec2 z1, vec2 z2)
		{
			return vec2(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
		}
		
		
		
		//Returns 1/z.
		vec2 cinv(vec2 z)
		{
			float magnitude = z.x*z.x + z.y*z.y;
			
			return vec2(z.x / magnitude, -z.y / magnitude);
		}
		
		
		
		//Returns f(z) for a polynomial f with given roots.
		vec2 cpoly(vec2 z)
		{
			vec2 result = vec2(1.0, 0.0);
			
			for (int i = 0; i <= 11; i++)
			{
				if (i == numRoots)
				{
					return result;
				}
				
				result = cmul(result, z - roots[i]);
			}
		}
		
		
		
		//Approximates f'(z) for a polynomial f with given roots.
		vec2 cderiv(vec2 z)
		{
			return 20.0 * (cpoly(z + vec2(.025, 0.0)) - cpoly(z - vec2(.025, 0.0)));
		}
		
		
		
		void main(void)
		{
			vec2 z;
			vec2 lastZ = vec2(0.0, 0.0);
			
			if (aspectRatio >= 1.0)
			{
				z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
			}
			
			else
			{
				z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
			}
			
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				vec2 temp = cmul(cmul(cpoly(z), cinv(cderiv(z))), a) + c;
				
				lastZ = z;
				
				z -= temp;
				
				
				
				for (int i = 0; i <= 11; i++)
				{
					if (i == numRoots)
					{
						break;
					}
					
					float d0 = length(z - roots[i]);
					
					if (d0 < threshhold)
					{
						float d1 = length(lastZ - roots[i]);
						
						float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
						
						float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
						
						gl_FragColor = vec4(colors[i] * brightness, 1.0);
						
						return;
					}
				}
			}
		}
	`;



	let options =
	{
		renderer: "gpu",
		
		shader: fragShaderSource,
		
		canvasWidth: 500,
		canvasHeight: 500,
		
		worldWidth: 3,
		worldHeight: 3,
		worldCenterX: 0,
		worldCenterY: 0,
		
		
		
		useDraggables: true,
		
		draggablesMousemoveCallback: onDragDraggable,
		draggablesTouchmoveCallback: onDragDraggable,
		
		draggablesMouseupCallback: onReleaseDraggable,
		draggablesTouchendCallback: onReleaseDraggable,
		
		
		
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
	
	
	
	let wilson = new Wilson($("#output-canvas"), options);

	wilson.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "numRoots", "roots", "colors", "a", "c", "brightnessScale"]);
	
	
	
	let wilsonHidden = new Wilson($("#hidden-canvas"), optionsHidden);
	
	wilsonHidden.render.initUniforms(["aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "numRoots", "roots", "colors", "a", "c", "brightnessScale"]);
	
	
	
	let a = [1, 0];
	let c = [0, 0];
	
	let currentRoots = [];
	
	let lastActiveRoot = 0;
	
	let numRoots = 0;
	
	let aspectRatio = 1;
	
	let numIterations = 100;
	
	let currentlySpreadingRoots = false;
	let parameterAnimationFrame = 0;
	let oldRoots = [];
	let rootsDelta = [];
	
	let zoomLevel = 0;
	
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
	const panVelocityStartThreshhold = .0025;
	const panVelocityStopThreshhold = .00025;
	
	const zoomFriction = .93;
	const zoomVelocityStartThreshhold = .01;
	const zoomVelocityStopThreshhold = .001;
	
	let lastTimestamp = -1;
	
	
	
	let element = wilson.draggables.add(1, 0);
	
	element.classList.add("a-marker");
	
	element = wilson.draggables.add(0, 0);
	
	element.classList.add("c-marker");
	
	
	
	addRoot();
	addRoot();
	addRoot();
	
	spreadRoots(true);
	
	

	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		resolution = parseInt(resolutionInputElement.value || 500);
		
		wilson.changeCanvasSize(resolution, resolution);
		
		window.requestAnimationFrame(drawNewtonsMethod);
	});
	
	
	
	let addRootButtonElement = $("#add-root-button");
	
	addRootButtonElement.addEventListener("click", addRoot);
	
	
	
	let removeRootButtonElement = $("#remove-root-button");
	
	removeRootButtonElement.addEventListener("click", removeRoot);
	
	
	
	let spreadRootsButtonElement = $("#spread-roots-button");
	
	spreadRootsButtonElement.addEventListener("click", () => spreadRoots(false, false));
	
	
	
	let randomizeRootsButtonElement = $("#randomize-roots-button");
	
	randomizeRootsButtonElement.addEventListener("click", () => spreadRoots(false, true));
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("newtons-method.png");
	});
	
	
	
	let rootAInputElement = $("#root-a-input");
	let rootBInputElement = $("#root-b-input");
	
	rootAInputElement.addEventListener("input", setRoot);
	rootBInputElement.addEventListener("input", setRoot);
	
	
	
	let rootColorInputElement = $("#root-color-input");
	rootColorInputElement.addEventListener("input", setColor);
	
	
	
	let rootSetterElement = $("#root-setter");
	
	let colorSetterElement = $("#color-setter");
	
	
	
	//Render the inital frame.
	wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
	
	let colors = [216/255, 1/255, 42/255,   255/255, 139/255, 56/255,   249/255, 239/255, 20/255,   27/255, 181/255, 61/255,   0/255, 86/255, 195/255,   154/255, 82/255, 164/255,   32/255, 32/255, 32/255,   155/255, 92/255, 15/255,   182/255, 228/255, 254/255,   250/255, 195/255, 218/255,   255/255, 255/255, 255/255];
	
	wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
	wilsonHidden.gl.uniform3fv(wilsonHidden.uniforms["colors"], colors);
	
	window.requestAnimationFrame(drawNewtonsMethod);
	
	
	
	Page.show();
	
	
	
	function addRoot()
	{
		if (numRoots === 11)
		{
			return;
		}
		
		
		
		let x = Math.random() * 3 - 1.5;
		let y = Math.random() * 3 - 1.5;
		
		wilson.draggables.add(x, y);
		
		currentRoots.push(x);
		currentRoots.push(y);
		
		numRoots++;
		
		window.requestAnimationFrame(drawNewtonsMethod);
	}
	
	
	
	function removeRoot()
	{
		if (numRoots === 1)
		{
			return;
		}
		
		
		numRoots--;
		
		currentRoots.pop();
		currentRoots.pop();
		
		wilson.draggables.draggables[numRoots + 2].remove();
		
		wilson.draggables.draggables.pop();
		wilson.draggables.worldCoordinates.pop();
		
		wilson.draggables.numDraggables--;
		
		window.requestAnimationFrame(drawNewtonsMethod);
	}
	
	
	
	function spreadRoots(noAnimation = false, randomize = false)
	{
		if (!currentlySpreadingRoots)
		{
			currentlySpreadingRoots = true;
			
			parameterAnimationFrame = 0;
		}
		
		else
		{
			return;
		}
		
		oldRoots = JSON.parse(JSON.stringify(currentRoots));
		
		for (let i = 0; i < numRoots; i++)
		{
			let mag = 1;
			
			if (randomize)
			{
				mag += .75 * Math.random();
			}	
			
			rootsDelta[2 * i] = mag * Math.cos(2 * Math.PI * i / numRoots) - currentRoots[2 * i];
			rootsDelta[2 * i + 1] = mag * Math.sin(2 * Math.PI * i / numRoots) - currentRoots[2 * i + 1];	
		}
		
		if (noAnimation)
		{
			currentlySpreadingRoots = false;
			
			for (let i = 0; i < numRoots; i++)
			{
				currentRoots[2 * i] = oldRoots[2 * i] + rootsDelta[2 * i];
				currentRoots[2 * i + 1] = oldRoots[2 * i + 1] + rootsDelta[2 * i + 1];
				
				wilson.draggables.worldCoordinates[i + 2] = [currentRoots[2 * i], currentRoots[2 * i + 1]];
			}
			
			wilson.draggables.recalculateLocations();
		}
		
		window.requestAnimationFrame(drawNewtonsMethod);
	}
	
	
	
	function spreadRootsStep()
	{
		let t = .5 * Math.sin(Math.PI * parameterAnimationFrame / 120 - Math.PI / 2) + .5;
		
		for (let i = 0; i < numRoots; i++)
		{
			currentRoots[2 * i] = oldRoots[2 * i] + rootsDelta[2 * i] * t;
			currentRoots[2 * i + 1] = oldRoots[2 * i + 1] + rootsDelta[2 * i + 1] * t;
			
			wilson.draggables.worldCoordinates[i + 2] = [currentRoots[2 * i], currentRoots[2 * i + 1]];
		}
		
		window.requestAnimationFrame(drawNewtonsMethod);
		
		wilson.draggables.recalculateLocations();
		
		parameterAnimationFrame++;
		
		if (parameterAnimationFrame === 121)
		{
			currentlySpreadingRoots = false;
		}
	}
	
	
	
	function setRoot()
	{
		if (lastActiveRoot === 0)
		{
			a[0] = parseFloat(rootAInputElement.value || 1);
			a[1] = parseFloat(rootBInputElement.value || 0);
			
			wilson.draggables.worldCoordinates[0] = [a[0], a[1]];
		}
		
		
		
		else if (lastActiveRoot === 1)
		{
			c[0] = parseFloat(rootAInputElement.value || 0) * 10;
			c[1] = parseFloat(rootBInputElement.value || 0) * 10;
			
			wilson.draggables.worldCoordinates[1] = [c[0], c[1]];
		}
		
		
		
		else
		{
			currentRoots[2 * (lastActiveRoot - 2)] = parseFloat(rootAInputElement.value || 0);
			currentRoots[2 * (lastActiveRoot - 2) + 1] = parseFloat(rootBInputElement.value || 0);
			
			wilson.draggables.worldCoordinates[lastActiveRoot - 2] = [currentRoots[2 * (lastActiveRoot - 2)], currentRoots[2 * (lastActiveRoot - 2) + 1]];
		}
		
		
		
		window.requestAnimationFrame(drawNewtonsMethod);
		
		wilson.draggables.recalculateLocations();
	}
	
	
	
	function setColor()
	{
		if (lastActiveRoot < 2)
		{
			return;
		}
		
		let index = lastActiveRoot - 2;
			
		let result = hexToRgb(rootColorInputElement.value);
		
		let r = result.r / 255;
		let g = result.g / 255;
		let b = result.b / 255;
		
		result.r = colors[3 * index];
		result.g = colors[3 * index + 1];
		result.b = colors[3 * index + 2];
		
		anime({
			targets: result,
			r: r,
			g: g,
			b: b,
			easing: "easeInOutQuad",
			duration: 250,
			update: () =>
			{
				colors[3 * index] = result.r;
				colors[3 * index + 1] = result.g;
				colors[3 * index + 2] = result.b;
				
				wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
				wilsonHidden.gl.uniform3fv(wilsonHidden.uniforms["colors"], colors);
				
				window.requestAnimationFrame(drawNewtonsMethod);
			}
		});
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
		
		nextPanVelocityX = -xDelta / wilson.worldWidth;
		nextPanVelocityY = -yDelta / wilson.worldHeight;
		
		window.requestAnimationFrame(drawNewtonsMethod);
		
		wilson.draggables.recalculateLocations();
	}
	
	
	
	function onReleaseCanvas(x, y, event)
	{
		if (Math.sqrt(nextPanVelocityX * nextPanVelocityX + nextPanVelocityY * nextPanVelocityY) >= panVelocityStartThreshhold)
		{
			panVelocityX = nextPanVelocityX;
			panVelocityY = nextPanVelocityY;
		}
		
		if (Math.abs(nextZoomVelocity) >= zoomVelocityStartThreshhold)
		{
			zoomVelocity = nextZoomVelocity;
		}
		
		window.requestAnimationFrame(drawNewtonsMethod);
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
		
		fixedPointX = x;
		fixedPointY = y;
		
		zoomCanvas();
	}
	
	
	
	function zoomCanvas()
	{
		if (aspectRatio >= 1)
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
		
		window.requestAnimationFrame(drawNewtonsMethod);
		
		wilson.draggables.recalculateLocations();
	}
	
	
	
	function onDragDraggable(activeDraggable, x, y, event)
	{
		if (activeDraggable === 0)
		{
			a = [x, y];
		}
		
		else if (activeDraggable === 1)
		{
			c = [x, y];
		}
		
		else
		{
			currentRoots[2 * (activeDraggable - 2)] = x;
			currentRoots[2 * (activeDraggable - 2) + 1] = y;
		}
		
		window.requestAnimationFrame(drawNewtonsMethod);
	}
	
	
	
	function onReleaseDraggable(activeDraggable, x, y, event)
	{
		Page.Animate.changeOpacity(rootSetterElement, 0, Site.opacityAnimationTime);
		Page.Animate.changeOpacity(colorSetterElement, 0, Site.opacityAnimationTime)
		
		.then(() =>
		{
			lastActiveRoot = activeDraggable;
			
			if (lastActiveRoot === 0)
			{
				rootAInputElement.value = Math.round(a[0] * 1000) / 1000;
				rootBInputElement.value = Math.round(a[1] * 1000) / 1000;
			}
			
			else if (lastActiveRoot === 1)
			{
				rootAInputElement.value = Math.round(c[0] * 1000) / 10000;
				rootBInputElement.value = Math.round(c[1] * 1000) / 10000;
			}
			
			else
			{
				let index = lastActiveRoot - 2;
				
				rootAInputElement.value = Math.round(currentRoots[2 * index] * 1000) / 1000;
				rootBInputElement.value = Math.round(currentRoots[2 * index + 1] * 1000) / 1000;
				
				rootColorInputElement.value = rgbToHex(colors[3 * index] * 255, colors[3 * index + 1] * 255, colors[3 * index + 2] * 255);
			}
			
			Page.Animate.changeOpacity(rootSetterElement, 1, Site.opacityAnimationTime);
			Page.Animate.changeOpacity(colorSetterElement, 1, Site.opacityAnimationTime);
		});
	}



	function drawNewtonsMethod(timestamp)
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
		
		wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["numRoots"], numRoots);
		
		wilsonHidden.gl.uniform2fv(wilsonHidden.uniforms["roots"], currentRoots);
		
		wilsonHidden.gl.uniform2fv(wilsonHidden.uniforms["a"], a);
		wilsonHidden.gl.uniform2f(wilsonHidden.uniforms["c"], c[0] / 10, c[1] / 10);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["brightnessScale"], 30);
		
		wilsonHidden.render.drawFrame();
		
		
		
		let pixelData = wilsonHidden.render.getPixelData();
		
		let brightnesses = new Array(resolutionHidden * resolutionHidden);
		
		for (let i = 0; i < resolutionHidden * resolutionHidden; i++)
		{
			brightnesses[i] = Math.max(Math.max(pixelData[4 * i], pixelData[4 * i + 1]), pixelData[4 * i + 2]);
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = Math.min(10000 / (brightnesses[Math.floor(resolutionHidden * resolutionHidden * .96)] + brightnesses[Math.floor(resolutionHidden * resolutionHidden * .98)]), 200);
		
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
		
		wilson.gl.uniform1i(wilson.uniforms["numRoots"], numRoots);
		
		wilson.gl.uniform2fv(wilson.uniforms["roots"], currentRoots);
		
		wilson.gl.uniform2fv(wilson.uniforms["a"], a);
		wilson.gl.uniform2f(wilson.uniforms["c"], c[0] / 10, c[1] / 10);
		wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
		
		wilson.render.drawFrame();
		
		
		
		if (currentlySpreadingRoots)
		{
			spreadRootsStep();
		}
		
		
		
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
			wilson.worldCenterX += panVelocityX * wilson.worldWidth;
			wilson.worldCenterY += panVelocityY * wilson.worldHeight;
			
			
			
			panVelocityX *= panFriction;
			panVelocityY *= panFriction;
			
			if (Math.sqrt(panVelocityX * panVelocityX + panVelocityY * panVelocityY) < panVelocityStopThreshhold)
			{
				panVelocityX = 0;
				panVelocityY = 0;
			}
			
			
			
			zoomLevel += zoomVelocity;
			
			zoomCanvas(fixedPointX, fixedPointY);
			
			zoomVelocity *= zoomFriction;
			
			if (Math.abs(zoomVelocity) < zoomVelocityStopThreshhold)
			{
				zoomVelocity = 0;
			}
			
			
			
			window.requestAnimationFrame(drawNewtonsMethod);
			
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
				
				wilson.worldWidth = 3 * Math.pow(2, zoomLevel) * aspectRatio;
				wilson.worldHeight = 3 * Math.pow(2, zoomLevel);
			}
			
			else
			{
				wilson.changeCanvasSize(Math.floor(resolution * aspectRatio), resolution);
				
				wilson.worldWidth = 3 * Math.pow(2, zoomLevel);
				wilson.worldHeight = 3 * Math.pow(2, zoomLevel) / aspectRatio;
			}
		}
		
		else
		{
			aspectRatio = 1;
			
			wilson.changeCanvasSize(resolution, resolution);
			
			wilson.worldWidth = 3 * Math.pow(2, zoomLevel);
			wilson.worldHeight = 3 * Math.pow(2, zoomLevel);
		}
		
		window.requestAnimationFrame(drawNewtonsMethod);
	}

	window.addEventListener("resize", changeAspectRatio);
	Page.temporaryHandlers["resize"].push(changeAspectRatio);
	
	
	
	function hexToRgb(hex)
	{
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	function componentToHex(c)
	{
		let hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b)
	{
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	}()