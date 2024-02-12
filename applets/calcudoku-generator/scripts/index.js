import { showPage } from "../../../scripts/src/loadPage.js";
import { CalcudokuGenerator } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { Button, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new CalcudokuGenerator({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			applet.drawGrid(true);
			applet.wilson.downloadFrame("a-calcudoku-puzzle.png");
			applet.drawGrid(false);
		}
	});



	const gridSizeInputElement = $("#grid-size-input");

	const maxCageSizeInputElement = $("#max-cage-size-input");

	Applet.listenToInputElements([gridSizeInputElement, maxCageSizeInputElement], run);

	applet.setInputCaps([gridSizeInputElement, maxCageSizeInputElement], [10, 5]);



	showPage();



	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 6);

		const maxCageSize = parseInt(maxCageSizeInputElement.value || 1000);

		applet.run({ gridSize, maxCageSize });
	}
}