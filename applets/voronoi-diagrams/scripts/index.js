import { VoronoiDiagrams } from "./class.js";
import { DownloadHighResButton, GenerateButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new VoronoiDiagrams({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 4000,
		onEnter: run,
	});

	const numPointsInput = new TextBox({
		element: $("#num-points-input"),
		name: "Points",
		value: 20,
		minValue: 3,
		maxValue: 100,
		onEnter: run,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "a-voronoi-diagram.png"
	});

	const metricSlider = new Slider({
		element: $("#metric-slider"),
		name: "Metric",
		value: 2,
		min: 1,
		max: 24,
		snapPoints: [2],
		logarithmic: true,
		onInput: onSliderInput
	});

	const useDraggableCheckbox = new Checkbox({
		element: $("#use-draggable-checkbox"),
		name: "Use draggable"
	});

	const hidePointsCheckbox = new Checkbox({
		element: $("#hide-points-checkbox"),
		name: "Hide points",
		checked: true
	});

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			numPoints: numPointsInput.value,
			metric: metricSlider.value,
			maximumSpeed: maximumSpeedCheckbox.checked,
			drawPoints: !hidePointsCheckbox.checked,
			useDraggable: useDraggableCheckbox.checked
		});
	}

	function onSliderInput()
	{
		applet.metric = metricSlider.value;

		applet.updateMetric();
	}
}