import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosGreen,
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
			areaBetweenCurves:
			{
				bounds: { left: -1, right: 2, bottom: -1, top: 2 },

				expressions:
				[
					{ latex: raw`f(x) = x`, color: desmosRed },
					{ latex: raw`g(x) = x^2`, color: desmosBlue },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 1` },
					{ latex: raw`g(x) \leq y \leq f(x)\{a \leq x \leq b\}`, secret: true, color: desmosPurple },
					{ latex: raw`f(x) \leq y \leq g(x)\{a \leq x \leq b\}`, secret: true, color: desmosPurple }
				]
			},



			areaBetweenCurves2:
			{
				bounds: { left: -1, right: 4.14, bottom: -2.57, top: 2.57 },

				expressions:
				[
					{ latex: raw`f(x) = \sin(x)`, color: desmosRed },
					{ latex: raw`g(x) = \cos(x)`, color: desmosBlue },
					{ latex: raw`a = 0` },
					{ latex: raw`b = \pi` },
					{ latex: raw`g(x) \leq y \leq f(x)\{a \leq x \leq b\}`, secret: true, color: desmosPurple },
					{ latex: raw`f(x) \leq y \leq g(x)\{a \leq x \leq b\}`, secret: true, color: desmosPurple }
				]
			},



			areaBetweenCurves3:
			{
				bounds: { left: -2, right: 4, bottom: -2, top: 4 },

				expressions:
				[
					{ latex: raw`f(x) = 1`, color: desmosRed },
					{ latex: raw`g(x) = 3 - x`, color: desmosGreen },
					{ latex: raw`h(x) = x^2 + 1`, color: desmosBlue },

					{ latex: raw`f(x) \leq y \leq h(x)\{0 \leq x \leq 1\}`, secret: true, color: desmosPurple },
					{ latex: raw`f(x) \leq y \leq g(x)\{1 \leq x \leq 2\}`, secret: true, color: desmosPurple }
				]
			},



			areaBetweenCurves4:
			{
				bounds: { left: -1, right: 2, bottom: -1, top: 2 },

				expressions:
				[
					{ latex: raw`f(x) = 1 - x`, color: desmosRed },
					{ latex: raw`g(x) = x^2`, color: desmosBlue },
					{ latex: raw`h(x) = \sqrt{x}`, color: desmosGreen },

					{ latex: raw`f(x) \leq y \leq h(x)\{\frac{3}{2} - \frac{\sqrt{5}}{2} \leq x \leq -\frac{1}{2} + \frac{\sqrt{5}}{2}\}`, secret: true, color: desmosPurple },
					{ latex: raw`g(x) \leq y \leq h(x)\{-\frac{1}{2} + \frac{\sqrt{5}}{2} \leq x \leq 1\}`, secret: true, color: desmosPurple }
				]
			},



			areaBetweenCurves5:
			{
				bounds: { left: -2, right: 4, bottom: -2, top: 4 },

				expressions:
				[
					{ latex: raw`f(x) = 1`, color: desmosRed },
					{ latex: raw`g(x) = 3 - x`, color: desmosGreen },
					{ latex: raw`h(x) = x^2 + 1`, color: desmosBlue },

					{ latex: raw`f(x) \leq y \leq h(x)\{0 \leq x \leq 1\}`, secret: true, color: desmosPurple },
					{ latex: raw`f(x) \leq y \leq g(x)\{1 \leq x \leq 2\}`, secret: true, color: desmosPurple }
				]
			},



			areaBetweenCurves6:
			{
				bounds: { left: -1, right: 2, bottom: -1, top: 2 },

				expressions:
				[
					{ latex: raw`f(x) = 1 - x`, color: desmosRed },
					{ latex: raw`g(x) = x^2`, color: desmosBlue },
					{ latex: raw`h(x) = \sqrt{x}`, color: desmosGreen },

					{ latex: raw`f(x) \leq y \leq h(x)\{\frac{3}{2} - \frac{\sqrt{5}}{2} \leq x \leq -\frac{1}{2} + \frac{\sqrt{5}}{2}\}`, secret: true, color: desmosPurple },
					{ latex: raw`g(x) \leq y \leq h(x)\{-\frac{1}{2} + \frac{\sqrt{5}}{2} \leq x \leq 1\}`, secret: true, color: desmosPurple }
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}