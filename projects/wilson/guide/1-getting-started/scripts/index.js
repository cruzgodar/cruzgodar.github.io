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
		let options =
		{
			renderer: "cpu",
			
			canvasWidth: 500,
			canvasHeight: 500,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0
		};
		
		let wilson = new Wilson($("#output-canvas-1"), options);
		
		
		
		let aInputElement = $("#a-1-input");
		let bInputElement = $("#b-1-input");
		let resolutionInputElement = $("#resolution-1-input");

		let generateButtonElement = $("#generate-1-button");

		generateButtonElement.addEventListener("click", () =>
		{
			let a = parseFloat(aInputElement.value || 0);
			let b = parseFloat(bInputElement.value || 1);
			let resolution = parseInt(resolutionInputElement.value || 500);
			
			wilson.changeCanvasSize(resolution, resolution);
			
			window.requestAnimationFrame(() => wilson.render.drawFrame(generateJuliaSet(a, b, resolution)));
		});
		
		
		
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
	}
	
	
	
	
	{
		let options =
		{
			renderer: "hybrid",
			
			canvasWidth: 500,
			canvasHeight: 500,
			
			worldWidth: 4,
			worldHeight: 4,
			worldCenterX: 0,
			worldCenterY: 0
		};
		
		let wilson = new Wilson($("#output-canvas-2"), options);
		
		
		
		let aInputElement = $("#a-2-input");
		let bInputElement = $("#b-2-input");
		let resolutionInputElement = $("#resolution-2-input");

		let generateButtonElement = $("#generate-2-button");

		generateButtonElement.addEventListener("click", () =>
		{
			let a = parseFloat(aInputElement.value || 0);
			let b = parseFloat(bInputElement.value || 1);
			let resolution = parseInt(resolutionInputElement.value || 500);
			
			wilson.changeCanvasSize(resolution, resolution);
			
			window.requestAnimationFrame(() => wilson.render.drawFrame(generateJuliaSet(a, b, resolution)));
		});
		
		
		
		let downloadButtonElement = $("#download-2-button");
		
		downloadButtonElement.addEventListener("click", () =>
		{
			wilson.downloadFrame("a-julia-set.png");
		});
		
		
		
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
	}
	
	
	
	Page.show();
	}()