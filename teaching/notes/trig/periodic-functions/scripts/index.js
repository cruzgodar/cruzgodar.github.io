import {
    createDesmosGraphs,
    desmosBlue,
    desmosPurple,
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
			periodicFunction:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`f(x - a)`, color: desmosBlue },
					{ latex: raw`f(x) = 3m(x)^3 - 3m(x)^2 - 1`, secret: true },
					{ latex: raw`f(x)`, color: desmosPurple },
					{ latex: raw`m(x) = \mod(x + 0.5, 2) - 0.5`, hidden: true, secret: true },
					...getDesmosSlider({
						expression: "a = 0",
						min: -5,
						max: 5,
						secret: false
					}),
					...getDesmosPoint({
						point: ["a", "f(0)"],
						color: desmosBlue,
						dragMode: "X",
					})
				]
			},

			periodicFunction2:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`g(x) = \{ 0 \leq x \leq 1: x^2, 1 \leq x \leq 3: 1.5 - \frac{x}{2} \}`, secret: true, color: desmosPurple },
				]
			},

			periodicFunction3:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`h(x) = \{ -2 \leq x \leq -1: 2 + x, 3 \leq x \leq 4: 2 - (x - 3)^2 \}`, secret: true, color: desmosPurple },
					...getDesmosPoint({
						point: ["-2", "0"],
						color: desmosPurple,
						dragMode: "NONE",
						style: "OPEN",
					}),
					...getDesmosPoint({
						point: ["-1", "1"],
						color: desmosPurple,
						dragMode: "NONE",
					}),
					...getDesmosPoint({
						point: ["3", "2"],
						color: desmosPurple,
						dragMode: "NONE",
						style: "OPEN",
					}),
					...getDesmosPoint({
						point: ["4", "1"],
						color: desmosPurple,
						dragMode: "NONE",
					}),
				]
			},

			carEngine:
			{
				bounds: { xmin: -1 / 1200, xmax: 3 / 1200, ymin: -5, ymax: 50 },

				expressions:
				[
					{ latex: raw`N(t) = N_0(\mod(t, \frac{1}{600}))\left\{ t \geq 0 \right\}`, secret: true, hidden: true },
					{ latex: raw`N(x)`, color: desmosBlue },
					{ latex: raw`N_0(t) = \left\{ 0 \leq t \leq \frac{1}{1200}: 20 + 12000t, \frac{1}{1200} \leq t \leq \frac{1}{600}: 40 - 12000t \right\}`, color: desmosPurple },
				]
			},

			wave:
			{
				bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

				expressions:
				[
					{ latex: raw`f(x) = \cos(\pi x)`, secret: true, hidden: true },
					{ latex: raw`f(x)`, color: desmosPurple },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}