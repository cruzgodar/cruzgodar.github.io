import { ComplexMaps } from "./class.js";
import { DownloadHighResButton, GenerateButton } from "/scripts/components/buttons.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { Textarea } from "/scripts/components/textareas.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

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

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "a-complex-map.png"
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

	async function run()
	{
		await glslTextarea.loaded;

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: glslTextarea.value,
				worldWidth: 4,
				worldCenterX: 0,
				worldCenterY: 0,
			});
		});
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		applet.wilson.resizeCanvas({ width: applet.resolution });
	}

	function onDropdownInput()
	{
		glslTextarea.setValue(examples[examplesDropdown.value]);

		run();
	}

	run();
}
