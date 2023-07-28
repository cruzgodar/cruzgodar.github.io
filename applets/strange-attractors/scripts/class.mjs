import { Applet } from "/scripts/src/applets.mjs"

export class StrangeAttractor extends Applet
{
	webWorker = null;
	
	image = [];
	
	brightnessScale = 10;



	constructor(canvas)
	{
		super(canvas);

		const options =
		{
			renderer: "cpu",
			
			canvasWidth: 1000,
			canvasHeight: 1000,
			
			
			
			useFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	


	run(resolution, sigma, rho, beta, maximumSpeed)
	{
		this.wilson.changeCanvasSize(resolution, resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		
		
		this.image = new Array(resolution * resolution);
		
		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				this.image[resolution * i + j] = 0;
			}
		}
		
		
		
		try {this.webWorker.terminate();}
		catch(ex) {}
		
		this.webWorker = new Worker(`/applets/strange-attractors/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		this.workers.push(this.webWorker);
		
		
		
		this.webWorker.onmessage = e =>
		{
			const pixels = e.data[0];
			
			const rgb = e.data[1];
			
			
			
			for (let i = 0; i < pixels.length; i++)
			{
				this.image[resolution * pixels[i][0] + pixels[i][1]]++;
				
				const brightnessAdjust = this.image[resolution * pixels[i][0] + pixels[i][1]] / this.brightnessScale;
				
				this.wilson.ctx.fillStyle = `rgb(${rgb[0] * brightnessAdjust}, ${rgb[1] * brightnessAdjust}, ${rgb[2] * brightnessAdjust})`;
						
				this.wilson.ctx.fillRect(pixels[i][1], pixels[i][0], 1, 1);
			}
		};
		
		
		
		this.webWorker.postMessage([resolution, sigma, rho, beta, maximumSpeed]);
	}
}