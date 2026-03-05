import { createDesmosGraphs, desmosColors, getDesmosSlider } from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		parametricCurveShaping:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`l(t) = (\cos(2t), \sin(2t), t)`, hidden: true },
				{ latex: raw`(1 - s) (1, 0, 0)t + s l(6(t-0.5))`, color: desmosColors.purple, parametricDomain: { min: 0, max: 1 }, secret: true },

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),
			]
		},

		parametricSurfaceShaping:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`X(u) = \tan(\pi (u - \frac{1}{2}))`, hidden: true, secret: false },
				{ latex: raw`Y(v) = \tan(\pi (v - \frac{1}{2}))`, hidden: true, secret: false },
				{ latex: raw`c(u, v) = \frac{1}{1 + X(u)^2 + Y(v)^2}(2X(u), 2Y(v), -1 + X(u)^2 + Y(v)^2)`, hidden: true, secret: false },
				{ latex: raw`(1 - s) (u, v, 0) + s c(u, v)`, colorLatex: "C", parametricDomain3Du: { min: 0, max: 1 }, parametricDomain3Dv: { min: 0, max: 1 }, secret: false },

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),

				{ latex: raw`C = \operatorname{rgb}(255x, 255y, 127)` },
			]
		},
	});
}