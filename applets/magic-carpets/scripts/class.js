"use strict";

class MagicCarpet extends Applet
{
	grid_size = null;
	max_cage_size = null;
	
	cages = [];
	
	web_worker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvas_width: 500,
			canvas_height: 500
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	async run(grid_size, max_cage_size)
	{
		this.grid_size = grid_size;
		this.max_cage_size = max_cage_size;
		
		
		
		const canvas_size = this.grid_size * 200 + 9;
		
		this.wilson.change_canvas_size(canvas_size, canvas_size);
		
		this.wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
		
		
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/magic-carpets/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.web_worker);
		
		
		
		this.web_worker.onmessage = (e) =>
		{
			console.log(e.data);
			return;
			/*
			this.cages = e.data[0];
			this.cages_by_location = e.data[1];
			
			this.draw_grid(false);
			*/
		}
		
		this.web_worker.postMessage([this.grid_size, this.max_cage_size]);
	}
	
	
	
	draw_grid(print_mode)
	{
		const canvas_size = this.grid_size * 200 + 9;
		
		if (print_mode)
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvas_size, canvas_size);
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		}
		
		else
		{
			this.wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
			
			if (Site.Settings.url_vars["theme"] === 1)
			{
				this.wilson.ctx.fillStyle = "rgb(192, 192, 192)";
			}
			
			else
			{
				this.wilson.ctx.fillStyle = "rgb(64, 64, 64)";
			}
		}
		
		
		
		//Draw the light gridlines (width 2).
		for (let i = 0; i <= this.grid_size; i++)
		{
			this.wilson.ctx.fillRect(200 * i + 4, 0, 2, canvas_size + 9);
			this.wilson.ctx.fillRect(0, 200 * i + 4, canvas_size + 9, 2);
		}
		
		/*
		
		//Now draw the cages. For each cell of the grid, we draw a line with width 10 if an adjacent cell is part of a different cage.
		for (let i = 0; i < this.grid_size; i++)
		{
			for (let j = 0; j < this.grid_size; j++)
			{
				if (i === 0 || this.cages_by_location[i - 1][j] !== this.cages_by_location[i][j])
				{
					this.wilson.ctx.fillRect(200 * j, 200 * i, 210, 10);
				}
				
				if (i === this.grid_size - 1 || this.cages_by_location[i + 1][j] !== this.cages_by_location[i][j])
				{
					this.wilson.ctx.fillRect(200 * j, 200 * (i + 1), 210, 10);
				}
				
				if (j === 0 || this.cages_by_location[i][j - 1] !== this.cages_by_location[i][j])
				{
					this.wilson.ctx.fillRect(200 * j, 200 * i, 10, 210);
				}
				
				if (j === this.grid_size - 1 || this.cages_by_location[i][j + 1] !== this.cages_by_location[i][j])
				{
					this.wilson.ctx.fillRect(200 * (j + 1), 200 * i, 10, 210);
				}
			}
		}
		
		
		
		//Finally, draw the numbers.
		for (let i = 0; i < this.cages.length; i++)
		{
			//Find the leftmost cell in the top row of the cage.
			let top_left_cell = [this.grid_size, this.grid_size];
			
			for (let j = 0; j < this.cages[i][2].length; j++)
			{
				const row = this.cages[i][2][j][0];
				const col = this.cages[i][2][j][1];
				
				if (row < top_left_cell[0])
				{
					top_left_cell = [row, col];
				}
				
				else if (row === top_left_cell[0] && col < top_left_cell[1])
				{
					top_left_cell = [row, col];
				}
			}
			
			
			
			let label = "";
			
			if (this.cages[i][0] === "+")
			{
				label = this.cages[i][1] + "+";
			}
			
			else if (this.cages[i][0] === "x")
			{
				label = this.cages[i][1] + "\u00D7";
			}
			
			else if (this.cages[i][0] === "-")
			{
				label = this.cages[i][1] + "\u2013";
			}
			
			else if (this.cages[i][0] === ":")
			{
				label = this.cages[i][1] + "\uA789";
			}
			
			else
			{
				label = this.cages[i][1] + "";
			}
			
			
			
			let font_size = null;
			
			if (label.length <= 6)
			{
				this.wilson.ctx.font = "50px sans-serif";
				
				font_size = 50;
			}
			
			else
			{
				this.wilson.ctx.font = (300 / label.length) + "px sans-serif";
				
				font_size = 300 / label.length;
			}
			
			this.wilson.ctx.fillText(label, 200 * top_left_cell[1] + 15, 200 * top_left_cell[0] + font_size + 5);
		}
		*/
	}
}