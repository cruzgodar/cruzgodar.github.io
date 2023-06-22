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
	
	let wilson = new Wilson($("#output-canvas"), options);
	
	
	
	let gridSize = null;
	
	let noBorders = null;
	
	let canvasScaleFactor = null;
	
	let webWorker = null;

	
	
	let generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", () =>
	{
		requestWilsonGraph(false);
	});
	
	
	
	let gridSizeInputElement = $("#grid-size-input");
	
	gridSizeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			requestWilsonGraph(false);
		}
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("wilsons-algorithm.png");
	});
	
	
	
	let maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");
	
	let noBordersCheckboxElement = $("#no-borders-checkbox");
	
	let progressBarElement = $("#progress-bar");
	
	let progressBarChildElement = $("#progress-bar span");
	
	
	
	Page.show();
	
	
	
	function requestWilsonGraph(reverseGenerateSkeleton)
	{
		gridSize = parseInt(gridSizeInputElement.value || 50);
		
		let maximumSpeed = maximumSpeedCheckboxElement.checked;
		
		noBorders = noBordersCheckboxElement.checked;
		
		let timeoutId = null;
		
		
		
		let canvasDim = 2 * gridSize + 1;
		
		if (noBorders)
		{
			canvasDim = gridSize;
		}
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		let canvasPixels = Math.min(window.innerWidth, window.innerHeight);
		
		canvasScaleFactor = Math.ceil(canvasPixels / canvasDim);
	
	
		
		if (noBorders)
		{
			wilson.changeCanvasSize(gridSize * canvasScaleFactor, gridSize * canvasScaleFactor);
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, gridSize * canvasScaleFactor, gridSize * canvasScaleFactor);
		}
		
		else
		{
			wilson.changeCanvasSize((2 * gridSize + 1) * canvasScaleFactor, (2 * gridSize + 1) * canvasScaleFactor);
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, (2 * gridSize + 1) * canvasScaleFactor, (2 * gridSize + 1) * canvasScaleFactor);
		}
		
		
		
		if (!reverseGenerateSkeleton)
		{
			try
			{
				progressBarElement.style.opacity = 0;
				
				setTimeout(() =>
				{
					progressBarElement.style.marginTop = 0;
					progressBarElement.style.marginBottom = 0;
					progressBarElement.style.height = 0;
				}, 600);
			}
			
			catch(ex) {}
		}
		
		$("#progress-bar span").insertAdjacentHTML("afterend", `<span></span>`);
		$("#progress-bar span").remove();
		
		
		
		try {webWorker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			webWorker = new Worker("/applets/wilsons-algorithm/scripts/worker.js");
		}
		
		else
		{
			webWorker = new Worker("/applets/wilsons-algorithm/scripts/worker.min.js");
		}
		
		Page.temporaryWebWorkers.push(webWorker);
		
		
		
		webWorker.onmessage = function(e)
		{
			if (e.data[0] === "log")
			{
				clearTimeout(timeoutId);
				
				console.log(...e.data.slice(1));
				return;
			}
			
			
			
			if (e.data[0] === "progress")
			{
				progressBarChildElement.style.width = e.data[1] + "%";
				
				if (e.data[1] === 100)
				{
					setTimeout(() =>
					{
						progressBarElement.style.opacity = 0;
						
						setTimeout(() =>
						{
							progressBarElement.style.marginTop = 0;
							progressBarElement.style.marginBottom = 0;
							progressBarElement.style.height = 0;
						}, Site.opacityAnimationTime);
					}, Site.opacityAnimationTime * 2);
				}
				
				return;
			}
			
			
			
			wilson.ctx.fillStyle = e.data[4];
			
			wilson.ctx.fillRect(e.data[0] * canvasScaleFactor, e.data[1] * canvasScaleFactor, e.data[2] * canvasScaleFactor, e.data[3] * canvasScaleFactor);
		}
		
		
		
		webWorker.postMessage([gridSize, maximumSpeed, noBorders, reverseGenerateSkeleton]);
		
		
		
		//The worker has three seconds to draw its initial line. If it can't do that, we cancel it and spawn a new worker that reverse-generates a skeleton.
		if (!reverseGenerateSkeleton)
		{
			timeoutId = setTimeout(() =>
			{
				console.log("Didn't draw anything within three seconds -- attempting to reverse-generate a skeleton.");
				
				webWorker.terminate();
				
				
				
				progressBarElement.style.marginTop = "10vh";
				progressBarElement.style.marginBottom = "-5vh";
				progressBarElement.style.height = "5vh";
				
				setTimeout(() =>
				{
					progressBarElement.style.opacity = 1;
				}, Site.opacityAnimationTime * 2);
				
				
				
				requestWilsonGraph(true);
			}, 3000);
		}
	}
	}()