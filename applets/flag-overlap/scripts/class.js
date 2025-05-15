import { Applet } from "/scripts/applets/applet.js";
import { WilsonCPU } from "/scripts/wilson.js";

export class FlagOverlap extends Applet
{
	resolution = 2560;
	

	constructor({ canvas })
	{
		super(canvas);

		const options =
		{
			canvasWidth: this.resolution,

			interactionOptions: {
				callbacks: {
					// mousedown: this.onGrabCanvas.bind(this),
					// touchstart: this.onGrabCanvas.bind(this),
					// mousedrag: this.onGrabCanvas.bind(this),
					// touchmove: this.onGrabCanvas.bind(this),
					// mouseup: this.onReleaseCanvas.bind(this),
					// touchend: this.onReleaseCanvas.bind(this),
				},
			},

			fullscreenOptions: {
				useFullscreenButton: true,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
			}
		};

		this.wilson = new WilsonCPU(canvas, options);
	}



	async showFlag(code)
	{
		const img = new Image();
		img.crossOrigin = "anonymous";
		
		img.onload = () =>
		{
			this.canvas.style.aspectRatio = img.width / img.height;
			console.log(img.width / img.height);
			this.wilson.ctx.drawImage(img, 0, 0, this.wilson.canvasWidth, this.wilson.canvasHeight);
		};

		img.src = `https://flagcdn.com/w2560/${code}.png`;
	}
}