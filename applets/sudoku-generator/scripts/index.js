!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvasWidth: 1000,
		canvasHeight: 1000
	};
	
	let wilson = new Wilson($("#sudoku-grid"), options);
	
	
	
	let grid = [];
	
	let webWorker = null;
	
	let generatedFirstPuzzle = false;
	
	
	
	let generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", requestSudokuGrid);
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("sudoku.png");
	});
	
	
	
	Page.show();
	
	
	
	function requestSudokuGrid()
	{
		grid = new Array(9);
		
		for (let i = 0; i < 9; i++)
		{
			grid[i] = new Array(9);
			
			for (let j = 0; j < 9; j++)
			{
				grid[i][j] = 0;
			}
		}
		
		
		
		if (generatedFirstPuzzle)
		{
			wilson.canvas.style.opacity = 0;
			
			
			
			setTimeout(() =>
			{
				let canvasSize = 9 * 200 + 9;
				
				wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
			}, Site.opacityAnimationTime);
		}
		
		else
		{
			let canvasSize = 9 * 200 + 9;
			
			wilson.canvas.setAttribute("width", canvasSize);
			wilson.canvas.setAttribute("height", canvasSize);
			
			wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
		}
		
		
		
		try {webWorker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			webWorker = new Worker("/applets/sudoku-generator/scripts/worker.js");
		}
		
		else
		{
			webWorker = new Worker("/applets/sudoku-generator/scripts/worker.min.js");
		}
		
		Page.temporaryWebWorkers.push(webWorker);
		
		
		
		webWorker.onmessage = function(e)
		{
			if (e.data[0] === "log")
			{
				console.log(...e.data.slice(1));
			}
			
			else
			{
				grid = e.data[0];
				
				drawSudokuGrid(false);
				
				wilson.canvas.style.opacity = 1;
				
				generatedFirstPuzzle = true;
			}
		}
		
		
		
		if (generatedFirstPuzzle)
		{
			setTimeout(() =>
			{
				webWorker.postMessage([]);
			}, Site.opacityAnimationTime);
		}
		
		else
		{
			webWorker.postMessage([]);
		}
	}
	
	
	
	function drawSudokuGrid(printMode)
	{
		let canvasSize = 9 * 200 + 9;
		
		
		
		if (printMode)
		{
			wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		}
		
		else
		{
			wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
			
			if (Site.Settings.urlVars["theme"] === 1)
			{
				if (Site.Settings.urlVars["contrast"] === 1)
				{
					wilson.ctx.fillStyle = "rgb(255, 255, 255)";
				}
				
				else
				{
					wilson.ctx.fillStyle = "rgb(192, 192, 192)";
				}
			}
			
			else
			{
				if (Site.Settings.urlVars["contrast"] === 1)
				{
					wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				}
				
				else
				{
					wilson.ctx.fillStyle = "rgb(64, 64, 64)";
				}
			}
		}
		
		
		
		//Draw the inner gridlines (width 2).
		for (let i = 0; i <= 9; i++)
		{
			if (i % 3 === 0)
			{
				wilson.ctx.fillRect(200 * i, 0, 10, canvasSize + 9);
				wilson.ctx.fillRect(0, 200 * i, canvasSize + 9, 10);
			}
			
			wilson.ctx.fillRect(200 * i + 4, 0, 2, canvasSize + 9);
			wilson.ctx.fillRect(0, 200 * i + 4, canvasSize + 9, 2);
		}		
		
		
		
		//Finally, draw the numbers.
		for (let i = 0; i < 9; i++)
		{
			for (let j = 0; j < 9; j++)
			{
				wilson.ctx.font = "150px sans-serif";
				
				if (grid[i][j] !== 0)
				{
					wilson.ctx.fillText(grid[i][j], 200 * j + 64, 200 * i + 156);
				}
			}
		}
	}
	}()