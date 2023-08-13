import { Applet } from "/scripts/src/applets.mjs";
import { addTemporaryWorker } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class BrownianTree extends Applet
{
	resolution = 500;
	
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
	
	
	
	run(resolution)
	{
		this.resolution = resolution;
		
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		
		
		this.webWorker = addTemporaryWorker("/applets/brownian-trees/scripts/worker.js");
		
		this.webWorker.onmessage = (e) =>
		{
			if (e.data[0] !== 0 && e.data[0] !== 1)
			{
				this.wilson.ctx.fillStyle = e.data[3];
				
				this.wilson.ctx.fillRect(e.data[1], e.data[2], 1, 1);
			}
		}
		
		this.webWorker.postMessage([this.resolution]);
	}
}