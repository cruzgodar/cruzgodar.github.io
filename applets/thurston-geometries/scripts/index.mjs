import { Mandelbulb } from "./class.mjs";
import { changeOpacity, opacityAnimationTime } from "/scripts/src/animation.mjs";
import { equalizeTextButtons } from "/scripts/src/buttons.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const rotationAngleXInputElement = $("#rotation-angle-x-input");
	const rotationAngleYInputElement = $("#rotation-angle-y-input");
	const rotationAngleZInputElement = $("#rotation-angle-z-input");

	const cXInputElement = $("#c-x-input");
	const cYInputElement = $("#c-y-input");
	const cZInputElement = $("#c-z-input");

	const applet = new Mandelbulb($("#output-canvas"), cXInputElement, cYInputElement, cZInputElement, rotationAngleXInputElement, rotationAngleYInputElement, rotationAngleZInputElement);



	const resolutionInputElement = $("#resolution-input");

	const viewDistanceInputElement = $("#view-distance-input");

	applet.setInputCaps([resolutionInputElement, viewDistanceInputElement], [750, 200]);



	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});



	const iterationsInputElement = $("#iterations-input");

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
		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxMarches"], 1024);
		applet.wilson.gl.uniform1f(applet.wilson.uniforms["stepFactor"], 12);

		if (applet.juliaProportion < .5)
		{
			applet.wilson.downloadFrame("the-mandelbulb.png");
		}

		else
		{
			applet.wilson.downloadFrame("a-juliabulb.png");
		}

		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxMarches"], applet.maxMarches);
		applet.wilson.gl.uniform1f(applet.wilson.uniforms["stepFactor"], 1);
	});



	const powerInputElement = $("#power-input");

	const elements = [rotationAngleXInputElement, rotationAngleYInputElement, rotationAngleZInputElement, cXInputElement, cYInputElement, cZInputElement, powerInputElement];

	for (let i = 0; i < 7; i++)
	{
		elements[i].addEventListener("input", updateParameters);
	}



	const randomizeRotationButtonElement = $("#randomize-rotation-button");

	randomizeRotationButtonElement.style.opacity = 1;

	randomizeRotationButtonElement.addEventListener("click", randomizeRotation);



	const randomizeCButtonElement = $("#randomize-c-button");

	randomizeCButtonElement.style.opacity = 1;

	randomizeCButtonElement.addEventListener("click", randomizeC);



	const switchBulbButtonElement = $("#switch-bulb-button");

	switchBulbButtonElement.style.opacity = 1;

	switchBulbButtonElement.addEventListener("click", switchBulb);



	const switchMovementButtonElement = $("#switch-movement-button");

	switchMovementButtonElement.style.opacity = 0;

	switchMovementButtonElement.addEventListener("click", switchMovement);



	equalizeTextButtons();



	showPage();



	function updateParameters()
	{
		const cx = parseFloat(cXInputElement.value || 0);
		const cy = parseFloat(cYInputElement.value || 0);
		const cz = parseFloat(cZInputElement.value || 0);

		applet.c = [cx, cy, cz];
		applet.wilson.gl.uniform3fv(applet.wilson.uniforms["c"], applet.c);

		applet.rotationAngleX = parseFloat(rotationAngleXInputElement.value || 0);
		applet.rotationAngleY = parseFloat(rotationAngleYInputElement.value || 0);
		applet.rotationAngleZ = parseFloat(rotationAngleZInputElement.value || 0);

		applet.power = parseFloat(powerInputElement.value || 8);
		applet.wilson.gl.uniform1f(applet.wilson.uniforms["power"], applet.power);

		applet.updateRotationMatrix();
	}



	function randomizeRotation()
	{

		applet.randomizeRotation();
	}



	function randomizeC()
	{
		applet.randomizeC();
	}



	function switchBulb()
	{
		changeOpacity(switchBulbButtonElement, 0);
		changeOpacity(switchMovementButtonElement, 0);

		setTimeout(() =>
		{
			if (applet.juliaProportion < .5)
			{
				switchBulbButtonElement.textContent = "Switch to Mandelbulb";
				changeOpacity(switchMovementButtonElement, 1);
			}

			else
			{
				switchBulbButtonElement.textContent = "Switch to Juliabulb";
			}

			equalizeTextButtons();

			changeOpacity(switchBulbButtonElement, 1);
		}, opacityAnimationTime);

		applet.switchBulb();
	}



	function switchMovement()
	{
		changeOpacity(switchMovementButtonElement, 0);

		setTimeout(() =>
		{
			if (applet.movingPos)
			{
				switchMovementButtonElement.textContent = "Change Juliabulb";
			}

			else
			{
				switchMovementButtonElement.textContent = "Move Camera";
			}

			equalizeTextButtons();

			changeOpacity(switchMovementButtonElement, 1);
		}, opacityAnimationTime);

		applet.switchMovement();
	}
}