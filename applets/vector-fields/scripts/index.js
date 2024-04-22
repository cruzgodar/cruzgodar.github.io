import { Applet } from "../../../scripts/applets/applet.js";
import { showPage } from "../../../scripts/src/loadPage.js";
import { VectorField } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export function load()
{
	const applet = new VectorField({ canvas: $("#output-canvas") });

	applet.loadPromise.then(() => run());

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: generateNewField
	});

	const maxParticlesInput = new TextBox({
		element: $("#max-particles-input"),
		name: "Particles",
		value: 10000,
		minValue: 1000,
		maxValue: 100000,
		onInput: generateNewField
	});

	const lifetimeInput = new TextBox({
		element: $("#lifetime-input"),
		name: "Particle Lifetime",
		value: 150,
		minValue: 50,
		onInput: generateNewField
	});

	const rawGlslCheckbox = new Checkbox({
		element: $("#raw-glsl-checkbox"),
		name: "Use raw GLSL"
	});

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Generating Code",
		value: "(sin(1.5y), -sin(1.5x))",
		onEnter: run
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
			draggables: "Draggables Example",
		},
		onInput: onDropdownInput
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
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

	showPage();

	function run()
	{
		const generatingCode = rawGlslCheckbox.checked
			? glslTextarea.value
			: Applet.parseNaturalGLSL(glslTextarea.value);
		
		applet.run({
			generatingCode,
			resolution: resolutionInput.value,
			maxParticles: Math.max(maxParticlesInput.value, 100),
			dt: speedSlider.value / 300,
			lifetime: Math.min(lifetimeInput.value, 255),
			worldCenterX: 0,
			worldCenterY: 0,
			zoomLevel: .5
		});
	}



	function onSliderInput()
	{
		const dt = speedSlider.value / 300;
		
		applet.dt = dt;
	}

	function generateNewField()
	{
		applet.generateNewField({
			resolution: resolutionInput.value,
			maxParticles: Math.max(maxParticlesInput.value, 100),
			dt: speedSlider.value / 300,
			lifetime: Math.min(lifetimeInput.value, 255)
		});
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