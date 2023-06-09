!function()
{
	"use strict";
	
	
	
	let fragShaderSource = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform int juliaMode;
		uniform int doublePrecision;
		
		uniform float aspectRatio;
		
		uniform vec2 worldCenterX;
		uniform vec2 worldCenterY;
		uniform float worldSize;
		
		uniform float a;
		uniform float b;
		uniform int numIterations;
		uniform float brightnessScale;
		
		
		
		float timesFrc(float a, float b)
		{
			return mix(0.0, a * b, b != 0.0 ? 1.0 : 0.0);
		}

		float plusFrc(float a, float b)
		{
			return mix(a, a + b, b != 0.0 ? 1.0 : 0.0);
		}

		float minusFrc(float a, float b)
		{
			return mix(a, a - b, b != 0.0 ? 1.0 : 0.0);
		}

		// Double emulation based on GLSL Mandelbrot Shader by Henry Thasler (www.thasler.org/blog)
		// Emulation based on Fortran-90 double-single package. See http://crd.lbl.gov/~dhbailey/mpdist/
		// Add: res = dsAdd(a, b) => res = a + b
		vec2 add (vec2 dsa, vec2 dsb)
		{
			vec2 dsc;
			float t1, t2, e;
			t1 = plusFrc(dsa.x, dsb.x);
			e = minusFrc(t1, dsa.x);
			t2 = plusFrc(plusFrc(plusFrc(minusFrc(dsb.x, e), minusFrc(dsa.x, minusFrc(t1, e))), dsa.y), dsb.y);
			dsc.x = plusFrc(t1, t2);
			dsc.y = minusFrc(t2, minusFrc(dsc.x, t1));
			return dsc;
		}

		// Subtract: res = dsSub(a, b) => res = a - b
		vec2 sub (vec2 dsa, vec2 dsb)
		{
			vec2 dsc;
			float e, t1, t2;
			t1 = minusFrc(dsa.x, dsb.x);
			e = minusFrc(t1, dsa.x);
			t2 = minusFrc(plusFrc(plusFrc(minusFrc(minusFrc(0.0, dsb.x), e), minusFrc(dsa.x, minusFrc(t1, e))), dsa.y), dsb.y);
			dsc.x = plusFrc(t1, t2);
			dsc.y = minusFrc(t2, minusFrc(dsc.x, t1));
			return dsc;
		}

		// Compare: res = -1 if a < b // = 0 if a == b // = 1 if a > b
		float cmp(vec2 dsa, vec2 dsb)
		{
			if (dsa.x < dsb.x)
			{
				return -1.;
			}
			
			if (dsa.x > dsb.x)
			{
				return 1.;
			}
			
			if (dsa.y < dsb.y)
			{
				return -1.;
			}
			
			if (dsa.y > dsb.y)
			{
				return 1.;
			}
			
			return 0.;
		}

		// Multiply: res = dsMul(a, b) => res = a * b

		vec2 mul (vec2 dsa, vec2 dsb)
		{
			vec2 dsc;
			float c11, c21, c2, e, t1, t2;
			float a1, a2, b1, b2, cona, conb, split = 8193.;
			cona = timesFrc(dsa.x, split);
			conb = timesFrc(dsb.x, split);
			a1 = minusFrc(cona, minusFrc(cona, dsa.x));
			b1 = minusFrc(conb, minusFrc(conb, dsb.x));
			a2 = minusFrc(dsa.x, a1);
			b2 = minusFrc(dsb.x, b1);
			c11 = timesFrc(dsa.x, dsb.x);
			c21 = plusFrc(timesFrc(a2, b2), plusFrc(timesFrc(a2, b1), plusFrc(timesFrc(a1, b2), minusFrc(timesFrc(a1, b1), c11))));
			c2 = plusFrc(timesFrc(dsa.x, dsb.y), timesFrc(dsa.y, dsb.x));
			t1 = plusFrc(c11, c2);
			e = minusFrc(t1, c11);
			t2 = plusFrc(plusFrc(timesFrc(dsa.y, dsb.y), plusFrc(minusFrc(c2, e), minusFrc(c11, minusFrc(t1, e)))), c21);
			dsc.x = plusFrc(t1, t2);
			dsc.y = minusFrc(t2, minusFrc(dsc.x, t1));
			return dsc;
		}

		// create double-single number from float
		vec2 set(float a)
		{
			return vec2(a, 0.0);
		}

		float rand(vec2 co)
		{
			// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
			return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}

		vec2 complexMul(vec2 a, vec2 b)
		{
			return vec2(a.x*b.x - a.y*b.y,a.x*b.y + a.y * b.x);
		}

		// double complex multiplication
		vec4 dcMul(vec4 a, vec4 b)
		{
			return vec4(sub(mul(a.xy,b.xy),mul(a.zw,b.zw)),add(mul(a.xy,b.zw),mul(a.zw,b.xy)));
		}

		vec4 dcAdd(vec4 a, vec4 b)
		{
			return vec4(add(a.xy,b.xy),add(a.zw,b.zw));
		}

		// Length of double complex
		vec2 dcLength(vec4 a)
		{
			return add(mul(a.xy,a.xy),mul(a.zw,a.zw));
		}

		vec4 dcSet(vec2 a)
		{
			return vec4(a.x,0.,a.y,0.);
		}

		vec4 dcSet(vec2 a, vec2 ad)
		{
			return vec4(a.x, ad.x,a.y,ad.y);
		}

		// Multiply double-complex with double
		vec4 dcMul(vec4 a, vec2 b)
		{
			return vec4(mul(a.xy,b),mul(a.wz,b));
		}
		
		
		
		void main(void)
		{
			if (doublePrecision == 0)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * worldSize + worldCenterX.x, uv.y * worldSize + worldCenterY.x);
				}
				
				else
				{
					z = vec2(uv.x * worldSize + worldCenterX.x, uv.y / aspectRatio * worldSize + worldCenterY.x);
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
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
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
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
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
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
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
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightnessScale * color, 0.0);
					}
				}
			}
			
			
			
			else
			{
				vec4 z;
				
				if (aspectRatio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspectRatio, 0.0, uv.y, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspectRatio, 0.0), vec2(worldSize, 0.0)), vec4(worldCenterX, worldCenterY));
				}
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				if (juliaMode == 0)
				{
					vec4 c = z;
					
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
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
				}
				
				else if (juliaMode == 1)
				{
					vec4 c = vec4(a, 0.0, b, 0.0);
					
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
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightnessScale * color, 1.0);
				}
				
				else
				{
					vec4 c = z;
					
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
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightnessScale * color, 1.0);
					}
					
					
					
					z = c;
					color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
					brightness = exp(-length(z));
					
					broken = false;
					
					c = vec4(a, 0.0, b, 0.0);
					
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
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightnessScale * color, 0.0);
					}
				}
			}	
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
		worldCenterX: -.75,
		worldCenterY: 0,
		
		
		
		useFullscreen: true,
		
		trueFullscreen: true,
	
		useFullscreenButton: true,
		
		enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
		exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
		
		switchFullscreenCallback: changeAspectRatio,
		
		
		
		mousedownCallback: onGrabCanvas,
		touchstartCallback: onGrabCanvas,
		
		mousemoveCallback: onHoverCanvas,
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
	
	
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);

	wilson.render.initUniforms(["juliaMode", "doublePrecision", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "numIterations", "brightnessScale"]);
	
	wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 0);
	
	
	
	let wilsonHidden = new Wilson(Page.element.querySelector("#hidden-canvas"), optionsHidden);
	
	wilsonHidden.render.initUniforms(["juliaMode", "doublePrecision", "aspectRatio", "worldCenterX", "worldCenterY", "worldSize", "a", "b", "numIterations", "brightnessScale"]);
	
	wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 0);
	
	
	
	let juliaMode = 0;
	
	let aspectRatio = 1;
	
	let numIterations = 100;
	
	let zoomLevel = 0;
	let doublePrecision = false;
	
	//Experimentally, the level at which a 2k x 2k canvas can see the grain of single precision rendering.
	const doublePrecisionZoomThreshhold = -16;
	
	let pastBrightnessScales = [];
	
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
	const panVelocityStartThreshhold = .0025;
	const panVelocityStopThreshhold = .00025;
	
	const zoomFriction = .93;
	const zoomVelocityStartThreshhold = .01;
	const zoomVelocityStopThreshhold = .001;
	
	let lastTimestamp = -1;
	
	

	let resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		resolution = parseInt(resolutionInputElement.value || 1000);
		
		wilson.changeCanvasSize(resolution, resolution);
		
		window.requestAnimationFrame(drawJuliaSet);
	});
	
	
	
	let forceFloatsCheckboxElement = Page.element.querySelector("#force-floats-checkbox");
	
	forceFloatsCheckboxElement.addEventListener("input", () =>
	{
		if (forceFloatsCheckboxElement.checked)
		{
			try {forceDoublesCheckboxElement.checked = false;}
			catch(ex) {}
			
			forceDoubles = false;
		}
		
		if (forceFloatsCheckboxElement.checked && doublePrecision)
		{
			doublePrecision = false;
			
			wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 0);
			wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 0);
			
			wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
			
			window.requestAnimationFrame(drawJuliaSet);
		}
		
		else if (!forceFloatsCheckboxElement.checked && !doublePrecision && zoomLevel < doublePrecisionZoomThreshhold)
		{
			doublePrecision = true;
			
			wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 1);
			wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 1);
			
			wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
			
			window.requestAnimationFrame(drawJuliaSet);
		}
	});
	
	
	
	let forceDoubles = false;
	
	let forceDoublesCheckboxElement = Page.element.querySelector("#force-doubles-checkbox");
	
	if (DEBUG)
	{
		forceDoublesCheckboxElement.addEventListener("input", () =>
		{
			if (forceDoublesCheckboxElement.checked)
			{
				forceFloatsCheckboxElement.checked = false;
			}
			
			if (forceDoublesCheckboxElement.checked && !doublePrecision)
			{
				doublePrecision = true;
				
				wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 1);
				wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 1);
				
				wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
				
				window.requestAnimationFrame(drawJuliaSet);
			}
			
			else if (!forceDoublesCheckboxElement.checked && doublePrecision && zoomLevel > doublePrecisionZoomThreshhold)
			{
				doublePrecision = false;
				
				wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 0);
				wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 0);
				
				wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
				
				window.requestAnimationFrame(drawJuliaSet);
			}
			
			forceDoubles = forceDoublesCheckboxElement.checked;
		});
	}	
	
	else
	{
		Page.element.querySelectorAll(".checkbox-row")[1].remove();
	}
	
	
	
	let downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-julia-set.png");
	});
	
	
	
	let switchJuliaModeButtonElement = Page.element.querySelector("#switch-julia-mode-button");
	
	switchJuliaModeButtonElement.style.opacity = 1;
	
	switchJuliaModeButtonElement.addEventListener("click", () =>
	{
		Page.Animate.changeOpacity(switchJuliaModeButtonElement, 0, Site.opacityAnimationTime);
		
		setTimeout(() =>
		{
			if (juliaMode === 2)
			{
				switchJuliaModeButtonElement.textContent = "Return to Mandelbrot Set";
			}
			
			else if (juliaMode === 0)
			{
				switchJuliaModeButtonElement.textContent = "Pick Julia Set";
				
				Page.Animate.changeOpacity(switchJuliaModeButtonElement, 1, Site.opacityAnimationTime);
			}
		}, Site.opacityAnimationTime);
		
		
		
		if (juliaMode === 0)
		{
			juliaMode = 2;
			
			a = 0;
			b = 0;
			
			panVelocityX = 0;
			panVelocityY = 0;
			zoomVelocity = 0;
			
			nextPanVelocityX = 0;
			nextPanVelocityY = 0;
			nextZoomVelocity = 0;
			
			pastBrightnessScales = [];
			
			window.requestAnimationFrame(drawJuliaSet);
		}
		
		else if (juliaMode === 1)
		{
			juliaMode = 0;
			
			wilson.worldCenterX = -.75;
			wilson.worldCenterY = 0;
			wilson.worldWidth = 4;
			wilson.worldHeight = 4;
			zoomLevel = 0;
			
			pastBrightnessScales = [];
			
			window.requestAnimationFrame(drawJuliaSet);
		}
	});
	
	
	
	//Render the inital frame.
	wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], 1);
	wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["aspectRatio"], 1);
	
	window.requestAnimationFrame(drawJuliaSet);
	
	
	
	Page.show();
	
	
	
	function onGrabCanvas(x, y, event)
	{
		panVelocityX = 0;
		panVelocityY = 0;
		zoomVelocity = 0;
		
		nextPanVelocityX = 0;
		nextPanVelocityY = 0;
		nextZoomVelocity = 0;
		
		
		
		if (juliaMode === 2 && event.type === "mousedown")
		{
			juliaMode = 1;
			
			wilson.worldCenterX = 0;
			wilson.worldCenterY = 0;
			wilson.worldWidth = 4;
			wilson.worldHeight = 4;
			zoomLevel = 0;
			
			pastBrightnessScales = [];
			
			Page.Animate.changeOpacity(switchJuliaModeButtonElement, 1, Site.opacityAnimationTime);
			
			window.requestAnimationFrame(drawJuliaSet);
		}
	}
	
	
	
	function onDragCanvas(x, y, xDelta, yDelta, event)
	{
		if (juliaMode === 2 && event.type === "touchmove")
		{
			a = x;
			b = y;
		}
		
		else
		{
			wilson.worldCenterX -= xDelta;
			wilson.worldCenterY -= yDelta;
			
			nextPanVelocityX = -xDelta / wilson.worldWidth;
			nextPanVelocityY = -yDelta / wilson.worldHeight;
			
			wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, -2), 2);
			wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, -2), 2);
		}
		
		window.requestAnimationFrame(drawJuliaSet);
	}
	
	
	
	function onHoverCanvas(x, y, xDelta, yDelta, event)
	{
		if (juliaMode === 2 && event.type === "mousemove")
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(drawJuliaSet);
		}
	}
	
	
	
	function onReleaseCanvas(x, y, event)
	{
		if (juliaMode === 2 && event.type === "touchend")
		{
			juliaMode = 1;
			
			wilson.worldCenterX = 0;
			wilson.worldCenterY = 0;
			wilson.worldWidth = 4;
			wilson.worldHeight = 4;
			zoomLevel = 0;
			
			pastBrightnessScales = [];
			
			Page.Animate.changeOpacity(switchJuliaModeButtonElement, 1, Site.opacityAnimationTime);
			
			window.requestAnimationFrame(drawJuliaSet);
		}
		
		else
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
		
		zoomCanvas();
	}
	
	
	
	function onPinchCanvas(x, y, touchDistanceDelta, event)
	{
		if (juliaMode === 2)
		{
			return;
		}
		
		
		
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
		
		numIterations = (-zoomLevel * 30) + 200;
		
		
		
		if (!doublePrecision && zoomLevel < doublePrecisionZoomThreshhold && !forceFloatsCheckboxElement.checked)
		{
			doublePrecision = true;
			wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 1);
			wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 1);
			
			wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
		}
		
		else if (doublePrecision && zoomLevel > doublePrecisionZoomThreshhold && !forceDoubles)
		{
			doublePrecision = false;
			wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["doublePrecision"], 0);
			wilson.gl.uniform1i(wilson.uniforms["doublePrecision"], 0);
			
			wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
		}
		
		window.requestAnimationFrame(drawJuliaSet);
	}



	function drawJuliaSet(timestamp)
	{
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		let cx = doubleToDf(wilson.worldCenterX);
		let cy = doubleToDf(wilson.worldCenterY);
		
		
		
		wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["juliaMode"], juliaMode);
		wilsonHidden.gl.uniform2fv(wilsonHidden.uniforms["worldCenterX"], cx);
		wilsonHidden.gl.uniform2fv(wilsonHidden.uniforms["worldCenterY"], cy);
		
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
		
		wilsonHidden.gl.uniform1i(wilsonHidden.uniforms["numIterations"], numIterations);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["a"], a);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["b"], b);
		wilsonHidden.gl.uniform1f(wilsonHidden.uniforms["brightnessScale"], 20 * (Math.abs(zoomLevel) + 1));
		
		wilsonHidden.render.drawFrame();
		
		
		
		let pixelData = wilsonHidden.render.getPixelData();
		
		let brightnesses = new Array(resolutionHidden * resolutionHidden);
		
		for (let i = 0; i < resolutionHidden * resolutionHidden; i++)
		{
			brightnesses[i] = pixelData[4 * i] + pixelData[4 * i + 1] + pixelData[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightnessScale = (brightnesses[Math.floor(resolutionHidden * resolutionHidden * .96)] + brightnesses[Math.floor(resolutionHidden * resolutionHidden * .98)]) / 255 * 15 * (Math.abs(zoomLevel / 2) + 1);
		
		pastBrightnessScales.push(brightnessScale);
		
		let denom = pastBrightnessScales.length;
		
		if (denom > 10)
		{
			pastBrightnessScales.shift();
		}
		
		brightnessScale = Math.max(pastBrightnessScales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		wilson.gl.uniform1i(wilson.uniforms["juliaMode"], juliaMode);
		
		wilson.gl.uniform1f(wilson.uniforms["aspectRatio"], aspectRatio);
		
		wilson.gl.uniform2fv(wilson.uniforms["worldCenterX"], cx);
		wilson.gl.uniform2fv(wilson.uniforms["worldCenterY"], cy);
		
		wilson.gl.uniform1f(wilson.uniforms["worldSize"], Math.min(wilson.worldHeight, wilson.worldWidth) / 2);
		
		wilson.gl.uniform1i(wilson.uniforms["numIterations"], numIterations);
		wilson.gl.uniform1f(wilson.uniforms["a"], a);
		wilson.gl.uniform1f(wilson.uniforms["b"], b);
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
			wilson.worldCenterX += panVelocityX * wilson.worldWidth;
			wilson.worldCenterY += panVelocityY * wilson.worldHeight;
			
			wilson.worldCenterX = Math.min(Math.max(wilson.worldCenterX, -2), 2);
			wilson.worldCenterY = Math.min(Math.max(wilson.worldCenterY, -2), 2);
			
			
			
			panVelocityX *= panFriction;
			panVelocityY *= panFriction;
			
			if (Math.sqrt(panVelocityX * panVelocityX + panVelocityY * panVelocityY) < panVelocityStopThreshhold)
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

	window.addEventListener("resize", changeAspectRatio);
	Page.temporaryHandlers["resize"].push(changeAspectRatio);
	
	
	
	function doubleToDf(d)
	{
		let df = new Float32Array(2);
		const split = (1 << 29) + 1;
		
		let a = d * split;
		let hi = a - (a - d);
		let lo = d - hi;
		
		df[0] = hi;
		df[1] = lo;
		
		return [df[0], df[1]];
	}	
	}()