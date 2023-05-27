"use strict";

class MagicCarpet extends Applet
{
	grid_size = null;
	max_cage_size = null;
	unique_solution = null;
	
	cages = [];
	
	currently_drawing = false;
	
	cell_size = 200;
	
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
		
		this.run();
	}
	
	
	
	async run(grid_size = 8, max_cage_size = 16, unique_solution = true)
	{
		if (this.currently_drawing)
		{
			return;
		}
		
		this.grid_size = grid_size;
		this.max_cage_size = max_cage_size;
		
		this.cell_size = Math.min(200, Math.floor(4000 / this.grid_size));
		
		const canvas_size = this.grid_size * this.cell_size + 9;
		
		this.wilson.change_canvas_size(canvas_size, canvas_size);
		
		this.wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
		
		
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/magic-carpets/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.web_worker);
		
		
		
		this.web_worker.onmessage = (e) =>
		{
			this.cages = e.data[0];
			
			this.draw_grid();
		}
		
		this.web_worker.postMessage([this.grid_size, this.max_cage_size, unique_solution]);
	}
	
	
	
	draw_grid(rectangles_only = false)
	{
		const canvas_size = this.grid_size * this.cell_size + 9;
		
		if (rectangles_only)
		{
			this.wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
		}
		
		else
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvas_size, canvas_size);
		}
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		
		
		
		//Draw the light gridlines (width 4).
		if (!rectangles_only)
		{
			for (let i = 0; i <= this.grid_size; i++)
			{
				this.wilson.ctx.fillRect(this.cell_size * i + 3, 0, 4, canvas_size + 9);
				this.wilson.ctx.fillRect(0, this.cell_size * i + 3, canvas_size + 9, 4);
			}
		}
		
		
		
		this.wilson.ctx.fillRect(0, 0, this.cell_size * this.grid_size + 10, 10);
		this.wilson.ctx.fillRect(0, this.cell_size * this.grid_size, this.cell_size * this.grid_size + 10, 10);
		this.wilson.ctx.fillRect(0, 0, 10, this.cell_size * this.grid_size + 10);
		this.wilson.ctx.fillRect(this.cell_size * this.grid_size, 0, 10, this.cell_size * this.grid_size + 10);
		
		
		
		if (!rectangles_only)
		{
			this.wilson.ctx.font = `${this.cell_size * .6}px sans-serif`;
			
			//Finally, draw the numbers.
			for (let i = 0; i < this.cages.length; i++)
			{
				this.draw_number(i);
			}
		}
		
		this.currently_drawing = false;
	}
	
	
	
	draw_number(i)
	{
		const row = this.cages[i][0] + this.cages[i][4];
		const col = this.cages[i][1] + this.cages[i][5];
		const entry = `${this.cages[i][2] * this.cages[i][3]}`;
		
		const measurement = this.wilson.ctx.measureText(entry);
		
		this.wilson.ctx.fillText(entry, this.cell_size * col + (this.cell_size - measurement.width) / 2 + 5, this.cell_size * (row + 1) - (this.cell_size - measurement.actualBoundingBoxAscent - measurement.actualBoundingBoxDescent) / 2 + 4);
	}
	
	
	
	draw_solution(rectangles_only = false)
	{
		if (this.currently_drawing)
		{
			return;
		}
		
		this.currently_drawing = true;
		
		const canvas_size = this.grid_size * this.cell_size + 9;
		
		if (rectangles_only)
		{
			this.wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
		}
		
		else
		{
			this.wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			this.wilson.ctx.fillRect(0, 0, canvas_size, canvas_size);
		}
		
		this.draw_grid(rectangles_only);
		
		const delay = 500 / this.cages.length;
		
		this.draw_cage(0, delay, rectangles_only);
	}
	
	
	
	draw_cage(index, delay, rectangles_only)
	{
		if (index === this.cages.length)
		{
			this.currently_drawing = false;
			
			return;
		}
		
		
		
		let rgb = this.wilson.utils.hsv_to_rgb(index / this.cages.length * 6/7, 1, 1);
		
		this.wilson.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rectangles_only ? .5 : .2})`;
		
		const row = this.cages[index][0] * this.cell_size;
		const col = this.cages[index][1] * this.cell_size;
		const height = this.cages[index][2] * this.cell_size;
		const width = this.cages[index][3] * this.cell_size;
		
		this.wilson.ctx.fillRect(col + 10, row + 10, width - 10, height - 10);
		
		
		
		rgb = this.wilson.utils.hsv_to_rgb(index / this.cages.length * 6/7, 1, .9);
		
		this.wilson.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
		
		const row_adjust = this.cages[index][0] === 0 ? 0 : 5;
		const col_adjust = this.cages[index][1] === 0 ? 0 : 5;
		const height_adjust = (this.cages[index][0] + this.cages[index][2] === this.grid_size) || this.cages[index][0] === 0 ? 0 : 5;
		const width_adjust = (this.cages[index][1] + this.cages[index][3] === this.grid_size) || this.cages[index][1] === 0 ? 0 : 5;
		const height_adjust_2 = (this.cages[index][0] + this.cages[index][2] === this.grid_size) && this.cages[index][0] === 0 ? 5 : 0;
		const width_adjust_2 = (this.cages[index][1] + this.cages[index][3] === this.grid_size) && this.cages[index][1] === 0 ? 5 : 0;
		
		this.wilson.ctx.fillRect(col + 10 - col_adjust, row + 10 - row_adjust, width - 5 + width_adjust - width_adjust_2, 10);
		this.wilson.ctx.fillRect(col + 10 - col_adjust, row + 10 - row_adjust, 10, height - 5 + height_adjust - height_adjust_2);
		this.wilson.ctx.fillRect(col + width - 5 - col_adjust + width_adjust - width_adjust_2, row + 10 - row_adjust, 10, height - 5 + height_adjust - height_adjust_2);
		this.wilson.ctx.fillRect(col + 10 - col_adjust + width_adjust, row + height - 5 - row_adjust + height_adjust - height_adjust_2, width - 5 - width_adjust_2, 10);
		
		
		
		setTimeout(() => this.draw_cage(index + 1, delay, rectangles_only), delay);
	}
}