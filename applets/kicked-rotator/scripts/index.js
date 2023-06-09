!function()
{
	"use strict";
	
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvasWidth: 1000,
		canvasHeight: 1000,
		
		
		
		useFullscreen: true,
	
		useFullscreenButton: true,
		
		enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
		exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let webWorker = null;
	
	let hues = [];
	let values = [];
	let numWrites = [];
	
	
	
	
	let generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", requestKickedRotator);
	
	
	
	let gridSizeInputElement = Page.element.querySelector("#grid-size-input");
	
	let kInputElement = Page.element.querySelector("#k-input");
	
	let orbitSeparationInputElement = Page.element.querySelector("#orbit-separation-input");
	
	
	
	gridSizeInputElement.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			requestKickedRotator();
		}
	});
	
	kInputElement.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			requestKickedRotator();
		}
	});
	
	orbitSeparationInputElement.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			requestKickedRotator();
		}
	});
	
	
	
	let downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-kicked-rotator.png");
	});
	
	
	
	Page.show();
	
	
	
	function requestKickedRotator()
	{
		let gridSize = parseInt(gridSizeInputElement.value || 500);
		
		let K = parseFloat(kInputElement.value || .75);
		
		let orbitSeparation = parseInt(orbitSeparationInputElement.value || 3);
		
		
		
		values = new Array(gridSize * gridSize);
		
		for (let i = 0; i < gridSize; i++)
		{
			for (let j = 0; j < gridSize; j++)
			{
				values[gridSize * i + j] = 0;
			}
		}
		
		
		
		wilson.changeCanvasSize(gridSize, gridSize);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, gridSize, gridSize);
		
		
		
		try {webWorker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			webWorker = new Worker("/applets/kicked-rotator/scripts/worker.js");
		}
		
		else
		{
			webWorker = new Worker("/applets/kicked-rotator/scripts/worker.min.js");
		}
		
		Page.temporaryWebWorkers.push(webWorker);
		
		
		
		webWorker.onmessage = function(e)
		{
			let valueDelta = e.data[0];
			let hue = e.data[1];
			
			for (let i = 0; i < gridSize; i++)
			{
				for (let j = 0; j < gridSize; j++)
				{
					if (valueDelta[gridSize * i + j] > values[gridSize * i + j])
					{
						let rgb = wilson.utils.hsvToRgb(hue, 1, valueDelta[gridSize * i + j] / 255);
						
						wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
						
						wilson.ctx.fillRect(j, i, 1, 1);
						
						values[gridSize * i + j] = valueDelta[gridSize * i + j];
					}
				}
			}
		}
		
		
		
		webWorker.postMessage([gridSize, K, orbitSeparation]);
	}
	}()