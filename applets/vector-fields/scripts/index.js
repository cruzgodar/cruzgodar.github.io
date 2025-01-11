import { parseNaturalGlsl } from "../../../scripts/applets/applet.js";
import { showPage } from "../../../scripts/src/loadPage.js";
import { VectorFields } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export default function()
{
	const applet = new VectorFields({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1500,
		onInput: run
	});

	const maxParticlesInput = new TextBox({
		element: $("#max-particles-input"),
		name: "Particles",
		value: 6000,
		minValue: 1000,
		maxValue: 20000,
		onInput: run
	});

	const lifetimeInput = new TextBox({
		element: $("#lifetime-input"),
		name: "Particle Lifetime",
		value: 150,
		minValue: 50,
		onInput: run
	});

	const rawGlslCheckbox = new Checkbox({
		element: $("#raw-glsl-checkbox"),
		name: "Use raw GLSL"
	});



	const examples =
	{
		sourcesAndSinks: "((0.6x - 1)(0.6x + 1), (0.6y + 1)(0.6y - 1))",
		saddlePoints: "(0.49y^2, 1 - 0.49x^2)",
		clockwork: "(sin(1.5y), -sin(1.5x))",
		directionField: "(1, sin(y) / (x^2 + 1))",
		divergingDiamond: "(sin(y / 2.5), tan(x / 2.5))",
		draggables: "(draggableArg.x * x - y, x + draggableArg.y * y)"
	};

	const examplesRaw =
	{
		sourcesAndSinks: "((0.6 * x - 1.0) * (0.6 * x + 1.0), (0.6 * y + 1.0) * (0.6 * y - 1.0))",
		saddlePoints: "(0.49 * y * y, 1.0 - 0.49 * x * x)",
		clockwork: "(sin(1.5 * y), -sin(1.5 * x))",
		directionField: "(1.0, sin(y) / (x * x + 1.0))",
		divergingDiamond: "(sin(y / 2.5), tan(x / 2.5))",
		draggables: "(draggableArg.x * x - y, x + draggableArg.y * y)"
	};

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			sourcesAndSinks: "Sources and Sinks",
			saddlePoints: "Saddle Points",
			clockwork: "Clockwork",
			directionField: "Direction Field",
			divergingDiamond: "Diverging Diamond",
			draggables: "Draggables",
		},
		onInput: onDropdownInput
	});

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Generating Code",
		value: "(sin(1.5y), -sin(1.5x))",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				examplesDropdown.setValue({ newValue: "default" });
			}
		},
		onEnter: run
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-vector-field.png"
	});

	const speedSlider = new Slider({
		element: $("#speed-slider"),
		name: "Simulation Speed",
		value: 1,
		min: 0.5,
		max: 3,
		snapPoints: [1],
		logarithmic: true,
		onInput: onSliderInput
	});

	run();

	showPage();

	function run()
	{
		const generatingCode = rawGlslCheckbox.checked
			? glslTextarea.value
			: parseNaturalGlsl(glslTextarea.value);
		
		applet.run({
			generatingCode,
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			maxParticles: Math.max(maxParticlesInput.value, 100),
			dt: speedSlider.value / 300,
			lifetime: Math.min(lifetimeInput.value, 255),
		});
	}



	function onSliderInput()
	{
		const dt = speedSlider.value / 300;
		
		applet.dt = dt;
	}

	function onDropdownInput()
	{
		if (examplesDropdown.value)
		{
			glslTextarea.setValue(
				rawGlslCheckbox.checked
					? examplesRaw[examplesDropdown.value]
					: examples[examplesDropdown.value]
			);

			run();
		}
	}
}