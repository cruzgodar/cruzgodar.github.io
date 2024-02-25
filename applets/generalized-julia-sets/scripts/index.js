import { Applet } from "../../../scripts/applets/applet.js";
import { showPage } from "../../../scripts/src/loadPage.js";
import { GeneralizedJuliaSet } from "./class.js";
import { DownloadButton, GenerateButton, ToggleButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	// eslint-disable-next-line prefer-const
	let applet;

	const switchJuliaModeButton = new ToggleButton({
		element: $("#switch-julia-mode-button"),
		name0: "Pick Julia Set",
		name1: "Return to Mandelbrot",
		onClick0: () => applet.switchJuliaMode(),
		onClick1: () => applet.switchJuliaMode(),
	});

	applet = new GeneralizedJuliaSet({
		canvas: $("#output-canvas"),
		switchJuliaModeButton
	});

	applet.loadPromise.then(() => run());

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-generalized-julia-set.png"
	});

	const codeInputElement = $("#code-textarea");

	codeInputElement.value = "cadd(cpow(z, 2.0), c)";

	Applet.listenToInputElements([codeInputElement], run);

	const examples =
	{
		mandelbrot: "cadd(cpow(z, 2.0), c)",
		variedExponent: "cadd(cpow(z, 4.0), c)",
		trig: "csin(cmul(z, c))",
		burningShip: "cadd(cpow(vec2(abs(z.x), -abs(z.y)), 2.0), c)",
		rationalMap: "cadd(csub(cpow(z, 2.0), cmul(.05, cpow(z, -2.0))), c)",
		mandelbrotDust: "cadd(csub(cpow(z, 2.0), vec2(0.0, cmul(.05, cpow(z, -2.0).y))), c)"
	};

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			mandelbrot: "Classical Mandelbrot",
			variedExponent: "Varied Exponent",
			trig: "Trig Example",
			burningShip: "Burning Ship",
			rationalMap: "Rational Map",
			mandelbrotDust: "Mandelbrot Dust"
		},
		onInput: onDropdownInput
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 2000,
		onEnter: run,
		onInput: changeResolution
	});

	showPage();

	function run()
	{
		const generatingCode = codeInputElement.value || "cadd(cpow(z, 2.0), c)";

		switchJuliaModeButton.setState(0);
		switchJuliaModeButton.disabled = false;

		applet.run({
			generatingCode,
			resolution: resolutionInput.value,
			exposure: 1,
			numIterations: 200
		});
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