import { showPage } from "../../../scripts/src/loadPage.js";
import { AbelianSandpiles } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

const palettes = {
	sakura: [[229, 190, 237], [149, 147, 217], [124, 144, 219]],
	desert: [[124, 106, 10], [186, 189, 141], [255, 218, 198]],
	nectarine: [[232, 247, 238], [184, 196, 187], [102, 63, 70]],
	parchment: [[32, 44, 57], [40, 56, 69], [184, 176, 141]],
	ivory: [[35, 44, 51], [90, 125, 124], [218, 223, 247]]
};

export default function()
{
	const applet = new AbelianSandpiles({ canvas: $("#output-canvas") });

	const palettesDropdown = new Dropdown({
		element: $("#palettes-dropdown"),
		name: "Palettes",
		options: {
			nectarine: "Nectarine",
			desert: "Desert",
			sakura: "Sakura",
			parchment: "Parchment",
			ivory: "Ivory"
		},
		onChange: run
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Grid Size",
		value: 319,
		minValue: 10,
		maxValue: 2000,
		onEnter: run,
	});

	const centerGrainsInput = new TextBox({
		element: $("#center-grains-input"),
		name: "Center Grains",
		value: 100000,
		minValue: 0,
		maxValue: 1000000,
		onEnter: run,
	});

	const surroundingGrainsInput = new TextBox({
		element: $("#surrounding-grains-input"),
		name: "Surrounding Grains",
		value: 0,
		minValue: 0,
		maxValue: 8,
		onEnter: run,
	});

	const computationsPerFrameInput = new TextBox({
		element: $("#computations-per-frame-input"),
		name: "Computation Speed",
		value: 1,
		minValue: 1,
		maxValue: 100,
		onEnter: run,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "an-abelian-sandpile.png"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			numGrains: centerGrainsInput.value,
			floodGrains: surroundingGrainsInput.value,
			computationsPerFrame: computationsPerFrameInput.value,
			palette: palettes[palettesDropdown.value || "nectarine"]
		});
	}
}