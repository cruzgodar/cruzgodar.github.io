import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	getDesmosPoint
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		criticalPoints:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -0.3, zmax: 0.3 },

			expressions:
			[
				{ latex: raw`f(x, y) = xye^{-x^2 - y^2}`, color: desmosColors.purple },

				{ latex: raw`X = [\frac{1}{\sqrt{2}}, \frac{1}{\sqrt{2}}, 0, -\frac{1}{\sqrt{2}}, -\frac{1}{\sqrt{2}}]`, secret: true },
				{ latex: raw`Y = [\frac{1}{\sqrt{2}}, -\frac{1}{\sqrt{2}}, 0, \frac{1}{\sqrt{2}}, -\frac{1}{\sqrt{2}}]`, secret: true },
				{ latex: raw`(X, Y, f(X, Y))`, color: desmosColors.blue },
			]
		},

		saddlePoint:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -25, zmax: 25 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^2 - y^2`, color: desmosColors.purple },
			]
		},

		secretSaddle:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -50, zmax: 50 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^2 + y^2 - 3xy`, color: desmosColors.purple },

				{ latex: raw`(t, 0, f(t, 0))`, parametricDomain: { min: -5, max: 5 }, color: desmosColors.blue, secret: true },
				{ latex: raw`(0, t, f(0, t))`, parametricDomain: { min: -5, max: 5 }, color: desmosColors.blue, secret: true },
			]
		},

		secondDerivativeTest1:
		{
			use3d: true,

			options: { translucentSurfaces: true },

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -2, zmax: 2 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^3 - y^2 + 2xy`, color: desmosColors.purple },

				{ latex: raw`(0, 0, f(0, 0))`, color: desmosColors.red },

				{ latex: raw`(-\frac{2}{3}, -\frac{2}{3}, f(-\frac{2}{3}, -\frac{2}{3}))`, color: desmosColors.orange },
			]
		},

		secondDerivativeTest2:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -0.3, zmax: 0.3 },

			expressions:
			[
				{ latex: raw`f(x, y) = xye^{-x^2 - y^2}`, color: desmosColors.purple },
			]
		},
	
		bestFitLine:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`X = [1, 2, p]` },
				{ latex: raw`Y = [0, 3, q]` },
				...getDesmosPoint({
					point: ["p", "q"],
					color: desmosColors.red,
					dragMode: desmosDragModes.NONE,
					size: 12
				}),
				{ latex: raw`p = 4`, secret: true },
				{ latex: raw`q = 3`, secret: true },
				{ latex: raw`I = [1, 2, ..., \length(X) - 1]`, secret: true },
				{ latex: raw`(X[I], Y[I])`, color: desmosColors.purple, pointSize: 12, secret: true },
				{ latex: raw`Y \sim mX + b`, color: desmosColors.blue },
			]
		}
	});
}