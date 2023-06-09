"use strict";

class FiniteSubdivision extends Applet
{
	resolution = 1000;
	
	numVertices = 6;
	numIterations = 5;
	
	webWorker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			
			
			useFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	run(numVertices, numIterations, maximumSpeed)
	{
		this.numVertices = numVertices;
		this.numIterations = Math.min(numIterations, 9);
		
		this.resolution = 3000;
		
		this.maximumSpeed = maximumSpeed;
		
		
		
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		
		
		this.wilson.ctx.lineWidth = 10 - this.numIterations;
		
		
		
		try {this.webWorker.terminate()}
		catch(ex) {}
		
		this.webWorker = new Worker(`/applets/finite-subdivisions/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.webWorker);
		
		
		
		this.webWorker.onmessage = (e) =>
		{
			this.wilson.ctx.strokeStyle = e.data[4];
			
			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(e.data[1], e.data[0]);
			this.wilson.ctx.lineTo(e.data[3], e.data[2]);
			this.wilson.ctx.stroke();
		};
		
		
		
		this.webWorker.postMessage([this.numVertices, this.numIterations, this.resolution, this.maximumSpeed]);
	}
}