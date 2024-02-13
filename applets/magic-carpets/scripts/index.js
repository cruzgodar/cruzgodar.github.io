import { showPage } from "../../../scripts/src/loadPage.js";
import { MagicCarpet } from "./class.js";
import { Button, DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new MagicCarpet({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new Button({
		element: $("#draw-solution-button"),
		name: "Show Solution",
		onClick: () => applet.drawSolution()
	});

	new Button({
		element: $("#draw-rectangles-button"),
		name: "Show Rectangles Only",
		onClick: () => applet.drawSolution(true)
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-magic-carpet.png"
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 8,
		maxValue: 100,
		onEnter: run
	});

	const maxCageSizeInput = new TextBox({
		element: $("#max-cage-size-input"),
		name: "Max Cage Size",
		value: 16,
		onEnter: run
	});

	const uniqueSolutionCheckboxElement = $("#unique-solution-checkbox");

	function run()
	{
		const uniqueSolution = uniqueSolutionCheckboxElement.checked;

		applet.run({
			gridSize: gridSizeInput.value,
			maxCageSize: maxCageSizeInput.value,
			uniqueSolution
		});
	}

	showPage();
}