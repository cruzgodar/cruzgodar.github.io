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
			this.cages = e.data[0];
			
			this.draw_grid(false);
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
		
		this.wilson.ctx.fillRect(0, 0, 200 * this.grid_size + 10, 10);
		this.wilson.ctx.fillRect(0, 200 * this.grid_size, 200 * this.grid_size + 10, 10);
		this.wilson.ctx.fillRect(0, 0, 10, 200 * this.grid_size + 10);
		this.wilson.ctx.fillRect(200 * this.grid_size, 0, 10, 200 * this.grid_size + 10);
		
		this.wilson.ctx.font = "120px sans-serif";
		
		//Finally, draw the numbers.
		for (let i = 0; i < this.cages.length; i++)
		{
			this.draw_number(i);
		}
	}
	
	draw_number(i)
	{
		const row = this.cages[i][0] + this.cages[i][4];
		const col = this.cages[i][1] + this.cages[i][5];
		const entry = ` ${this.cages[i][2] * this.cages[i][3]} `;
		
		if (entry.length === 3)
		{
			this.wilson.ctx.fillText(entry, 200 * col + 39, 200 * row + 146);
		}
		
		else
		{
			this.wilson.ctx.fillText(entry, 200 * col, 200 * row + 146);
		}
	}
	
	
	
	draw_solution()
	{
		const delay = 1000 / this.cages.length;
		
		this.draw_cage(0, delay);
	}
	
	
	
	draw_cage(index, delay)
	{
		if (index === this.cages.length)
		{
			return;
		}
		
		
		
		let rgb = this.wilson.utils.hsv_to_rgb(index / this.cages.length * 6/7, 1, .95);
		
		this.wilson.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, .1)`;
		
		const row = this.cages[index][0] * 200;
		const col = this.cages[index][1] * 200;
		const height = this.cages[index][2] * 200;
		const width = this.cages[index][3] * 200;
		
		this.wilson.ctx.fillRect(col + 5, row + 5, width, height);
		
		
		
		rgb = this.wilson.utils.hsv_to_rgb(index / this.cages.length * 6/7, 1, .7);
		
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
		
		
		
		if (Site.Settings.url_vars["theme"] === 1)
		{
			this.wilson.ctx.fillStyle = "rgb(192, 192, 192)";
		}
		
		else
		{
			this.wilson.ctx.fillStyle = "rgb(64, 64, 64)";
		}
		
		this.draw_number(index);
		
		
		
		setTimeout(() => this.draw_cage(index + 1, delay), delay);
	}
}