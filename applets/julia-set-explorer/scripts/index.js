import { JuliaSetExplorer } from "./class.js";
import { DownloadHighResButton, ToggleButton } from "/scripts/components/buttons.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const switchJuliaModeButton = new ToggleButton({
		element: $("#switch-julia-mode-button"),
		name0: "Pick Julia Set",
		name1: "Return to Mandelbrot",
		persistState: false,
		onClick0: advanceJuliaMode,
		onClick1: advanceJuliaMode
	});

	const applet = new JuliaSetExplorer({
		canvas: $("#output-canvas"),
		switchJuliaModeButton,
		generatingCode: "",
		worldAdjust: [-0.75, 0],
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => applet.juliaMode === "mandelbrot"
			? "the-mandelbrot-set.png"
			: "a-julia-set.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
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

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.wilson && applet.wilson.resizeCanvas({ width: applet.resolution });
	}

	function advanceJuliaMode()
	{
		applet.advanceJuliaMode();
	}
}