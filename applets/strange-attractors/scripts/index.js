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
	
	let image = [];
	
	let brightnessScale = 10;
	
	
	
	let generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", requestLorenzAttractor);
	
	
	
	let gridSizeInputElement = Page.element.querySelector("#grid-size-input");
	
	let sigmaInputElement = Page.element.querySelector("#sigma-input");
	
	let rhoInputElement = Page.element.querySelector("#rho-input");
	
	let betaInputElement = Page.element.querySelector("#beta-input");
	
	
	
	gridSizeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			requestLorenzAttractor();
		}
	});
	
	sigmaInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			requestLorenzAttractor();
		}
	});
	
	rhoInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			requestLorenzAttractor();
		}
	});
	
	betaInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			requestLorenzAttractor();
		}
	});
	
	
	
	let downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("a-lorenz-attractor.png");
	});
	
	
	
	let maximumSpeedCheckboxElement = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	Page.show();
	
	
	
	function requestLorenzAttractor()
	{
		let gridSize = parseInt(gridSizeInputElement.value || 1000);
		
		let sigma = parseFloat(sigmaInputElement.value || 10);
		
		let rho = parseFloat(rhoInputElement.value || 28);
		
		let beta = parseFloat(betaInputElement.value || 2.666667);
		
		let maximumSpeed = maximumSpeedCheckboxElement.checked;
		
		
		
		wilson.changeCanvasSize(gridSize, gridSize);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, gridSize, gridSize);
		
		
		
		image = new Array(gridSize * gridSize);
		
		for (let i = 0; i < gridSize; i++)
		{
			for (let j = 0; j < gridSize; j++)
			{
				image[gridSize * i + j] = 0;
			}
		}
		
		
		
		try {webWorker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			webWorker = new Worker("/applets/strange-attractors/scripts/worker.js");
		}
		
		else
		{
			webWorker = new Worker("/applets/strange-attractors/scripts/worker.min.js");
		}
		
		Page.temporaryWebWorkers.push(webWorker);
		
		
		
		webWorker.onmessage = function(e)
		{
			let pixels = e.data[0];
			
			let rgb = e.data[1];
			
			
			
			for (let i = 0; i < pixels.length; i++)
			{
				image[gridSize * pixels[i][0] + pixels[i][1]]++;
				
				let brightnessAdjust = image[gridSize * pixels[i][0] + pixels[i][1]] / brightnessScale;
				
				wilson.ctx.fillStyle = `rgb(${rgb[0] * brightnessAdjust}, ${rgb[1] * brightnessAdjust}, ${rgb[2] * brightnessAdjust})`;
						
				wilson.ctx.fillRect(pixels[i][1], pixels[i][0], 1, 1);
			}
		}
		
		
		
		webWorker.postMessage([gridSize, sigma, rho, beta, maximumSpeed]);
	}
	}()