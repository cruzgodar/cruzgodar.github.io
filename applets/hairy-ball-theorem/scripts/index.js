import { showPage } from "../../../scripts/src/loadPage.js";
import { HairyBall } from "./class.js";
import { parseNaturalGlsl } from "/scripts/applets/applet.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { Textarea } from "/scripts/src/textareas.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	const vectorFieldResolutionInput = new TextBox({
		element: $("#vector-field-resolution-input"),
		name: "Vector Field Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 1500,
		onInput: changeVectorField
	});

	const vectorFieldDilationInput = new Slider({
		element: $("#vector-field-dilation-slider"),
		name: "Vector Field Dilation",
		value: 2,
		min: 0,
		max: 3,
		integer: true,
		onInput: changeVectorField
	});

	const rawGlslCheckbox = new Checkbox({
		element: $("#raw-glsl-checkbox"),
		name: "Use raw GLSL"
	});

	const examples =
	{
		sources: "(x - z, y - z)",
		saddles: "(x, y)",
		sinks: "(1 / (x + 2), 1 / (y + 2))",
		circulation: "(x^2 - z, -y^3 - z)"
	};

	const examplesRaw =
	{
		sources: "(x - z, y - z)",
		saddles: "(x, y)",
		sinks: "(1.0 / (x + 2.0), 1.0 / (y + 2.0))",
		circulation: "(x^2 - z, -y^3 - z)"
	};

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			sources: "Sources",
			saddles: "Saddles",
			sinks: "Sinks",
			circulation: "Circulation"
		},
		onInput: onDropdownInput
	});

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Generating Code",
		value: "(x - z, y - z)",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				examplesDropdown.setValue({ newValue: "default" });
			}
		},
		onEnter: changeVectorField
	});

	const applet = new HairyBall({
		canvas: $("#output-canvas"),
		vectorFieldGeneratingCode: rawGlslCheckbox.checked
			? glslTextarea.value
			: parseNaturalGlsl(glslTextarea.value),
		vectorFieldAppletResolution: vectorFieldResolutionInput.value
			* siteSettings.resolutionMultiplier,
		vectorFieldDilation: vectorFieldDilationInput.value
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: changeVectorField
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-hairy-ball.png"
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function changeVectorField()
	{
		const generatingCode = rawGlslCheckbox.checked
			? glslTextarea.value
			: parseNaturalGlsl(glslTextarea.value);

		applet.vectorFieldAppletResolution = vectorFieldResolutionInput.value
			* siteSettings.resolutionMultiplier;
		applet.vectorFieldDilation = vectorFieldDilationInput.value;
		applet.runVectorField(generatingCode);
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

			changeVectorField();
		}
	}
}