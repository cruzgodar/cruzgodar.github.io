import { StrangeAttractors } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new StrangeAttractors({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "a-strange-attractor.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 750,
		minValue: 250,
		maxValue: 1500,
		onEnter: run
	});

	const sigmaInput = new TextBox({
		element: $("#sigma-input"),
		name: "$\\sigma$",
		value: 10,
		minValue: 5,
		maxValue: 20,
		onEnter: run
	});

	const rhoInput = new TextBox({
		element: $("#rho-input"),
		name: "$\\rho$",
		value: 28,
		minValue: 10,
		maxValue: 50,
		onEnter: run
	});

	const betaInput = new TextBox({
		element: $("#beta-input"),
		name: "$\\beta$",
		value: 2.67,
		minValue: .6,
		maxValue: 3.6,
		onEnter: run
	});

	typesetMath();

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			sigma: sigmaInput.value,
			rho: rhoInput.value,
			beta: betaInput.value,
			maximumSpeed: maximumSpeedCheckbox.checked
		});
	}
}