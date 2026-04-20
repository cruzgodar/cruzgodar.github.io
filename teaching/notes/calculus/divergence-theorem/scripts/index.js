import {
	createDesmosGraphs,
	getColorLatexExpressions,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		droplet:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.42, -0.9, -0.09, 0.88, -0.43, 0.18, -0.2, 0, 0.98]
			},

			bounds: { xmin: -1.7, xmax: 1.7, ymin: -1.7, ymax: 1.7, zmin: -1.7, zmax: 1.7 },

			expressions:
			[
				{ latex: raw`(\sin(u)\cos(v), \sin(u)\sin(v), \cos(u) + a(\sqrt{\sin(u)} - \frac{1}{2}))`, parametricDomain3Du: { min: 0, max: "\\pi + 0.01" }, parametricDomain3Dv: { min: 0, max: "2\\pi" }, colorLatex: "C" },

				...getDesmosSlider({
					expression: "a = 1",
					min: 0,
					max: 1,
					secret: false,
				}),

				{ latex: raw`f(x, y, z) = 1.25z`, secret: true, hidden: true, },

				...getColorLatexExpressions(),
			]
		}
	});
}