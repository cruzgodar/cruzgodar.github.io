import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";

let everLoaded = false;
let appletCpu;
let appletGpu;

async function reset({ slide, forward })
{
	if (everLoaded)
	{
		return;
	}

	everLoaded = true;

	const canvasCpu = slide.querySelector("#cpu-canvas");
	const canvasGpu = slide.querySelector("#gpu-canvas");

	appletGpu = new JuliaSetExplorer({
		canvas: canvasGpu,
		generatingCode: "cmul(z, z) + c",
		juliaMode: "julia",
		c: [0, 1],
		maxWorldSize: 3.25
	});
}

function load()
{
	appletGpu?.resume?.();
}

function unload()
{
	appletGpu?.pause?.();
}

export const parallelizationBuilds =
{
	reset,
	load,
	unload
};