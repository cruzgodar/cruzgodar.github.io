import { showPage } from "/scripts/src/load-page.js";
import {
	$,
	$$,
	addTemporaryListener
} from "/scripts/src/main.js";
import { Wilson } from "/scripts/wilson.js";

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
			
			uniform float a;
			uniform float b;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z = vec2(uv.x * 2.0, uv.y * 2.0);
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
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		let optionsHidden =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 100,
			canvasHeight: 100
		};
		
		
		
		let wilson = new Wilson($("#output-canvas-1"), options);

		wilson.render.initUniforms(["a", "b", "brightnessScale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilsonHidden = new Wilson($("#hidden-canvas-1"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["a", "b", "brightnessScale"]);
		
		
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilsonHidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
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
		wilson.changeCanvasSize(resolution, resolution);
		window.requestAnimationFrame(drawJuliaSet);
		
		
		
		function onDrag(activeDraggable, x, y, event)
		{
			a = x;
			b = y;
			
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
			
			
			
			wilson.gl.uniform1f(wilson.uniforms["a"], a);
			wilson.gl.uniform1f(wilson.uniforms["b"], b);
			wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], brightnessScale);
			
			wilson.render.drawFrame();
		}
	}
	
	
	
	{
		let fragShaderSource = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatio;
			
			uniform float a;
			uniform float b;
			uniform float brightnessScale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspectRatio >= 1.0)
				{
					z = vec2(uv.x * aspectRatio * 2.0, uv.y * 2.0);
				}
				
				else
				{
					z = vec2(uv.x * 2.0, uv.y / aspectRatio * 2.0);
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
			
			switchFullscreenCallback: changeAspectRatio
		};
		
		let optionsHidden =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: 100,
			canvasHeight: 100
		};
		
		
		
		let wilson = new Wilson($("#output-canvas-2"), options);

		wilson.render.initUniforms(["aspectRatio", "a", "b", "brightnessScale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilsonHidden = new Wilson($("#hidden-canvas-2"), optionsHidden);
		
		wilsonHidden.render.initUniforms(["aspectRatio", "a", "b", "brightnessScale"]);
		
		
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilsonHidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
		let aspectRatio = 1;
		
		let a = 0;
		let b = 1;
		
		let resolution = 1000;
		let resolutionHidden = 100;
		
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



		function drawJuliaSet(timestamp)
		{
			let timeElapsed = timestamp - lastTimestamp;
			
			lastTimestamp = timestamp;
			
			
			
			if (timeElapsed === 0)
			{
				return;
			}
			
			
			
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
	
	
	
	showPage();
}()