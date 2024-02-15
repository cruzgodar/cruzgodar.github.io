import { showPage } from "../../../scripts/src/loadPage.js";
import { ComplexMap } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
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
		maxValue: 2000,
		onEnter: run,
		onInput: changeResolution
	});


	const codeInputElement = $("#code-textarea");

	Applet.listenToInputElements([codeInputElement], run);



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
		const generatingCode = codeInputElement.value || "cexp(cinv(z))";

		applet.run({ generatingCode });
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value;

		applet.changeAspectRatio(true);
	}

	function onDropdownInput()
	{
		codeInputElement.value = examples[examplesDropdown.value];

		run();
	}
}