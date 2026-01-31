import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			continuityExample:
			{
				bounds: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 },

				expressions:
				[
					{ latex: raw`f(x) = \{x \leq -3: x, -3 \leq x \leq 3: \frac{1}{27} x^3, 3 \leq x: \frac{1}{(4 - x)^2}\}`, color: desmosPurple, hidden: true, secret: true },
					{ latex: raw`f(x)`, color: desmosPurple },
					{ latex: raw`(-3, -3), (0, 0)`, color: desmosPurple, pointStyle: "OPEN" },
					{ latex: raw`(-3, -1), (0, 1)`, color: desmosPurple },
				]
			},



			continuityLimit:
			{
				bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

				expressions:
				[
					{ latex: raw`\frac{\cos(x^2) - x}{2 - \tan(x)}`, color: desmosPurple },
				]
			},



			ivtExample:
			{
				bounds: { xmin: -1, xmax: 4, ymin: -1, ymax: 4 },

				expressions:
				[
					{ latex: raw`(1, 2), (3, 1)`, color: desmosBlack },

					{ latex: raw`f(x) = \frac{2}{x^{\frac{\ln(2)}{\ln(3)}}}`, color: desmosPurple },
					{ latex: raw`g(x) = \frac{1}{2}\sin(\frac{\pi}{2}x) + \frac{3}{2}`, color: desmosBlue },
					{ latex: raw`h(x) = \frac{3}{2}x^2 - \frac{13}{2}x + 7`, color: desmosRed },
				]
			},



			ivtExample2:
			{
				bounds: { xmin: -15, xmax: 15, ymin: -15, ymax: 15 },

				expressions:
				[
					{ latex: raw`f(x) = x - \cos(x)`, color: desmosPurple },

					{ latex: raw`(0, f(0)), (\frac{\pi}{2}, f(\frac{\pi}{2}))`, color: desmosBlue },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}