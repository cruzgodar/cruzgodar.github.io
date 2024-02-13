import { showPage } from "../../../scripts/src/loadPage.js";
import { VectorField } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new VectorField({ canvas: $("#output-canvas") });

	applet.loadPromise.then(() => run());



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
		"none": "",
		"sources-and-sinks": "((0.6x - 1)(0.6x + 1), (0.6y + 1)(0.6y - 1))",
		"saddle-points": "(0.49y^2, 1 - 0.49x^2)",
		"clockwork": "(sin(1.5y), -sin(1.5x))",
		"df": "(1, sin(y) / (x^2 + 1))",
		"cross": "(sin(y / 2.5), tan(x / 2.5))",
		"draggables": "(draggableArg.x * x - y, x + draggableArg.y * y)"
	};

	const exampleSelectorDropdownElement = $("#example-selector-dropdown");

	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value !== "none")
		{
			codeTextareaElement.value = examples[exampleSelectorDropdownElement.value];

			run();
		}
	});



	const rawGLSLCheckboxElement = $("#raw-glsl-checkbox");



	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-vector-field.png"
	});



	const resolutionInputElement = $("#resolution-input");

	const maxParticlesInputElement = $("#max-particles-input");

	const speedSliderElement = $("#speed-slider");
	const speedSliderValueElement = $("#speed-slider-value");

	const lifetimeInputElement = $("#lifetime-input");

	applet.setInputCaps([resolutionInputElement, maxParticlesInputElement], [1000, 100000]);

	

	resolutionInputElement.addEventListener("input", generateNewField);

	maxParticlesInputElement.addEventListener("input", generateNewField);

	speedSliderElement.addEventListener("input", updateParameters);

	lifetimeInputElement.addEventListener("input", generateNewField);



	showPage();



	function run()
	{
		const generatingCode = rawGLSLCheckboxElement.checked
			? codeTextareaElement.value
			: Applet.parseNaturalGLSL(codeTextareaElement.value);

		const resolution = parseInt(resolutionInputElement.value || 500);
		
		const maxParticles = Math.max(
			parseInt(maxParticlesInputElement.value || 10000),
			100
		);

		const dt = parseFloat(speedSliderValueElement.textContent || 1) / 300;

		const lifetime = Math.min(parseInt(lifetimeInputElement.value || 150), 255);
		
		applet.run({
			generatingCode,
			resolution,
			maxParticles,
			dt,
			lifetime,
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
		const resolution = parseInt(resolutionInputElement.value || 500);
		
		const maxParticles = Math.max(
			parseInt(maxParticlesInputElement.value || 10000),
			100
		);

		const dt = parseFloat(speedSliderValueElement.textContent || 1) / 300;

		const lifetime = Math.min(parseInt(lifetimeInputElement.value || 150), 255);
		
		applet.generateNewField({
			resolution,
			maxParticles,
			dt,
			lifetime
		});
	}
}