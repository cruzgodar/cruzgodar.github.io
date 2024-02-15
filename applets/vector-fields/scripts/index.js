import { showPage } from "../../../scripts/src/loadPage.js";
import { VectorField } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new VectorField({ canvas: $("#output-canvas") });

	applet.loadPromise.then(() => run());

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 1000,
		onInput: generateNewField
	});

	const maxParticlesInput = new TextBox({
		element: $("#max-particles-input"),
		name: "Particles",
		value: 10000,
		maxValue: 100000,
		onInput: generateNewField
	});

	const lifetimeInput = new TextBox({
		element: $("#lifetime-input"),
		name: "Particle Lifetime",
		value: 150,
		onInput: generateNewField
	});

	const rawGlslCheckbox = new Checkbox({
		element: $("#raw-glsl-checkbox"),
		name: "Use Raw GLSL"
	});



	const codeTextareaElement = $("#code-textarea");

	codeTextareaElement.addEventListener("keydown", (e) =>
	{
		if (e.key === "Enter")
		{
			e.preventDefault();

			run();
		}
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

	const speedSliderElement = $("#speed-slider");
	const speedSliderValueElement = $("#speed-slider-value");

	speedSliderElement.addEventListener("input", updateParameters);

	showPage();

	function run()
	{
		const generatingCode = rawGlslCheckbox.checked
			? codeTextareaElement.value
			: Applet.parseNaturalGLSL(codeTextareaElement.value);

		const dt = parseFloat(speedSliderValueElement.textContent || 1) / 300;
		
		applet.run({
			generatingCode,
			resolution: resolutionInput.value,
			maxParticles: Math.max(maxParticlesInput.value, 100),
			dt,
			lifetime: Math.min(lifetimeInput.value, 255),
			worldCenterX: 0,
			worldCenterY: 0,
			zoomLevel: .5
		});
	}



	function updateParameters()
	{
		const dt = parseFloat(speedSliderValueElement.textContent || 1) / 300;
		
		applet.dt = dt;
	}

	function generateNewField()
	{
		const dt = parseFloat(speedSliderValueElement.textContent || 1) / 300;
		
		applet.generateNewField({
			resolution: resolutionInput.value,
			maxParticles: Math.max(maxParticlesInput.value, 100),
			dt,
			lifetime: Math.min(lifetimeInput.value, 255)
		});
	}

	function onDropdownInput()
	{
		if (examplesDropdown.value)
		{
			codeTextareaElement.value = examples[examplesDropdown.value];

			run();
		}
	}
}