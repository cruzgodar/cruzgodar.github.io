import { JuliaSetExplorer } from "./class.js";
import { DownloadHighResButton, ToggleButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { changeOpacity } from "/scripts/src/animation.js";
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
		previewCanvas: $("#preview-canvas"),
		switchJuliaModeButton,
		generatingCode: "vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c",
		worldAdjust: [-0.75, 0],
	});

	applet.wilsonPreview.canvas.style.display = "none";

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

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.wilson && applet.wilson.resizeCanvas({ width: applet.resolution });
		applet.wilsonPreview && applet.wilsonPreview.resizeCanvas({
			width: Math.ceil(applet.resolution / 4)
		});
	}

	function advanceJuliaMode()
	{
		applet.advanceJuliaMode();
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
}