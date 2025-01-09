import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	getDesmosPoint,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			periodicFunction:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x - a)`, color: desmosBlue },
					{ latex: String.raw`f(x) = 3m(x)^3 - 3m(x)^2 - 1`, secret: true },
					{ latex: String.raw`f(x)`, color: desmosPurple },
					{ latex: String.raw`m(x) = \mod(x + 0.5, 2) - 0.5`, hidden: true, secret: true },
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
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`g(x) = \{ 0 \leq x \leq 1: x^2, 1 \leq x \leq 3: 1.5 - \frac{x}{2} \}`, secret: true, color: desmosPurple },
				]
			},

			periodicFunction3:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`h(x) = \{ -2 \leq x \leq -1: 2 + x, 3 \leq x \leq 4: 2 - (x - 3)^2 \}`, secret: true, color: desmosPurple },
					...getDesmosPoint({
						point: ["-2", "0"],
						color: desmosPurple,
						dragMode: "",
						style: "OPEN",
					}),
					...getDesmosPoint({
						point: ["-1", "1"],
						color: desmosPurple,
						dragMode: "",
					}),
					...getDesmosPoint({
						point: ["3", "2"],
						color: desmosPurple,
						dragMode: "",
						style: "OPEN",
					}),
					...getDesmosPoint({
						point: ["4", "1"],
						color: desmosPurple,
						dragMode: "",
					}),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}