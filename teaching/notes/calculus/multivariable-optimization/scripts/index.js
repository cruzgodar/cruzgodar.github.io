import {
	createDesmosGraphs,
	desmosBlue,
	desmosOrange,
	desmosPurple,
	desmosRed
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		saddlePoint:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -25, zmax: 25 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^2 - y^2`, color: desmosPurple },
			]
		},

		secretSaddle:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -50, zmax: 50 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^2 + y^2 - 3xy`, color: desmosPurple },

				{ latex: raw`(t, 0, f(t, 0))`, parametricDomain: { min: -5, max: 5 }, color: desmosBlue, secret: true },
				{ latex: raw`(0, t, f(0, t))`, parametricDomain: { min: -5, max: 5 }, color: desmosBlue, secret: true },
			]
		},

		secondDerivativeTest1:
		{
			use3d: true,

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -2, zmax: 2 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^3 - y^2 + 2xy`, color: desmosPurple },

				{ latex: raw`(0, 0, f(0, 0))`, color: desmosRed },

				{ latex: raw`(-\frac{2}{3}, -\frac{2}{3}, f(-\frac{2}{3}, -\frac{2}{3}))`, color: desmosOrange },
			]
		},

		secondDerivativeTest2:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -0.3, zmax: 0.3 },

			expressions:
			[
				{ latex: raw`f(x, y) = xye^{-x^2 - y^2}`, color: desmosPurple },
			]
		},
	});
}