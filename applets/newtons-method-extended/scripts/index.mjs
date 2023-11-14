import { NewtonsMethodExtended } from "./class.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new NewtonsMethodExtended({ canvas: $("#output-canvas") });

	applet.loadPromise.then(() => run());



	const codeInputElement = $("#code-textarea");

	codeInputElement.value = "cmul(csin(z), sin(cmul(z, i)))";



	Applet.listenToInputElements([codeInputElement], run);



	const randomizePaletteButton = $("#randomize-palette-button");

	randomizePaletteButton.addEventListener("click", applet.animatePaletteChange.bind(applet));



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const derivativePrecisionSliderElement = $("#derivative-precision-slider");
	const derivativePrecisionSliderValueElement = $("#derivative-precision-slider-value");

	applet.setInputCaps([resolutionInputElement], [2000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeAspectRatio(true);
	});

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



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("newtons-method-extended.png");
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
}