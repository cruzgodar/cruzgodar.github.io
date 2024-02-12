import { showPage } from "../../../scripts/src/loadPage.js";
import { ComplexMap } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

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


	const codeInputElement = $("#code-textarea");

	Applet.listenToInputElements([codeInputElement], run);



	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [2000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeAspectRatio(true);
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

	const exampleSelectorDropdownElement = $("#example-selector-dropdown");

	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value !== "none")
		{
			codeInputElement.value = examples[exampleSelectorDropdownElement.value];

			run();
		}
	});



	showPage();



	function run()
	{
		const generatingCode = codeInputElement.value || "cexp(cinv(z))";

		applet.run({ generatingCode });
	}
}