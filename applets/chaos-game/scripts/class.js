"use strict";

class ChaosGame extends Applet
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
	
	
	
	run(resolution, num_vertices)
	{
		this.resolution = resolution;
		this.num_vertices = num_vertices;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/chaos-game/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.web_worker);
		
		
		
		this.web_worker.onmessage = (e) => this.wilson.render.draw_frame(e.data[0]);
		
		
		
		this.web_worker.postMessage([this.num_vertices, this.resolution]);
	}
}