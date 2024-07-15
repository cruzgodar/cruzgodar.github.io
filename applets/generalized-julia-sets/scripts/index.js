import { showPage } from "../../../scripts/src/loadPage.js";
import { GeneralizedJuliaSet } from "./class.js";
import { Applet } from "/scripts/applets/applet.js";
import { DownloadButton, GenerateButton, ToggleButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export default function()
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
			mandelbrotDust: "Mandelbrot Dust",
			...(window.DEBUG && { random: "Random" })
		},
		onInput: onDropdownInput
	});

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Generating Code",
		value: "cadd(cpow(z, 2.0), c)",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				examplesDropdown.setValue(null);
			}
		},
		onEnter: run
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

	showPage();

	function run()
	{
		switchJuliaModeButton.setState(0);
		switchJuliaModeButton.disabled = false;

		applet.run({
			generatingCode: glslTextarea.value,
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			exposure: 1,
			numIterations: 200
		});
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		applet.changeAspectRatio(true);
	}

	function onDropdownInput()
	{
		if (examplesDropdown.value === "random")
		{
			const glsl = Applet.getRandomGlsl({
				variables: ["z", "c"]
			});

			console.log(glsl);

			glslTextarea.setValue(glsl);
		}

		else
		{
			glslTextarea.setValue(examples[examplesDropdown.value]);
		}

		run();
	}
}