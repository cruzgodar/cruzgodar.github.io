import { DoublePendulumFractal } from "./class.mjs";

export function load()
{
	const applet = new DoublePendulumFractal($("#output-canvas"), $("#pendulum-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		
		applet.run(resolution);
	}
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	applet.listenToInputElements([resolutionInputElement], run);
	
	applet.setInputCaps([resolutionInputElement], [2000]);
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const switchPendulumCanvasButtonElement = $("#switch-pendulum-canvas-button");
	
	switchPendulumCanvasButtonElement.addEventListener("click", () =>
	{
		if (applet.drawingFractal)
		{
			applet.drawingFractal = false;
			
			Page.Animate.changeOpacity(switchPendulumCanvasButtonElement, 0, Site.opacityAnimationTime)
			
			.then(() =>
			{
				switchPendulumCanvasButtonElement.textContent = "Return to Fractal";
				
				Page.Animate.changeOpacity(switchPendulumCanvasButtonElement, 1, Site.opacityAnimationTime);
			});
		}
		
		else
		{
			applet.drawingFractal = true;
			
			//What the actual fuck
			applet.hidePendulumDrawerCanvas();
			
			
			
			Page.Animate.changeOpacity(switchPendulumCanvasButtonElement, 0, Site.opacityAnimationTime)
			
			.then(() =>
			{
				switchPendulumCanvasButtonElement.textContent = "Pick Pendulum";
				
				Page.Animate.changeOpacity(switchPendulumCanvasButtonElement, 1, Site.opacityAnimationTime);
			});
		}
	});
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("the-double-pendulum-fractal.png"));
	
	
	
	Page.show();
}