"use strict";

class BarnsleyFern extends Applet
{
	num_iterations = 10000000;
	resolution = 1000;
	
	web_worker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "hybrid",
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			use_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	run(num_iterations)
	{
		this.num_iterations = num_iterations;
		
		this.resolution = Math.floor(Math.sqrt(this.num_iterations / 10));
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		
		
		try {web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/barnsley-fern/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.web_worker);
		
		this.web_worker.onmessage = (e) => this.wilson.render.draw_frame(e.data[0]);
		
		this.web_worker.postMessage([this.resolution, this.num_iterations]);
	}
}