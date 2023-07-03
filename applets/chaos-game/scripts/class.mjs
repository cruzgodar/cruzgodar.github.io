import { Applet } from "../../../scripts/src/applets.mjs"

export class ChaosGame extends Applet
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
	
	
	
	run(resolution, numVertices)
	{
		this.resolution = resolution;
		this.numVertices = numVertices;
		
		this.wilson.changeCanvasSize(this.resolution, this.resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		
		
		try {this.webWorker.terminate()}
		catch(ex) {}
		
		this.webWorker = new Worker(`/applets/chaos-game/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.webWorker);
		
		
		
		this.webWorker.onmessage = (e) => this.wilson.render.drawFrame(e.data[0]);
		
		
		
		this.webWorker.postMessage([this.numVertices, this.resolution]);
	}
}