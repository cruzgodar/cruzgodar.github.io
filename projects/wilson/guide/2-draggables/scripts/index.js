import { showPage } from "/scripts/src/load-page.js";
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
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvasWidth: 1000,
		canvasHeight: 1000,
		
		worldWidth: 4,
		worldHeight: 4,
		worldCenterX: 0,
		worldCenterY: 0,
		
		
		
		useDraggables: true,
		
		draggablesMousedownCallback: onGrab,
		draggablesMousemoveCallback: onDrag,
		draggablesMouseupCallback: onRelease,
		
		draggablesTouchstartCallback: onGrab,
		draggablesTouchmoveCallback: onDrag,
		draggablesTouchendCallback: onRelease
	};
	
	let wilson = new Wilson($("#output-canvas"), options);
	
	let draggable = wilson.draggables.add(0, 1);
	
	
	
	let largeResolution = 1000;
	let smallResolution = 200;
	
	let a = 0;
	let b = 1;
	
	let resolution = 200;
	let lastResolution = 0;
	
	let lastTimestamp = -1;
	
	
	
	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		largeResolution = parseInt(resolutionInputElement.value || 1000);
		smallResolution = Math.floor(largeResolution / 5);
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-julia-set.png");
	});
	
	
	
	//Draw the initial frame.
	wilson.changeCanvasSize(smallResolution, smallResolution);
	window.requestAnimationFrame(drawJuliaSet);
	
	
	
	function onGrab(activeDraggable, x, y, event)
	{
		wilson.changeCanvasSize(smallResolution, smallResolution);
		
		a = x;
		b = y;
		resolution = smallResolution;
		
		window.requestAnimationFrame(drawJuliaSet);
	}

	function onDrag(activeDraggable, x, y, event)
	{
		a = x;
		b = y;
		resolution = smallResolution;
		
		window.requestAnimationFrame(drawJuliaSet);
	}

	function onRelease(activeDraggable, x, y, event)
	{
		wilson.changeCanvasSize(largeResolution, largeResolution);
		
		a = x;
		b = y;
		resolution = largeResolution;
		
		window.requestAnimationFrame(drawJuliaSet);
	}
	
	
	
	function generateJuliaSet(a, b, resolution)
	{
		let brightnesses = new Array(resolution * resolution);
		let maxBrightness = 0;
		let brightnessScale = 1.5;
		const numIterations = 100;
		
		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				let worldCoordinates = wilson.utils.interpolate.canvasToWorld(i, j);
				let x = worldCoordinates[0];
				let y = worldCoordinates[1];
				
				//This helps remove color banding.
				let brightness = Math.exp(-Math.sqrt(x*x + y*y));
				
				let k = 0;
				
				for (k = 0; k < numIterations; k++)
				{
					//z = z^2 + c = (x^2 - y^2 + a) + (2xy + b)i
					let temp = x*x - y*y + a;
					y = 2*x*y + b;
					x = temp;
					
					brightness += Math.exp(-Math.sqrt(x*x + y*y));
					
					if (x*x + y*y > 4)
					{
						break;
					}
				}
				
				if (k === numIterations)
				{
					//Color this pixel black.
					brightnesses[resolution * i + j] = 0;
				}
				
				else
				{
					brightnesses[resolution * i + j] = brightness;
					
					if (brightness > maxBrightness)
					{
						maxBrightness = brightness;
					}
				}
			}
		}
		
		//Now we need to create the actual pixel data in a Uint8ClampedArray to pass to Wilson.
		let imageData = new Uint8ClampedArray(resolution * resolution * 4);
		for (let i = 0; i < resolution * resolution; i++)
		{
			imageData[4 * i] = 0; //Red
			imageData[4 * i + 1] = brightnessScale * brightnesses[i] / maxBrightness * 255; //Green
			imageData[4 * i + 2] = brightnessScale * brightnesses[i] / maxBrightness * 255; //Blue
			imageData[4 * i + 3] = 255; //Alpha
		}
		
		return imageData;
	}
	
	
	
	function drawJuliaSet(timestamp)
	{
		let timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		
		
		if (timeElapsed === 0 && lastResolution === resolution)
		{
			return;
		}
		
		lastResolution = resolution;
		
		
		
		wilson.render.drawFrame(generateJuliaSet(a, b, resolution));
	}
	
	
	
	showPage();
	}()