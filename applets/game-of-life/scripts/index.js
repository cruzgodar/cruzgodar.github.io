import { showPage } from "../../../scripts/src/loadPage.js";
import { GameOfLife } from "./class.js";
import { acorn } from "./startingStates/acorn.js";
import { random } from "./startingStates/random.js";
import { verticalLine } from "./startingStates/verticalLine.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
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
		maxValue: 1000,
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

	new Button({
		element: $("#start-button"),
		name: "Start",
		onClick: () =>
		{
			if (applet.pauseUpdating)
			{
				applet.resumeUpdating();
			}

			else
			{
				run(false);
			}
		}
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-game-of-life.png"
	});

	const startingStatesDropdown = new Dropdown({
		element: $("#starting-states-dropdown"),
		name: "Starting States",
		options: {
			random: "Random",
			verticalLine: "Vertical Line",
			acorn: "Acorn"
		},
		onInput: run
	});

	const examples = {
		"": random,
		"random": random,
		"verticalLine": verticalLine,
		"acorn": acorn
	};

	showPage();

	function run(pauseUpdating = true)
	{
		const [state, newGridSize] = examples[startingStatesDropdown.value](gridSizeInput.value);

		applet.run({
			resolution: resolutionInput.value,
			gridSize: newGridSize,
			state,
			pauseUpdating
		});
	}

	run();

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