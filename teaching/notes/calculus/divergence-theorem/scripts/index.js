import {
	createDesmosGraphs,
	getColorLatexExpressions,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		sphereWedge:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.95, -0.28, -0.16, 0.27, -0.96, 0.04, -0.16, 0, 0.99]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -1.25, zmax: 1.25 },

			expressions:
			[
				{ latex: raw`\frac{1}{\sqrt{3}}\sqrt{x^2 + y^2} \leq z \leq\sqrt{1 - x^2 - y^2}\{x \geq 0\}\{y \geq 0\}`, colorLatex: "C" },

				...getDesmosSlider({
					expression: "a = 1",
					min: 0,
					max: 1,
					secret: false,
				}),

				{ latex: raw`f(x, y, z) = 1.5(x^4+y^4+z^4)`, secret: true, hidden: true, },

				...getColorLatexExpressions(),
			]
		},

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