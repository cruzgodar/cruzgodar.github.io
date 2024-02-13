import { showPage } from "../../../scripts/src/loadPage.js";
import { NewtonsMethodExtended } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { Button, DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new NewtonsMethodExtended({ canvas: $("#output-canvas") });

	applet.loadPromise.then(() => run());

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new Button({
		element: $("#randomize-palette-button"),
		name: "Regenerate Palette",
		onClick: () => applet.animatePaletteChange()
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "newtons-method-extended.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 2000,
		onInput: changeResolution
	});



	const codeInputElement = $("#code-textarea");

	codeInputElement.value = "cmul(csin(z), sin(cmul(z, i)))";

	Applet.listenToInputElements([codeInputElement], run);



	const derivativePrecisionSliderElement = $("#derivative-precision-slider");
	const derivativePrecisionSliderValueElement = $("#derivative-precision-slider-value");


	derivativePrecisionSliderElement.addEventListener("input", () =>
	{
		applet.derivativePrecision = parseFloat(derivativePrecisionSliderValueElement.textContent);

		applet.wilson.gl.uniform1f(
			applet.wilson.uniforms["derivativePrecision"],
			applet.derivativePrecision
		);

		applet.wilsonHidden.gl.uniform1f(
			applet.wilsonHidden.uniforms["derivativePrecision"],
			applet.derivativePrecision
		);
	});

	const examples =
	{
		none: "",
		trig: "csin(z)",
		crosshatch: "cmul(csin(z), csinh(z))",
		palette: "cmul(sin(z), csinh(z))",
		butterflies: "cmul(sin(z), tan(z))",
		// eslint-disable-next-line max-len
		swatches: "cmul(csin(vec2(z.x, sign(z.y) * min(abs(z.y), mod(abs(z.y), 2.0*PI) + 2.0*PI))), sin(cmul(vec2(z.x, sign(z.y) * min(abs(z.y), mod(abs(z.y), 2.0*PI) + 2.0*PI)), i)))"
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
		const generatingCode = codeInputElement.value;

		applet.run({ generatingCode });
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value;

		applet.changeAspectRatio(true);
	}
}