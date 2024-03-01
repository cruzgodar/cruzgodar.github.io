import { showPage } from "../../../scripts/src/loadPage.js";
import { GameOfLife } from "./class.js";
import { random } from "./startingStates.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new GameOfLife({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 4000,
		onEnter: run,
		onInput: changeResolution
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 100,
		maxValue: 500,
		onEnter: run,
	});

	const speedSlider = new Slider({
		element: $("#speed-slider"),
		name: "Speed",
		value: 4,
		min: 1,
		max: 200,
		logarithmic: true,
		integer: true,
		onInput: onSliderInput,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-game-of-life.png"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			gridSize: gridSizeInput.value,
			state: random(gridSizeInput.value)
		});
	}

	function onSliderInput()
	{
		applet.framesPerUpdate = Math.ceil(40 / speedSlider.value);

		applet.updatesPerFrame = Math.ceil(speedSlider.value / 40);
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}
}