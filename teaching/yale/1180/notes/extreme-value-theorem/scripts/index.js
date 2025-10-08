import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosPurple3d,
	desmosRed,
	getDesmosPoint,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
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

				bounds: { xmin: -3, xmax: 1, ymin: -3, ymax: 1, zmin: -5, zmax: 1 },

				expressions:
				[
					{ latex: raw`f(x, y) = x^3 - y^2 + 2xy \left\{  \right\}`, color: desmosPurple3d },

					// { latex: raw`(t, 0, f(t, 0))`, parametricDomain: { min: -5, max: 5 }, color: desmosBlue3d, secret: true },
					// { latex: raw`(0, t, f(0, t))`, parametricDomain: { min: -5, max: 5 }, color: desmosBlue3d, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}