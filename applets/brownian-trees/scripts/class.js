"use strict";

class BrownianTree extends Applet
{
	resolution = 500;
	
	web_worker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			use_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	run(resolution)
	{
		this.resolution = resolution;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/brownian-trees/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		Page.temporary_web_workers.push(this.web_worker);
		
		
		
		this.web_worker.onmessage = (e) =>
		{
			if (e.data[0] !== 0 && e.data[0] !== 1)
			{
				this.wilson.ctx.fillStyle = e.data[3];
				
				this.wilson.ctx.fillRect(e.data[1], e.data[2], 1, 1);
			}
		}
		
		this.web_worker.postMessage([this.resolution]);
	}
}