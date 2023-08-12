import { QuaternionicJuliaSet } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const cXInputElement = $("#c-x-input");
	const cYInputElement = $("#c-y-input");
	const cZInputElement = $("#c-z-input");
	const cWInputElement = $("#c-w-input");
	
	const randomizeCButtonElement = $("#randomize-c-button");
	
	const switchBulbButtonElement = $("#switch-bulb-button");
	
	const switchMovementButtonElement = $("#switch-movement-button");
	
	const applet = new QuaternionicJuliaSet($("#output-canvas"), switchBulbButtonElement, switchMovementButtonElement, randomizeCButtonElement, cXInputElement, cYInputElement, cZInputElement, cWInputElement);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const iterationsInputElement = $("#iterations-input");
	
	const viewDistanceInputElement = $("#view-distance-input");
	
	applet.setInputCaps([resolutionInputElement, viewDistanceInputElement], [750, 200]);
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeResolution(resolution);
	});
	
	iterationsInputElement.addEventListener("input", () =>
	{
		applet.maxIterations = parseInt(iterationsInputElement.value || 16);
		
		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxIterations"], applet.maxIterations);
	});
	
	viewDistanceInputElement.addEventListener("input", () =>
	{
		applet.maxMarches = Math.max(parseInt(viewDistanceInputElement.value || 100), 32);
		
		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxMarches"], applet.maxMarches);
	});
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		if (applet.juliaProportion === 0)
		{	
			applet.wilson.downloadFrame("the-quaternionic-mandelbrot-set.png");
		}
		
		else
		{
			applet.wilson.downloadFrame("a-quaternionic-julia-set.png");
		}
	});
	
	
	
	const elements = [cXInputElement, cYInputElement, cZInputElement, cWInputElement];
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("input", () =>
		{
			const c = [parseFloat(cXInputElement.value || 0), parseFloat(cYInputElement.value || 0), parseFloat(cZInputElement.value || 0), parseFloat(cWInputElement.value || 0)];
			
			applet.updateC(c);
		});
	}
	
	
	
	randomizeCButtonElement.style.opacity = 1;
	
	randomizeCButtonElement.addEventListener("click", () => applet.randomizeC(true));
	
	
	
	switchBulbButtonElement.style.opacity = 1;
	
	switchBulbButtonElement.addEventListener("click", () => applet.switchBulb());
	
	
	
	switchMovementButtonElement.style.opacity = 1;
	
	switchMovementButtonElement.addEventListener("click", () => applet.switchMovement());
	
	
	
	showPage();
}