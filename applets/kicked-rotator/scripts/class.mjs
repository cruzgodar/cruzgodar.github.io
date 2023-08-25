import { Applet } from "/scripts/src/applets.mjs";
import { addTemporaryWorker } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class KickedRotator extends Applet
{
	webWorker = null;
	
	hues = [];
	values = [];
	numWrites = [];
	
	
	
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
	
	
	
	run(resolution, K, orbitSeparation)
	{
		const values = new Array(resolution * resolution);
		
		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				values[resolution * i + j] = 0;
			}
		}
		
		
		
		this.wilson.changeCanvasSize(resolution, resolution);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, resolution, resolution);
		
		
		
		this.webWorker = addTemporaryWorker("/applets/kicked-rotator/scripts/worker.js");
		
		
		
		this.webWorker.onmessage = (e) =>
		{
			const valueDelta = e.data[0];
			const hue = e.data[1];
			
			for (let i = 0; i < resolution; i++)
			{
				for (let j = 0; j < resolution; j++)
				{
					if (valueDelta[resolution * i + j] > values[resolution * i + j])
					{
						const rgb = this.wilson.utils.hsvToRgb(hue, 1, valueDelta[resolution * i + j] / 255);
						
						this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
						
						this.wilson.ctx.fillRect(j, i, 1, 1);
						
						values[resolution * i + j] = valueDelta[resolution * i + j];
					}
				}
			}
		};
		
		
		
		this.webWorker.postMessage([resolution, K, orbitSeparation]);
	}
}