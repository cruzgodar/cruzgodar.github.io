!function()
{
	"use strict";
	
	
	
	let imageSize = 1000;
	
	let image = null;
	
	let state = null;
	
	
	
	let planet1X = 0;
	let planet1Y = 1;
	
	let planet2X = -.866;
	let planet2Y = -.5;
	
	let planet3X = .866;
	let planet3Y = -.5;
	
	let crashThreshhold = .1;
	
	let dt = .01;
	
	
	
	let drawnFractal = false;
	
	let paused = false;
	
	let startingProcessId = null;
	
	
	
	let fragShaderSourceInit = `
		precision highp float;
		
		varying vec2 uv;
		
		
		
		void main(void)
		{
			gl_FragColor = vec4((uv + vec2(1.0, 1.0)) / 2.0, 0.5, 0.5);
			
			return;
		}
	`;
	
	
	
	let fragShaderSourceUpdate = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D uTexture;
		
		const float dt = .001;
		
		uniform vec2 planet1;
		uniform vec2 planet2;
		uniform vec2 planet3;
		
		const float worldSize = 15.0;
		
		const float crashThreshhold = .02;
		
		const float G = 1.0;
		
		
		
		void main(void)
		{
			vec4 state = (texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5)) * worldSize;
			
			vec4 dState = vec4(0.0, 0.0, 0.0, 0.0);
			
			
			
			float dX = planet1.x - state.x;
			float dY = planet1.y - state.y;
			
			if (abs(dX) > worldSize / 2.0)
			{
				if (dX < 0.0)
				{
					dX += worldSize;
				}
				
				else
				{
					dX -= worldSize;
				}
			}
			
			if (abs(dY) > worldSize / 2.0)
			{
				if (dY < 0.0)
				{
					dY += worldSize;
				}
				
				else
				{
					dY -= worldSize;
				}
			}
			
			vec2 planetDirection = vec2(dX, dY);
			
			float r = length(planetDirection);
			
			if (r < crashThreshhold)
			{
				gl_FragColor = vec4(planet1 / worldSize + vec2(.5, .5), 0.5, 0.5);
				return;
			}
			
			dState.zw += planetDirection / (r*r*r);
			
			
			
			dX = planet2.x - state.x;
			dY = planet2.y - state.y;
			
			if (abs(dX) > worldSize / 2.0)
			{
				if (dX < 0.0)
				{
					dX += worldSize;
				}
				
				else
				{
					dX -= worldSize;
				}
			}
			
			if (abs(dY) > worldSize / 2.0)
			{
				if (dY < 0.0)
				{
					dY += worldSize;
				}
				
				else
				{
					dY -= worldSize;
				}
			}
			
			planetDirection = vec2(dX, dY);
			
			r = length(planetDirection);
			
			if (r < crashThreshhold)
			{
				gl_FragColor = vec4(planet2 / worldSize + vec2(.5, .5), 0.5, 0.5);
				return;
			}
			
			dState.zw += planetDirection / (r*r*r);
			
			
			
			dX = planet3.x - state.x;
			dY = planet3.y - state.y;
			
			if (abs(dX) > worldSize / 2.0)
			{
				if (dX < 0.0)
				{
					dX += worldSize;
				}
				
				else
				{
					dX -= worldSize;
				}
			}
			
			if (abs(dY) > worldSize / 2.0)
			{
				if (dY < 0.0)
				{
					dY += worldSize;
				}
				
				else
				{
					dY -= worldSize;
				}
			}
			
			planetDirection = vec2(dX, dY);
			
			r = length(planetDirection);
			
			if (r < crashThreshhold)
			{
				gl_FragColor = vec4(planet3 / worldSize + vec2(.5, .5), 0.5, 0.5);
				return;
			}
			
			dState.zw += planetDirection / (r*r*r);
			
			
			
			dState.xy = state.zw;
			
			state = ((dt * dState + state) / worldSize) + vec4(.5, .5, .5, .5);
			
			state.xy = fract(state.xy);
			
			gl_FragColor = state;
		}
	`;
	
	
	
	let fragShaderSourceDraw = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D uTexture;
		
		
		
		vec3 hsv2rgb(vec3 c)
		{
			vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		
		
		
		void main(void)
		{
			vec4 state = (texture2D(uTexture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5));
			
			float h = atan(state.y, state.x) / (2.0 * 3.14159265258) + .5;
			
			float s = min((state.x * state.x + state.y * state.y) * 100.0, 1.0);
			
			float vAdd = .9 * (1.0 - 4.0 * ((uv.x * uv.x) / 4.0 + (uv.y * uv.y) / 4.0));
			
			float v = clamp(sqrt(state.z * state.z + state.w * state.w) + vAdd, 0.0, 1.0);
			
			vec3 rgb = hsv2rgb(vec3(h, s, v));
			
			gl_FragColor = vec4(rgb, 1.0);
		}
	`;
	
	
	
	let options =
	{
		renderer: "gpu",
		
		shader: fragShaderSourceInit,
		
		canvasWidth: imageSize,
		canvasHeight: imageSize,
		
		
		
		
		useFullscreen: true,
		
		useFullscreenButton: true,
		
		enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
		exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson($("#output-canvas"), options);
	
	
	
	wilson.render.loadNewShader(fragShaderSourceUpdate);
	
	wilson.render.initUniforms(["planet1", "planet2", "planet3"]);
	
	wilson.gl.uniform2f(wilson.uniforms["planet1"], planet1X, planet1Y);
	wilson.gl.uniform2f(wilson.uniforms["planet2"], planet2X, planet2Y);
	wilson.gl.uniform2f(wilson.uniforms["planet3"], planet3X, planet3Y);
	
	
	
	wilson.render.loadNewShader(fragShaderSourceDraw);
	
	wilson.render.createFramebufferTexturePair();
	wilson.render.createFramebufferTexturePair();
	
	
	
	let resolutionInputElement = $("#resolution-input");
	
	
	
	let generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", () =>
	{
		drawnFractal = false;
		
		drawThreeBodyProblemFractal();
	});
	
	
	
	let switchPlanetDrawerCanvasButtonElement = $("#switch-planet-drawer-canvas-button");
	
	switchPlanetDrawerCanvasButtonElement.style.transition = "filter .125s ease-in-out, opacity .25s ease-in-out";
	
	switchPlanetDrawerCanvasButtonElement.addEventListener("click", () =>
	{
		if (paused)
		{
			//What the actual fuck
			hidePlanetDrawerCanvas();
			window.requestAnimationFrame(hidePlanetDrawerCanvas);
			
			
			
			switchPlanetDrawerCanvasButtonElement.style.opacity = 0;
			
			setTimeout(() =>
			{
				switchPlanetDrawerCanvasButtonElement.textContent = "Pick Particle";
				
				switchPlanetDrawerCanvasButtonElement.style.opacity = 1;
			}, 250);
		}
		
		else
		{
			paused = true;
			
			
			
			switchPlanetDrawerCanvasButtonElement.style.opacity = 0;
			
			setTimeout(() =>
			{
				switchPlanetDrawerCanvasButtonElement.textContent = "Return to Fractal";
				
				switchPlanetDrawerCanvasButtonElement.style.opacity = 1;
			}, 250);
		}
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-three-body-system.png");
	});
	
	
	
	function drawThreeBodyProblemFractal()
	{
		startingProcessId = Site.appletProcessId;
		
		imageSize = parseInt(resolutionInputElement.value || 1000);
		
		wilson.changeCanvasSize(imageSize, imageSize);
		
		
		
		wilson.gl.useProgram(wilson.render.shaderPrograms[1]);
		
		
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvasWidth, wilson.canvasHeight, 0, wilson.gl.RGBA, wilson.gl.FLOAT, null);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[1].texture);
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvasWidth, wilson.canvasHeight, 0, wilson.gl.RGBA, wilson.gl.FLOAT, null);
		
		
		
		wilson.gl.useProgram(wilson.render.shaderPrograms[0]);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, wilson.render.framebuffers[0].framebuffer);
		
		wilson.render.drawFrame();
	
	
		
		window.requestAnimationFrame(drawFrame);
		
		
		
		drawnFractal = true;
	}
	
	
	
	function drawFrame(timestamp)
	{
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		wilson.gl.useProgram(wilson.render.shaderPrograms[1]);
		
		wilson.gl.uniform2f(wilson.uniforms["planet1"], planet1X, planet1Y);
		wilson.gl.uniform2f(wilson.uniforms["planet2"], planet2X, planet2Y);
		wilson.gl.uniform2f(wilson.uniforms["planet3"], planet3X, planet3Y);
		
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, wilson.render.framebuffers[1].framebuffer);
		
		wilson.render.drawFrame();
		
		
		
		wilson.gl.useProgram(wilson.render.shaderPrograms[2]);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[1].texture);
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, null);
		
		wilson.render.drawFrame();
		
		
		
		//At this point, we've gone Init --> F1 --> T1 --> Update --> F2 --> T2 --> Draw. T2 is still bound, which is correct, but we cannot be bound to F2, so we bind to F1.
		
		
		
		wilson.gl.useProgram(wilson.render.shaderPrograms[1]);
		
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, wilson.render.framebuffers[0].framebuffer);
		
		wilson.render.drawFrame();
		
		
		
		wilson.gl.useProgram(wilson.render.shaderPrograms[2]);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, null);
		
		wilson.render.drawFrame();
		
		
		
		if (startingProcessId !== Site.appletProcessId)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		if (!paused)
		{
			window.requestAnimationFrame(drawFrame);
		}
	}
	
	
	
	
	
	let imageSizePlanetDrawer = 2000;
	
	let planetDrawerCanvasVisible = 0;
	
	
	
	let worldSize = 15;
	
	
	
	let optionsPlanetDrawer =
	{
		renderer: "cpu",
		
		worldWidth: worldSize,
		worldHeight: worldSize,
		
		canvasWidth: imageSizePlanetDrawer,
		canvasHeight: imageSizePlanetDrawer,
		
		mousemoveCallback: drawPreviewPlanet,
		touchmoveCallback: drawPreviewPlanet,
		
		mousedownCallback: startPlanetAnimation,
		touchendCallback: startPlanetAnimation,
		
		
		
		useDraggables: true,
		
		draggablesMousemoveCallback: onDragDraggable,
		draggablesTouchmoveCallback: onDragDraggable
	};
	
	let wilsonPlanetDrawer = new Wilson($("#planet-drawer-canvas"), optionsPlanetDrawer);
	
	wilsonPlanetDrawer.draggables.add(0, 1);
	wilsonPlanetDrawer.draggables.add(-.866, -.5);
	wilsonPlanetDrawer.draggables.add(.866, -.5);
	
	let sx = 0;
	let sy = 0;
	let vx = 0;
	let vy = 0;
	
	
	
	let frame = 0;
	
	let initialSx = 0;
	let initialSy = 0;
	
	let lastTimestamp = -1;
	
	wilsonPlanetDrawer.ctx.lineWidth = imageSizePlanetDrawer / 100;
		
	wilsonPlanetDrawer.ctx.strokeStyle = "rgb(127, 0, 255)";
	
	wilsonPlanetDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
	
	
	
	Page.show();
	
	
	
	function drawPreviewPlanet(x, y, xDelta, yDelta, e)
	{
		if (!paused)
		{
			return;
		}
		
		if (planetDrawerCanvasVisible === 0)
		{
			showPlanetDrawerCanvasPreview();
		}
		
		if (planetDrawerCanvasVisible !== 2)
		{
			sx = x;
			sy = -y;
			
			vx = 0;
			vy = 0;
			
			window.requestAnimationFrame(drawFramePlanetDrawer);
		}
	}
	
	
	
	function startPlanetAnimation(x, y, e)
	{
		if (planetDrawerCanvasVisible === 1)
		{
			initialSx = sx;
			initialSy = sy;
			
			vx = 0;
			vy = 0;
			
			frame = 0;
			
			showPlanetDrawerCanvas();
		}
	}
	
	
	
	wilsonPlanetDrawer.draggables.container.addEventListener("mouseleave", () =>
	{
		if (planetDrawerCanvasVisible === 1 || frame < 3)
		{
			wilsonPlanetDrawer.canvas.style.opacity = 0;
			
			planetDrawerCanvasVisible = 0;
		}
	});
	
	
	
	function showPlanetDrawerCanvasPreview()
	{
		if (!drawnFractal)
		{
			return;
		}
		
		paused = true;
		
		wilsonPlanetDrawer.canvas.style.opacity = .5;
		
		planetDrawerCanvasVisible = 1;
	}
	
	function showPlanetDrawerCanvas()
	{
		if (!drawnFractal)
		{
			return;
		}
		
		wilsonPlanetDrawer.canvas.style.opacity = 1;
		
		planetDrawerCanvasVisible = 2;
		
		window.requestAnimationFrame(drawFramePlanetDrawer);
	}
	
	function hidePlanetDrawerCanvas()
	{
		if (!drawnFractal)
		{
			return;
		}
		
		paused = false;
		
		window.requestAnimationFrame(drawFrame);
		
		wilsonPlanetDrawer.canvas.style.opacity = 0;
		
		planetDrawerCanvasVisible = 0;
	}
	
	
	
	function drawFramePlanetDrawer(timestamp)
	{	
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		frame++;
		
		
		
		wilsonPlanetDrawer.ctx.fillStyle = "rgb(0, 0, 0)";
		
		wilsonPlanetDrawer.ctx.fillRect(0, 0, imageSizePlanetDrawer, imageSizePlanetDrawer);
		
		
		
		let x = sx / worldSize;
		let y = sy / worldSize;
		
		let z = vx / worldSize;
		let w = vy / worldSize;
		
		let hue = Math.atan2(y, -x) / (2 * Math.PI) + 1;
		let saturation = Math.min(Math.min((x*x + y*y) * 50, (1 - Math.max(Math.abs(x), Math.abs(y))) * 5), 1);
		
		let valueAdd = .9 * ((1 - initialSx / (2 * Math.PI)) * (1 - initialSx / (2 * Math.PI)) + (1 - initialSy / (2 * Math.PI)) * (1 - initialSy / (2 * Math.PI))) * 4;
		
		let value = Math.min(Math.pow(z*z + w*w, .5) + valueAdd, 1);
		
		let rgb = HSVtoRGB(hue, saturation, value);
		
		wilsonPlanetDrawer.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		
		
		wilsonPlanetDrawer.ctx.beginPath();
		wilsonPlanetDrawer.ctx.arc(imageSizePlanetDrawer * (x + .5), imageSizePlanetDrawer * (y + .5), 30, 0, 2 * Math.PI, false);
		wilsonPlanetDrawer.ctx.fill();
		
		
		
		if (planetDrawerCanvasVisible === 2)
		{
			updateParameters();
			
			window.requestAnimationFrame(drawFramePlanetDrawer);
		}
	}
	
	
	
	function updateParameters()
	{
		let dVx = 0;
		let dVy = 0;
		
		
		
		let dV = getAccelerationToPlanet(planet1X, -planet1Y);
		
		dVx += dV[0];
		dVy += dV[1];
		
		if (dV[2] < crashThreshhold)
		{
			sx = planet1X;
			sy = -planet1Y;
			vx = 0;
			vy = 0;
			
			return;
		}
		
		
		
		dV = getAccelerationToPlanet(planet2X, -planet2Y);
		
		dVx += dV[0];
		dVy += dV[1];
		
		if (dV[2] < crashThreshhold)
		{
			sx = planet2X;
			sy = -planet2Y;
			vx = 0;
			vy = 0;
			
			return;
		}
		
		
		
		dV = getAccelerationToPlanet(planet3X, -planet3Y);
		
		dVx += dV[0];
		dVy += dV[1];
		
		if (dV[2] < crashThreshhold)
		{
			sx = planet3X;
			sy = -planet3Y;
			vx = 0;
			vy = 0;
			
			return;
		}
		
		
		
		sx += vx * dt;
		sy += vy * dt;
		vx += dVx * dt;
		vy += dVy * dt;
		
		while (sx < -worldSize / 2)
		{
			sx += worldSize;
		}
		
		while (sx > worldSize / 2)
		{
			sx -= worldSize;
		}
		
		while (sy < -worldSize / 2)
		{
			sy += worldSize;
		}
		
		while (sy > worldSize / 2)
		{
			sy -= worldSize;
		}
	}
	
	
	
	function getAccelerationToPlanet(planetX, planetY)
	{
		let dX = planetX - sx;
		let dY = planetY - sy;
		
		let r = 0;
		
		
		
		if (Math.abs(dX) > worldSize / 2)
		{
			if (dX < 0)
			{
				dX += worldSize;
			}
			
			else
			{
				dX -= worldSize;
			}
		}
		
		if (Math.abs(dY) > worldSize / 2)
		{
			if (dY < 0)
			{
				dY += worldSize;
			}
			
			else
			{
				dY -= worldSize;
			}
		}
		
		
		
		r = Math.sqrt(dX*dX + dY*dY);
		
		return [dX / (r*r*r), dY / (r*r*r), r];
	}
	
	
	
	function onDragDraggable(activeDraggable, x, y, event)
	{
		if (activeDraggable === 0)
		{
			planet1X = x;
			planet1Y = y;
		}
		
		else if (activeDraggable === 1)
		{
			planet2X = x;
			planet2Y = y;
		}
		
		else
		{
			planet3X = x;
			planet3Y = y;
		}
	}
	
	
	
	function HSVtoRGB(h, s, v)
	{
		let r, g, b, i, f, p, q, t;
		
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		
		switch (i % 6)
		{
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
	    
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	}()