import { showPage } from "../../../scripts/src/loadPage.js";
import { ComplexMaps } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export default function()
{
	const applet = new ComplexMaps({
		canvas: $("#output-canvas"),
		generatingCode: "cexp(cinv(z))"
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-complex-map.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onEnter: run,
		onInput: changeResolution
	});



	const examples =
	{
		none: "",
		trig: "csin(z)",
		poles: "cinv(cmul(csub(cpow(z, 6.0), 1.0), csub(cpow(z, 3.0), 1.0)))",
		es: "cexp(cinv(z))",
		tet: "ctet(z, 100.0)",
		lattices: "wp(z, draggableArg)"
	};

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			trig: "Trig",
			poles: "Poles",
			es: "Essential Singularity",
			tet: "Tetration",
			lattices: "Lattices"
		},
		onInput: onDropdownInput
	});

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Complex Map",
		value: "cexp(cinv(z))",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				examplesDropdown.setValue({ newValue: "default" });
			}
		},
		onEnter: run
	});

	showPage();

	function run()
	{
		applet.run({ generatingCode: glslTextarea.value });
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		applet.changeAspectRatio(true);
	}

	function onDropdownInput()
	{
		glslTextarea.setValue(examples[examplesDropdown.value]);

		run();
	}
}