import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"derivative-interpretation":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`g(t) = \frac{1}{8} t^3 - \frac{1}{2} t`, color: desmosPurple },
					{ latex: String.raw`l(x) = g(a) + g'(a)(x - a)`, color: desmosBlue, secret: true },
					{ latex: String.raw`a = 0`, sliderBounds: { min: -5, max: 5 } },
					{ latex: String.raw`(a, g(a))`, secret: true, color: desmosBlue },
					{ latex: String.raw`(a + 1, g(a + 1)), (a + 1, l(a + 1))`, color: desmosRed, secret: true, lines: true, lineStyle: "DOTTED" },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}