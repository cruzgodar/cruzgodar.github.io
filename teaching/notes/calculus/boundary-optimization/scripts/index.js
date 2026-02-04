import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosOrange,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		endpoints:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^3 - x^2 - x + 1 \left\{ a \leq x \leq b\right\}`, color: desmosPurple },

				...getDesmosSlider({
					expression: raw`a = -1.5`,
					min: -2,
					max: 2,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`b = 2`,
					min: "a",
					max: 2,
					secret: false
				}),

				...getDesmosPoint({
					point: ["a", "f(a)"],
					color: desmosPurple,
					dragMode: "NONE",
					secret: false
				}),

				...getDesmosPoint({
					point: ["b", "f(b)"],
					color: desmosPurple,
					dragMode: "NONE",
					secret: false
				}),
			]
		},

		boundary1:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 \leq 1`, color: desmosPurple },
				{ latex: raw`x^2 + y^2 = 1`, color: desmosBlue },

				...getDesmosSlider({
					expression: raw`a = -0.5`,
					min: -1,
					max: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\epsilon = 0.1`,
					min: 0,
					max: 0.2,
					secret: false,
					hidden: true
				}),

				{ latex: raw`b = \sqrt{1 - a^2}`, secret: true },

				...getDesmosPoint({
					point: ["a", "b"],
					color: desmosRed,
					dragMode: "NONE",
					secret: false
				}),

				{ latex: raw`(x - a)^2 + (y - b)^2 = \epsilon^2`, color: desmosRed, secret: true },
			]
		},

		boundary2:
		{
			bounds: { xmin: -0.5, xmax: 5.5, ymin: -0.5, ymax: 5.5 },

			expressions:
			[
				{ latex: raw`1 \leq x \leq 3 \left\{ 2 \leq y \leq 4 \right\}`, color: desmosPurple },
				{ latex: raw`x = [1, 3] \left\{ 2 \leq y \leq 4 \right\}`, color: desmosBlue },
				{ latex: raw`y = [2, 4] \left\{ 1 \leq x \leq 3 \right\}`, color: desmosBlue },

				{ latex: raw`r = 5`, color: desmosBlack, hidden: true },
			]
		},

		evt:
		{
			use3d: true,

			options: { translucentSurfaces: true },

			bounds: { xmin: -3, xmax: 1, ymin: -3, ymax: 1, zmin: -5, zmax: 1 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^3 - y^2 + 2xy \left\{ -1 \leq x \leq 0 \right\}\left\{ -2 \leq y \leq 0 \right\}`, color: desmosPurple },

				{ latex: raw`(-\frac{2}{3}, -\frac{2}{3}, f(-\frac{2}{3}, -\frac{2}{3}))`, color: desmosOrange },
				{ latex: raw`(0, -2, f(0, -2))`, color: desmosBlue },

				{ latex: raw`(t, [-2, 0], f(t, [-2, 0]))`, parametricDomain: { min: -1, max: 0 }, color: desmosRed, secret: true },
				{ latex: raw`([-1, 0], t, f([-1, 0], t))`, parametricDomain: { min: -2, max: 0 }, color: desmosRed, secret: true },
			]
		},

		evt2:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -0.5, zmax: 0.15 },

			expressions:
			[
				{ latex: raw`g(x, y) = -x^2e^{-x^2-y^2}\left\{ x^2 + y^2 \leq 4 \right\}`, color: desmosPurple },

				{ latex: raw`([-2, -1, 1, 2], 0, g([-2, -1, 1, 2], 0))`, color: desmosBlue },

				{ latex: raw`(2\cos(t), 2\sin(t), g(2\cos(t), 2\sin(t)))`, parametricDomain: { min: 0, max: 2 * Math.PI }, color: desmosRed },
				{ latex: raw`(0, t, g(0, t))`, parametricDomain: { min: -2, max: 2 }, color: desmosOrange },
				{ latex: raw`(0, [-2, 2], g(0, [-2, 2]))`, color: desmosOrange },
			]
		},
	});
}