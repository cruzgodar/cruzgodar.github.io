"use strict";

class BarnsleyFern extends Applet
{
	numIterations = 10000000;
	resolution = 1000;
	
	webWorker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "hybrid",
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			
			
			useFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	run(numIterations)
	{
		this.numIterations = numIterations;
		
		this.resolution = Math.floor(Math.sqrt(this.numIterations / 10));
		
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		
		
		
		try {webWorker.terminate()}
		catch(ex) {}
		
		this.webWorker = new Worker(`/applets/barnsley-fern/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.webWorker);
		
		this.webWorker.onmessage = (e) => this.wilson.render.drawFrame(e.data[0]);
		
		this.webWorker.postMessage([this.resolution, this.numIterations]);
	}
}