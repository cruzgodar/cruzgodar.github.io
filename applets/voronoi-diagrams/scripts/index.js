import { showPage } from "../../../scripts/src/loadPage.js";
import { VoronoiDiagram } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new VoronoiDiagram({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 4000,
		onEnter: run,
	});

	const numPointsInput = new TextBox({
		element: $("#num-points-input"),
		name: "Points",
		value: 20,
		maxValue: 200,
		onEnter: run,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-voronoi-diagram.png"
	});

	const metricSlider = new Slider({
		element: $("#metric-slider"),
		name: "Metric",
		value: 2,
		min: 1,
		max: 20,
		logarithmic: true,
		onInput: onSliderInput
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			numPoints: numPointsInput.value,
			metric: metricSlider.value
		});
	}

	function onSliderInput()
	{
		applet.metric = metricSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.metric, applet.metric);

		if (!applet.currentlyAnimating)
		{
			applet.wilson.render.drawFrame();
		}
	}
}