import { showPage } from "../../../../../scripts/src/loadPage.js";
import { $, $$ } from "/scripts/src/main.js";
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
		draggablesTouchmoveCallback: onDrag
	};



	let wilson = new Wilson($("#output-canvas"), options);

	wilson.render.initUniforms(["a", "b", "brightnessScale"]);

	let draggable = wilson.draggables.add(0, 1);
	
	
	
	let a = 0;
	let b = 1;
	
	let resolution = 1000;
	
	let lastTimestamp = -1;
	
	
	
	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		resolution = parseInt(resolutionInputElement.value || 1000);
		
		wilson.changeCanvasSize(resolution, resolution);
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-julia-set.png");
	});
	
	
	
	//Render the inital frame.
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
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["a"], a);
		wilson.gl.uniform1f(wilson.uniforms["b"], b);
		wilson.gl.uniform1f(wilson.uniforms["brightnessScale"], 10);
		
		wilson.render.drawFrame();
	}
	
	
	
	showPage();
	}()