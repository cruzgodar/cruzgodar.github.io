import { showPage } from "../../../scripts/src/loadPage.js";
import { ComplexMap } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export default function()
{
	const applet = new ComplexMap({
		canvas: $("#output-canvas"),
		generatingCode: "cexp(cinv(z))"
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
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

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Complex Map",
		value: "cexp(cinv(z))",
		onEnter: run
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

	showPage();

	function run()
	{
		applet.run({ generatingCode: glslTextarea.value });
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value;

		applet.changeAspectRatio(true);
	}

	function onDropdownInput()
	{
		glslTextarea.setValue(examples[examplesDropdown.value]);

		run();
	}
}