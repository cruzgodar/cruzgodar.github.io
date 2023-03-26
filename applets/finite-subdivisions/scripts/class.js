"use strict";

class FiniteSubdivision extends Applet
{
	resolution = 1000;
	
	num_vertices = 6;
	num_iterations = 5;
	
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
	
	
	
	run(num_vertices, num_iterations, maximum_speed)
	{
		this.num_vertices = num_vertices;
		this.num_iterations = Math.min(num_iterations, 9);
		
		this.resolution = 3000;
		
		this.maximum_speed = maximum_speed;
		
		
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		
		
		this.wilson.ctx.lineWidth = 10 - this.num_iterations;
		
		
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/finite-subdivisions/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.web_worker);
		
		
		
		this.web_worker.onmessage = (e) =>
		{
			this.wilson.ctx.strokeStyle = e.data[4];
			
			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(e.data[1], e.data[0]);
			this.wilson.ctx.lineTo(e.data[3], e.data[2]);
			this.wilson.ctx.stroke();
		};
		
		
		
		this.web_worker.postMessage([this.num_vertices, this.num_iterations, this.resolution, this.maximum_speed]);
	}
}