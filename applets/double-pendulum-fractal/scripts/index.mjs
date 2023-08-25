import { DoublePendulumFractal } from "./class.mjs";
import { changeOpacity } from "/scripts/src/animation.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new DoublePendulumFractal($("#output-canvas"), $("#pendulum-canvas"));
	
	
	
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
			
			changeOpacity(switchPendulumCanvasButtonElement, 0)
				.then(() =>
				{
					switchPendulumCanvasButtonElement.textContent = "Return to Fractal";
					
					changeOpacity(switchPendulumCanvasButtonElement, 1);
				});
		}
		
		else
		{
			applet.drawingFractal = true;
			
			//What the actual fuck
			applet.hidePendulumDrawerCanvas();
			
			
			
			changeOpacity(switchPendulumCanvasButtonElement, 0)
				.then(() =>
				{
					switchPendulumCanvasButtonElement.textContent = "Pick Pendulum";
					
					changeOpacity(switchPendulumCanvasButtonElement, 1);
				});
		}
	});
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("the-double-pendulum-fractal.png"));
	
	
	
	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		
		applet.run(resolution);
	}
}