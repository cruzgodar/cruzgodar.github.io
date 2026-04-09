import {
	createDesmosGraphs,
	desmosColors
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		puzzleFeeder:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.69, 0.72, -0.11, -0.71, -0.69, -0.11, -0.15, 0, 0.99]
			},

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`S(u, v) = (u\sin(v + \pi), \sin^2(2\pi u)\cos^2(uv\sin(v)), u\cos(v + \pi))`, secret: true },
				{ latex: raw`S(u, v)`, parametricDomain3Du: { min: 1, max: 2 }, parametricDomain3Dv: { min: 0, max: "2\\pi" }, color: desmosColors.purple, secret: false },
			]
		}
	});
}