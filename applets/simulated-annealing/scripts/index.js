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
	
	
	
	let webWorker = null;
	
	

	let generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", requestAnnealingGraph);
	
	
	
	let numNodesInputElement = $("#num-nodes-input");
	
	numNodesInputElement.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			requestAnnealingGraph();
		}
	});
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("simulated-annealing.png");
	});
	
	
	let maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");
	
	
	
	Page.show();
	
	
	
	function requestAnnealingGraph()
	{
		let numNodes = parseInt(numNodesInputElement.value || 20);
		let maximumSpeed = maximumSpeedCheckboxElement.checked;
		
		let resolution = 1000;
		
		
		
		wilson.changeCanvasSize(resolution, resolution);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		
		
		try {webWorker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			webWorker = new Worker("/applets/simulated-annealing/scripts/worker.js");
		}
		
		else
		{
			webWorker = new Worker("/applets/simulated-annealing/scripts/worker.min.js");
		}
		
		Page.temporaryWebWorkers.push(webWorker);
		
		
		
		webWorker.onmessage = function(e)
		{
			//A circle with arguments (x, y, r, color).
			if (e.data[0] === 0)
			{
				wilson.ctx.fillStyle = e.data[4];
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(e.data[1], e.data[2]);
				wilson.ctx.arc(e.data[1], e.data[2], e.data[3], 0, 2 * Math.PI, false);
				wilson.ctx.fill();
			}
			
			//A line with arguments (x1, y1, x2, y2, color).
			else if (e.data[0] === 1)
			{
				wilson.ctx.strokeStyle = e.data[5];
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(e.data[1], e.data[2]);
				wilson.ctx.lineTo(e.data[3], e.data[4]);
				wilson.ctx.stroke();
			}
			
			else
			{
				wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				wilson.ctx.fillRect(0, 0, resolution, resolution);
			}
		}
		
		
		
		webWorker.postMessage([resolution, numNodes, maximumSpeed]);
	}
	}()