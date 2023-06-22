!async function()
{
	"use strict";
	
	
	
	await Site.loadGLSL();
	
	
	
	let wilson = null;
	let wilsonHidden = null;
	
	
	
	let a = [1, 0];
	let c = [0, 0];
	
	let aspectRatio = 1;
	
	let numIterations = 100;
	
	let zoomLevel = 1;
	
	let pastBrightnessScales = [];
	
	let resolution = 500;
	let resolutionHidden = 100;
	
	let derivativePrecision = 20;
	
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
	
	let currentlyAnimatingParameters = false;
	let parameterAnimationFrame = 0;
	
	
	
	let colors = null;
	let colorDeltas = new Array(12);
	let oldColors = new Array(12);
	
	
	
	
	
	let codeInputElement = $("#code-textarea");
	
	codeInputElement.value = "cmul(csin(z), csin(cmul(z, i)))";
	
	codeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			useNewCode();
		}
	});
	
	
	
	let randomizePaletteButton = $("#randomize-palette-button");
	
	randomizePaletteButton.addEventListener("click", animatePaletteChange);
	
	
	
	let generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", useNewCode);
	
	
	

	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		resolution = parseInt(resolutionInputElement.value || 500);
		
		wilson.changeCanvasSize(resolution, resolution);
		
		window.requestAnimationFrame(drawNewtonsMethod);
	});
	
	
	
	let derivativePrecisionInputElement = $("#derivative-precision-input");
	
	derivativePrecisionInputElement.addEventListener("input", () =>
	{
		derivativePrecision = parseFloat(derivativePrecisionInputElement.value || 20);
		
		wilson.gl.uniform1f(wilson.uniforms["derivativePrecision"], derivativePrecision);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["derivativePrecision"], derivativePrecision);
		
		window.requestAnimationFrame(drawNewtonsMethod);
	});
	
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("newtons-method.png");
	});
	
	
	
	let canvasLocationElement = $("#canvas-location");
	
	
	
	const examples =
	{
		"none": "",
		"polynomial": "csub(cpow(z, 6.0), 1.0)",
		"trig": "csin(z)",
		"crosshatch": "cmul(csin(z), csin(cmul(z, i)))",
		"palette": "cmul(sin(z), csin(cmul(z, i)))",
		"butterflies": "cmul(sin(z), tan(z))"
	};
	
	const exampleSelectorDropdownElement = $("#example-selector-dropdown");
	
	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value !== "none")
		{
			codeInputElement.value = examples[exampleSelectorDropdownElement.value];
			
			useNewCode();
		}
	});
	
	
	
	useNewCode();
	
	
	
	Page.show();
	
	
	
	function useNewCode()
	{
		let generatingCode = codeInputElement.value || "cmul(csin(z), csin(cmul(z, i)))";
		
		
		
		let fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float worldCenterX;
			uniform float worldCenterY;
			uniform float worldSize;
			
			uniform float derivativePrecision;
			
			
			uniform vec3 colors[4];
			
			uniform vec2 a;
			uniform vec2 c;
			
			uniform float brightnessScale;
			
			const float threshhold = .01;
			
			
			
			${Site.getGLSLBundle(generatingCode)}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${generatingCode};
			}
			
			
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 cderiv(vec2 z)
			{
				return derivativePrecision * (f(z + vec2(1.0 / (2.0*derivativePrecision), 0.0)) - f(z - vec2(1.0 / (2.0*derivativePrecision), 0.0)));
			}
			
			
			
			void main(void)
			{
				vec2 z;
				vec2 lastZ = vec2(0.0, 0.0);
				vec2 oldZ = vec2(0.0, 0.0);
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX, uv.y * worldSize + worldCenterY);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX, uv.y / aspectRatio * worldSize + worldCenterY);
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 200; iteration++)
				{
					vec2 temp = cmul(cmul(f(z), cinv(cderiv(z))), a) + c;
					
					oldZ = lastZ;
					
					lastZ = z;
					
					z -= temp;
					
					
					
					//If we're slowing down, it's reasonably safe to assume that we're near a root.
					
					float d0 = length(lastZ - z);
					
					if (d0 < threshhold)
					{
						float d1 = length(oldZ - lastZ);
						
						float brightnessAdjust = (log(threshhold) - log(d0)) / (log(d1) - log(d0));
						
						float brightness = 1.0 - (float(iteration) - brightnessAdjust) / brightnessScale;
						
						//Round to a square grid so that basin colors are consistent.
						vec2 theoreticalRoot = floor(z / (threshhold / 3.0)) * threshhold / 3.0;
						
						float c0 = sin(theoreticalRoot.x * 7.239846) + cos(theoreticalRoot.x * 2.945387) + 2.0;
						
						float c1 = sin(theoreticalRoot.y * 5.918445) + cos(theoreticalRoot.y * .987235) + 2.0;
						
						float c2 = sin((theoreticalRoot.x + theoreticalRoot.y) * 1.023974) + cos((theoreticalRoot.x + theoreticalRoot.y) * 9.130874) + 2.0;
						
						float c3 = sin((theoreticalRoot.x - theoreticalRoot.y) * 3.258342) + cos((theoreticalRoot.x - theoreticalRoot.y) * 4.20957) + 2.0;
						
						//Pick an interpolated color between the 4 that we chose earlier.
						gl_FragColor = vec4((c0 * colors[0] + c1 * colors[1] + c2 * colors[2] + c3 * colors[3]) / (c0 + c1 + c2 + c3) * brightness, 1.0);
						
						return;
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
			
			worldWidth: 12,
			worldHeight: 12,
			worldCenterX: 0,
			worldCenterY: 0,
			
			
			
			useDraggables: true,
			
			draggablesMousemoveCallback: onDragDraggable,
			draggablesTouchmoveCallback: onDragDraggable,
			
			
			
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
		
		
		
		wilson = new Wilson($("#output-canvas"), options);

		wilson.render.initUniforms(["aspectRatio", "derivativePrecision", "worldCenterX", "worldCenterY", "worldSize", "colors", "a", "c", "brightnessScale"]);
		
		
		
		wilsonHidden = new Wilson($("#hidden-canvas"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["aspectRatio", "derivativePrecision", "worldCenterX", "worldCenterY", "worldSize", "colors", "a", "c", "brightnessScale"]);
		
		
		
		pastBrightnessScales = [];
		
		zoomLevel = 2;
		
		nextPanVelocityX = 0;
		nextPanVelocityY = 0;
		nextZoomVelocity = 0;
		
		panVelocityX = 0;
		panVelocityY = 0;
		zoomVelocity = 0;
		
		
		
		let element = wilson.draggables.add(1, 0);
	
		element.classList.add("a-marker");
		
		element = wilson.draggables.add(0, 0);
		
		element.classList.add("c-marker");
		
		a = [1, 0];
		c = [0, 0];
		
		
		
		colors = generateNewPalette();
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], 1);
		
		wilson.gl.uniform1f(wilson.uniforms["derivativePrecision"], derivativePrecision);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["derivativePrecision"], derivativePrecision);
		
		wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
		wilsonHidden.gl.uniform3fv(wilsonHidden.uniforms["colors"], colors);
		
		
		
		window.requestAnimationFrame(drawNewtonsMethod);
	}
	
	
	
	//Pick 4 colors, each with a bright, medium, and dim component. Each of these colors will be interpolated between based on the target x and y coordinates of the attractive root, forming a quadrilateral in the color plane. Since these 4 corner points are brightish but not overly so and decently saturated, this process almost always produces a pleasing palette.
	function generateNewPalette()
	{
		let newColors = new Array(12);
		
		let hue = 0;
		
		let restrictions = [];
		
		let restrictionWidth = .1;
		
		
		
		for (let i = 0; i < 4; i++)
		{
			hue = Math.random() * (1 - i * 2 * restrictionWidth);
			
			for (let j = 0; j < i; j++)
			{
				if (hue > restrictions[j])
				{
					hue += restrictionWidth*2;
				}
			}
			
			restrictions[i] = hue - restrictionWidth;
			
			restrictions.sort();
			
			
			
			let rgb = wilson.utils.hsvToRgb(hue, Math.random() * .25 + .75, Math.random() * .25 + .75);
			
			newColors[3*i] = rgb[0] / 255;
			newColors[3*i + 1] = rgb[1] / 255;
			newColors[3*i + 2] = rgb[2] / 255;
		}
		
		return newColors;
	}
	
	
	
	function animatePaletteChange()
	{
		if (!currentlyAnimatingParameters)
		{
			currentlyAnimatingParameters = true;
			
			parameterAnimationFrame = 0;
			
			
			
			let newColors = generateNewPalette();
			oldColors = [...colors];
			
			for (let i = 0; i < 12; i++)
			{
				colorDeltas[i] = newColors[i] - colors[i];
			}
			
			window.requestAnimationFrame(drawNewtonsMethod);
		}
	}
	
	
	
	function animatePaletteChangeStep()
	{
		let t = .5 * Math.sin(Math.PI * parameterAnimationFrame / 30 - Math.PI / 2) + .5;
		
		for (let i = 0; i < 12; i++)
		{
			colors[i] = oldColors[i] + colorDeltas[i]*t;
		}
		
		wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
		wilsonHidden.gl.uniform3fv(wilsonHidden.uniforms["colors"], colors);
		
		
		
		parameterAnimationFrame++;
		
		if (parameterAnimationFrame === 31)
		{
			currentlyAnimatingParameters = false;
		}
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
		
		else
		{
			c = [x, y];
		}
		
		window.requestAnimationFrame(drawNewtonsMethod);
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
		
		wilson.gl.uniform2fv(wilson.uniforms["a"], a);
		wilson.gl.uniform2f(wilson.uniforms["c"], c[0] / 10, c[1] / 10);
		wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
		
		wilson.render.drawFrame();
		
		
		
		let needNewFrame = false;
		
		if (currentlyAnimatingParameters)
		{
			animatePaletteChangeStep();
			
			needNewFrame = true;
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
			
			
			
			needNewFrame = true;
			
			wilson.draggables.recalculateLocations();
		}
		
		
		
		if (needNewFrame)
		{
			window.requestAnimationFrame(drawNewtonsMethod);
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
	}()