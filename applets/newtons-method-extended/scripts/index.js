import { showPage } from "../../../scripts/src/loadPage.js";
import { NewtonsMethodExtended } from "./class.js";
import { Button, DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export default function()
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
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	const derivativePrecisionSlider = new Slider({
		element: $("#derivative-precision-slider"),
		name: "Derivative Precision",
		value: 6,
		min: 3,
		max: 20,
		onInput: onSliderInput
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

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			trig: "Trig Function",
			crosshatch: "Crosshatch",
			palette: "Palette Demonstration",
			butterflies: "Butterflies",
			swatches: "Color Swatches"
		},
		onInput: onDropdownInput
	});

	const glslTextarea = new Textarea({
		element: $("#glsl-textarea"),
		name: "Generating Code",
		value: "cmul(csin(z), sin(cmul(z, i)))",
		onInput: () =>
		{
			if (examplesDropdown.value)
			{
				examplesDropdown.setValue(null);
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
		applet.resolution = resolutionInput.value;

		applet.changeAspectRatio(true);
	}

	function onDropdownInput()
	{
		glslTextarea.setValue(examples[examplesDropdown.value]);

		run();
	}

	function onSliderInput()
	{
		applet.derivativePrecision = derivativePrecisionSlider.value;

		applet.wilson.gl.uniform1f(
			applet.wilson.uniforms["derivativePrecision"],
			applet.derivativePrecision
		);

		applet.wilsonHidden.gl.uniform1f(
			applet.wilsonHidden.uniforms["derivativePrecision"],
			applet.derivativePrecision
		);

		applet.needNewFrame = true;
	}
}