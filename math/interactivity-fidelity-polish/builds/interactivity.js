import { VoronoiDiagrams } from "/applets/voronoi-diagrams/scripts/class.js";

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

	const metricSlider = slide.querySelector("#metric-slider");
	const metricLabel = slide.querySelector("#metric-label");

	metricSlider.addEventListener("input", () =>
	{
		const x = metricSlider.value;
		applet.metric = Math.pow(36, x * x) * Math.pow(2 / 3, x);

		applet.updateMetric();

		metricLabel.textContent = applet.metric.toFixed(1);
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