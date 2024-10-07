import { showPage } from "../../../scripts/src/loadPage.js";
import { Fractals } from "./fractals.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new Fractals({ canvas: $("#output-canvas") });

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

	// applet.loopUniform({
	// 	name: "extrudedCubeSeparation",
	// 	startValue: .4,
	// 	endValue: 2,
	// 	duration: 3000
	// });

	applet.loopUniform({
		name: "mengerSpongeScale",
		startValue: 1.5,
		endValue: 3,
		duration: 3000
	});

	async function test()
	{
		applet.animateUniform({
			name: "extrudedCubeSeparation",
			value: testCheckbox.checked ? .5 : 2,
			duration: 1250
		});

		await new Promise(resolve => setTimeout(resolve, 500));
		applet.animateUniform({
			name: "extrudedCubeWeight",
			value: testCheckbox.checked ? 0 : 1,
			duration: 1250
		});

		applet.animateUniform({
			name: "mengerSpongeWeight",
			value: testCheckbox.checked ? 1 : 0,
			duration: 1250
		});
	}
}