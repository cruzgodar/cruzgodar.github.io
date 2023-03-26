"use strict";

class AbelianSandpile extends Applet
{
	grid_size = 100;
	
	canvas_scale_factor = 5;
	
	web_worker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvas_width: this.grid_size,
			canvas_height: this.grid_size,
			
			
			
			use_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	run(num_grains, maximum_speed)
	{
		this.num_grains = num_grains;
		
		this.maximum_speed = maximum_speed;
		
		this.grid_size = Math.floor(Math.sqrt(this.num_grains)) + 2;
		
		if (this.grid_size % 2 === 0)
		{
			this.grid_size++;
		}
		
		
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		
		const canvas_pixel_size = Math.min(window.innerWidth, window.innerWidth);
		
		this.canvas_scale_factor = Math.ceil(canvas_pixel_size / this.grid_size);
		
		
		
		this.wilson.change_canvas_size(this.grid_size * this.canvas_scale_factor, this.grid_size * this.canvas_scale_factor);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.grid_size * this.canvas_scale_factor, this.grid_size * this.canvas_scale_factor);
		
		
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/abelian-sandpiles/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.web_worker);	
		
		this.web_worker.onmessage = (e) =>
		{
			const image = e.data[0];
			
			for (let i = 0; i < this.grid_size; i++)
			{
				for (let j = 0; j < this.grid_size; j++)
				{
					this.wilson.ctx.fillStyle = image[i][j];
					
					this.wilson.ctx.fillRect(j * this.canvas_scale_factor, i * this.canvas_scale_factor, this.canvas_scale_factor, this.canvas_scale_factor);
				}
			}
		};
		
		this.web_worker.postMessage([this.grid_size, this.num_grains, this.maximum_speed]);
	}
}