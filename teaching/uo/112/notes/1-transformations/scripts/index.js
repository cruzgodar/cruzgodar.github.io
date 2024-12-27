import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGreen,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"test-graph":
			{
				bounds: { left: -1, right: 3, bottom: -1, top: 3 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: desmosPurple },
					{ latex: String.raw`a = 0` },
					{ latex: String.raw`b = 2` },

					{ latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},

			"power-functions":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x`, color: desmosPurple },
					{ latex: String.raw`f(x) = x^2`, color: desmosBlue },
					{ latex: String.raw`f(x) = x^3`, color: desmosRed },
					{ latex: String.raw`f(x) = x^a`, color: desmosGreen },
					{ latex: String.raw`a = 4`, sliderBounds: { min: 4, max: 10, step: 1 } },
				]
			},

			"negative-power-functions":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^{-1}`, color: desmosPurple },
					{ latex: String.raw`f(x) = x^{-2}`, color: desmosBlue },
					{ latex: String.raw`f(x) = x^{-a}`, color: desmosRed },
					{ latex: String.raw`a = 3`, sliderBounds: { min: 3, max: 10, step: 1 } },
				]
			},

			"fractional-power-functions":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^{1/2}`, color: desmosPurple },
					{ latex: String.raw`f(x) = x^{1/3}`, color: desmosBlue },
					{ latex: String.raw`f(x) = x^{1/a}`, color: desmosRed },
					{ latex: String.raw`a = 4`, sliderBounds: { min: 4, max: 10, step: 1 } },
				]
			},

			"inverses":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^3`, color: desmosPurple },
					{ latex: String.raw`f(x) = x^{1/3}`, color: desmosBlue },
					{ latex: String.raw`y = x`, color: desmosBlack, secret: true, lineStyle: "DASHED" },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}