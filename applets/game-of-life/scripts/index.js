import { showPage } from "../../../scripts/src/loadPage.js";
import { GameOfLife } from "./class.js";
import { acorn } from "./startingStates/acorn.js";
import { expansion } from "./startingStates/expansion.js";
import { gliderGun } from "./startingStates/gliderGun.js";
import { grayship } from "./startingStates/grayship.js";
import { infiniteGrowth } from "./startingStates/infiniteGrowth.js";
import { puffer } from "./startingStates/puffer.js";
import { random } from "./startingStates/random.js";
import { rocket } from "./startingStates/rocket.js";
import { spaceshipFactory } from "./startingStates/spaceshipFactory.js";
import { verticalLine } from "./startingStates/verticalLine.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new GameOfLife({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 500,
		maxValue: 4000,
		onEnter: run,
		onInput: changeResolution
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 200,
		minValue: 10,
		maxValue: 1500,
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

	const torusCheckbox = new Checkbox({
		element: $("#torus-checkbox"),
		name: "Loop on boundary",
		onInput: onTorusCheckboxInput
	});

	const startingStatesDropdown = new Dropdown({
		element: $("#starting-states-dropdown"),
		name: "Starting States",
		options: {
			random: "Random",
			verticalLine: "Vertical Line",
			acorn: "Acorn",
			infiniteGrowth: "Square Builder",
			gliderGun: "Glider Gun",
			puffer: "Puffer",
			expansion: "Infinite Growth",
			rocket: "Rocket",
			grayship: "Grayship",
			spaceshipFactory: "Spaceship Factory"
		},
		onInput: run
	});

	const examples = {
		"": random,
		"random": random,
		"verticalLine": verticalLine,
		"acorn": acorn,
		"infiniteGrowth": infiniteGrowth,
		"gliderGun": gliderGun,
		"puffer": puffer,
		"expansion": expansion,
		"rocket": rocket,
		"grayship": grayship,
		"spaceshipFactory": spaceshipFactory
	};

	showPage();

	function run(pauseUpdating = true)
	{
		const exampleFunction = examples[startingStatesDropdown.value];

		const [state, newGridSize] = exampleFunction(gridSizeInput.value);

		gridSizeInput.setValue(newGridSize);

		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			gridSize: newGridSize,
			state,
			pauseUpdating,
			onTorus: torusCheckbox.checked
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
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onTorusCheckboxInput()
	{
		applet.onTorus = torusCheckbox.checked;

		applet.wilsonHidden.gl.uniform1i(
			applet.wilsonHidden.uniforms["torus"][1],
			applet.onTorus
		);
	}
}