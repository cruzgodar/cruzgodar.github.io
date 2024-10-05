import { showPage } from "../../../scripts/src/loadPage.js";
import { GroundAndSphere } from "./groundAndSphere.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new GroundAndSphere({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "curved-light.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const testCheckbox = new Checkbox({
		element: $("#test-checkbox"),
		name: "Test",
		onInput: test
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function test()
	{
		applet.toggleUniform({
			name: "softShadowAmount",
			show: testCheckbox.checked
		});
	}
}