import { JuliaSetCpu } from "/applets/julia-set-cpu/class.js";
import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";

let appletCpu;
let appletGpu;

function load({ slide })
{
	if (appletCpu)
	{
		appletCpu?.resume?.();
		appletGpu?.resume?.();

		appletCpu?.wilson?.reset?.();
		appletGpu?.wilson?.reset?.();

		return;
	}

	const canvasCpu = slide.querySelector("#cpu-canvas-container canvas");
	const canvasGpu = slide.querySelector("#gpu-canvas-container canvas");

	appletCpu = new JuliaSetCpu({
		canvas: canvasCpu,
		c: [-0.76, 0.05],
		maxWorldSize: 3.25,
		resolution: 65,
	});

	appletGpu = new JuliaSetExplorer({
		canvas: canvasGpu,
		generatingCode: "cmul(z, z) + c",
		juliaMode: "julia",
		c: [-0.76, 0.05],
		maxWorldSize: 3.25,
		resolution: 1300,
	});

	appletCpu.wilson.animateReset = false;
	appletGpu.wilson.animateReset = false;
}

function unload()
{
	appletCpu?.pause?.();
	appletGpu?.pause?.();
}

export const parallelizationBuilds =
{
	load,
	unload
};