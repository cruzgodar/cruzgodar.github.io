import { Applet } from "/scripts/src/applets.mjs"

export class SudokuGenerator extends Applet
{
	grid = [];
	
	webWorker = null;
	
	generatedFirstPuzzle = false;



	constructor(canvas)
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",
			
			canvasWidth: 1000,
			canvasHeight: 1000
		};
		
		this.wilson = new Wilson($("#sudoku-grid"), options);
	}
	
	
	
	run()
	{
		this.grid = new Array(9);
		
		for (let i = 0; i < 9; i++)
		{
			this.grid[i] = new Array(9);
			
			for (let j = 0; j < 9; j++)
			{
				this.grid[i][j] = 0;
			}
		}
		
		
		
		if (this.generatedFirstPuzzle)
		{
			this.wilson.canvas.style.opacity = 0;
			
			setTimeout(() =>
			{
				const canvasSize = 9 * 200 + 9;
				
				this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
			}, Site.opacityAnimationTime);
		}
		
		else
		{
			const canvasSize = 9 * 200 + 9;
			
			this.wilson.canvas.setAttribute("width", canvasSize);
			this.wilson.canvas.setAttribute("height", canvasSize);
			
			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
		}
		
		
		
		try {this.webWorker.terminate();}
		catch(ex) {}
		
		this.webWorker = new Worker(`/applets/sudoku-generator/scripts/worker.min.js`);
		
		this.workers.push(this.webWorker);
		
		
		
		this.webWorker.onmessage = e =>
		{
			this.grid = e.data[0];
			
			this.drawGrid(false);
			
			this.wilson.canvas.style.opacity = 1;
			
			this.generatedFirstPuzzle = true;
		}
		
		
		
		if (this.generatedFirstPuzzle)
		{
			setTimeout(() =>
			{
				this.webWorker.postMessage([]);
			}, Site.opacityAnimationTime);
		}
		
		else
		{
			this.webWorker.postMessage([]);
		}
	}
	
	
	
	drawGrid(printMode)
	{
		const canvasSize = 9 * 200 + 9;
		
		
		
		if (printMode)
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvasSize, canvasSize);
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		}
		
		else
		{
			this.wilson.ctx.clearRect(0, 0, canvasSize, canvasSize);
			
			if (Site.Settings.urlVars["theme"] === 1)
			{
				if (Site.Settings.urlVars["contrast"] === 1)
				{
					this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
				}
				
				else
				{
					this.wilson.ctx.fillStyle = "rgb(192, 192, 192)";
				}
			}
			
			else
			{
				if (Site.Settings.urlVars["contrast"] === 1)
				{
					this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				}
				
				else
				{
					this.wilson.ctx.fillStyle = "rgb(64, 64, 64)";
				}
			}
		}
		
		
		
		//Draw the inner gridlines (width 2).
		for (let i = 0; i <= 9; i++)
		{
			if (i % 3 === 0)
			{
				this.wilson.ctx.fillRect(200 * i, 0, 10, canvasSize + 9);
				this.wilson.ctx.fillRect(0, 200 * i, canvasSize + 9, 10);
			}
			
			this.wilson.ctx.fillRect(200 * i + 4, 0, 2, canvasSize + 9);
			this.wilson.ctx.fillRect(0, 200 * i + 4, canvasSize + 9, 2);
		}		
		
		
		
		//Finally, draw the numbers.
		for (let i = 0; i < 9; i++)
		{
			for (let j = 0; j < 9; j++)
			{
				this.wilson.ctx.font = "150px sans-serif";
				
				if (this.grid[i][j] !== 0)
				{
					this.wilson.ctx.fillText(this.grid[i][j], 200 * j + 64, 200 * i + 156);
				}
			}
		}
	}
}