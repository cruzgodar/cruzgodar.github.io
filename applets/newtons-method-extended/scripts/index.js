import { NewtonsMethodExtended } from "./class.js";
import { Button, DownloadHighResButton, GenerateButton } from "/scripts/components/buttons.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { Textarea } from "/scripts/components/textareas.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

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

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "newtons-method-extended.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
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
				examplesDropdown.setValue({ newValue: "default" });
			}
		},
		onEnter: run
	});

	function run()
	{
		applet.run({ generatingCode: glslTextarea.value });
	}

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value * siteSettings.resolutionMultiplier
		});
	}

	function onDropdownInput()
	{
		glslTextarea.setValue(examples[examplesDropdown.value]);

		run();
	}
}