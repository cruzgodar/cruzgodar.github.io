import { VoronoiDiagrams } from "/applets/voronoi-diagrams/scripts/class.js";
import { Slider } from "/scripts/components/sliders.js";

let applet;

async function reset({ forward })
{
	if (!forward)
	{
		applet.run({
			resolution: 1000,
			numPoints: 20,
			useDraggable: true,
			maximumSpeed: true,
		});
	}
}

async function build1({ forward })
{
	if (forward)
	{
		applet.run({
			resolution: 1000,
			numPoints: 20,
			useDraggable: true,
		});
	}
}

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();

		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new VoronoiDiagrams({
		canvas,
	});

	const metricSlider = new Slider({
		element: slide.querySelector("#metric-slider"),
		name: "Metric",
		value: 2,
		min: 1,
		max: 24,
		logarithmic: true,
		persistState: false,
		onInput: () =>
		{
			applet.metric = metricSlider.value;
			applet.updateMetric();
		}
	});
}

function unload()
{
	applet?.pause?.();
}

export const interactivityBuilds =
{
	reset,
	1: build1,
	load,
	unload
};