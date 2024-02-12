import { showPage } from "../../../scripts/src/loadPage.js";
import { MagicCarpet } from "./class.js";
import { Button, DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

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

	const gridSizeInputElement = $("#grid-size-input");

	const maxCageSizeInputElement = $("#max-cage-size-input");

	applet.setInputCaps([gridSizeInputElement], [100]);



	gridSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.key === "Enter")
		{
			run();
		}
	});

	maxCageSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.key === "Enter")
		{
			run();
		}
	});



	const uniqueSolutionCheckboxElement = $("#unique-solution-checkbox");



	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 8);
		const maxCageSize = parseInt(maxCageSizeInputElement.value || 16);
		const uniqueSolution = uniqueSolutionCheckboxElement.checked;

		applet.run({
			gridSize,
			maxCageSize,
			uniqueSolution
		});
	}



	showPage();
}