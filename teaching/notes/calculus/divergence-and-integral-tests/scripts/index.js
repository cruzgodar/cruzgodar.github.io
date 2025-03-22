import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
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
			riemannSum:
			{
				bounds: { left: 0, right: 8, bottom: -2.5, top: 5.5 },

				expressions:
				[
					{ latex: raw`f(x) = \left| \frac{1}{6} x^2 - \frac{1}{40} x^3 + 1 \right|`, color: desmosPurple },
					{ latex: raw`a = 1`, sliderBounds: { min: 0, max: 8 } },
					{ latex: raw`b = 7`, sliderBounds: { min: 0, max: 8 } },
					{ latex: raw`n = 6`, sliderBounds: { min: 2, max: 100, step: 1 } },

					{ latex: raw`s = \frac{b - a}{n}`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
					{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },
					{ latex: raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosRed, secret: true },
					{ latex: raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true },
					{ latex: raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true }
				]
			},



			riemannSum2:
			{
				bounds: { left: -1, right: 9, bottom: -.025, top: .225 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{x + 4}`, color: desmosPurple },

					{ latex: raw`a = 1`, secret: true },
					{ latex: raw`b = 100`, secret: true },
					{ latex: raw`s = 1`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
					{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },

					{ latex: raw`0 \leq y \leq f(R - 1) \{ L - 1 \leq x \leq R - 1 \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = L - 1 \{ 0 \leq y \leq f(R - 1) \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = R - 1 \{ 0 \leq y \leq f(R - 1) \}`, color: desmosBlue, secret: true },

					{ latex: raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosRed, secret: true },
					{ latex: raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true },
					{ latex: raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}