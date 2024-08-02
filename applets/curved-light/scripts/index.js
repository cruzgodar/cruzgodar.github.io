import { showPage } from "../../../scripts/src/loadPage.js";
import { CurvedLight } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new CurvedLight({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-extruded-cube.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const radiusSlider = new Slider({
		element: $("#radius-slider"),
		name: "Radius",
		value: 1,
		min: 1,
		max: 20,
		onInput: onSliderInput
	});

	const curvatureSlider = new Slider({
		element: $("#curvature-slider"),
		name: "Curvature",
		value: 1,
		min: 1,
		max: 10,
		onInput: onSliderInput
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onSliderInput()
	{
		applet.radius = radiusSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.radius, applet.radius);

		applet.curvature = curvatureSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.curvature, applet.curvature);

		applet.needNewFrame = true;
	}
}