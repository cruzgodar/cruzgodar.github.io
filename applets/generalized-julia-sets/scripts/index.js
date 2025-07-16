import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";
import { getRandomGlsl } from "/scripts/applets/applet.js";
import {
	DownloadHighResButton,
	GenerateButton,
	ToggleButton
} from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { Slider } from "/scripts/components/sliders.js";
import { Textarea } from "/scripts/components/textareas.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	// eslint-disable-next-line prefer-const
	let applet;

	const switchJuliaModeButton = new ToggleButton({
		element: $("#switch-julia-mode-button"),
		name0: "Pick Julia Set",
		name1: "Return to Mandelbrot",
		persistState: false,
		onClick0: () => applet.advanceJuliaMode(),
		onClick1: () => applet.advanceJuliaMode(),
	});

	applet = new JuliaSetExplorer({
		canvas: $("#output-canvas"),
		previewCanvas: $("#preview-canvas"),
		switchJuliaModeButton,
		maxWorldSize: 100,
		bailoutRadius: 10000,
	});

	applet.wilsonPreview.canvas.style.display = "none";

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => applet.juliaMode === "mandelbrot"
			? "a-generalized-mandelbrot-set.png"
			: "a-generalized-julia-set.png"
	});

	const examples =
	{
		mandelbrot: "cadd(cpow(z, 2.0), c)",
		variedExponent: "cadd(cpow(z, draggableArg + vec2(3.0, 0.0)), c)",
		trig: "csin(cmul(z, c))",
		cornucopia: "ccos(z) + ccos(2.0*c) - cdiv(c,z)",
		burningShip: "cadd(cpow(vec2(abs(z.x), -abs(z.y)), 2.0), c)",
		rationalMap: "cadd(csub(cpow(z, 2.0), cmul(.05, cpow(z, -2.0))), c)",
		mandelbrotDust: "cadd(csub(cpow(z, 2.0), vec2(0.0, cmul(.05, cpow(z, -2.0).y))), c)",
		// eslint-disable-next-line max-len
		vertebrae: "cdiv(cadd(cexp(cmul(c, z)), csub(cadd(z, z), cdiv(c, z))), ccos(csin(cdiv(c, vec2(z.y, z.x)))))",
	};

	const examplesDropdown = new Dropdown({
		element: $("#examples-dropdown"),
		name: "Examples",
		options: {
			mandelbrot: "Classical Mandelbrot",
			variedExponent: "Varied Exponent",
			trig: "Trig Example",
			cornucopia: "Julia Set Cornucopia",
			burningShip: "Burning Ship",
			rationalMap: "Rational Map",
			mandelbrotDust: "Mandelbrot Dust",
			vertebrae: "Vertebrae",
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
				examplesDropdown.setValue({ newValue: "default" });
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

	const showPreviewCanvasCheckbox = new Checkbox({
		element: $("#show-preview-canvas-checkbox"),
		name: "Show preview canvas",
		onInput: onCheckboxInput,
	});

	const numIterationsSlider = new Slider({
		element: $("#num-iterations-slider"),
		name: "Iterations",
		value: applet.numIterations,
		min: 100,
		max: 8000,
		snapPoints: [500, 1000, 2000],
		logarithmic: true,
		integer: true,
		onInput: () =>
		{
			applet.numIterations = numIterationsSlider.value;
			applet.needNewFrame = true;
		}
	});

	async function run()
	{
		await Promise.all([
			switchJuliaModeButton.loaded,
			glslTextarea.loaded,
		]);

		switchJuliaModeButton.setState({ newState: false });
		switchJuliaModeButton.disabled = false;

		applet.run({
			generatingCode: glslTextarea.value,
		});
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.wilson && applet.wilson.resizeCanvas({ width: applet.resolution });
	}

	function onDropdownInput()
	{
		if (examplesDropdown.value === "random")
		{
			const glsl = getRandomGlsl({
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

	async function onCheckboxInput()
	{
		if (showPreviewCanvasCheckbox.checked)
		{
			applet.wilsonPreview.canvas.style.display = "block";
			applet.wilsonPreview.canvas.style.opacity = 0;

			await new Promise(r => requestAnimationFrame(r));

			await changeOpacity({
				element: applet.wilsonPreview.canvas,
				opacity: 1,
				duration: 100,
			});
		}

		else
		{
			await changeOpacity({
				element: applet.wilsonPreview.canvas,
				opacity: 0,
				duration: 100,
			});

			applet.wilsonPreview.canvas.style.display = "none";
		}
	}

	run();
}