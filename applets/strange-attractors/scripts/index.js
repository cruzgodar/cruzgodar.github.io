import { showPage } from "../../../scripts/src/loadPage.js";
import { StrangeAttractor } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new StrangeAttractor({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-strange-attractor.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 750,
		maxValue: 1500,
		onEnter: run
	});

	const sigmaInput = new TextBox({
		element: $("#sigma-input"),
		name: "$\\sigma$",
		value: 10,
		maxValue: 20,
		onEnter: run
	});

	const rhoInput = new TextBox({
		element: $("#rho-input"),
		name: "$\\rho$",
		value: 28,
		maxValue: 50,
		onEnter: run
	});

	const betaInput = new TextBox({
		element: $("#beta-input"),
		name: "$\\beta$",
		value: 2.67,
		maxValue: 3.6,
		onEnter: run
	});

	typesetMath();

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			sigma: sigmaInput.value,
			rho: rhoInput.value,
			beta: betaInput.value,
			maximumSpeed: maximumSpeedCheckbox.checked
		});
	}
}