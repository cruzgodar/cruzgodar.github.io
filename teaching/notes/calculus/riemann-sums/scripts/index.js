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
			testGraph:
			{
				bounds: { left: -1, right: 3, bottom: -1, top: 3 },

				expressions:
				[
					{ latex: raw`f(x) = x^3 - 2x^2 + 2`, color: desmosPurple },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 2` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},



			partitions:
			{
				bounds: { left: -1, right: 11, bottom: -1, top: 1 },

				expressions:
				[
					{ latex: raw`a = 0`, color: desmosPurple, sliderBounds: { min: 0, max: 10 } },
					{ latex: raw`b = 10`, color: desmosPurple, sliderBounds: { min: 0, max: 10 } },
					{ latex: raw`n = 10`, color: desmosBlue, sliderBounds: { min: 1, max: 30, step: 1 } },

					{ latex: raw`(a, 0)`, color: desmosPurple, secret: true },
					{ latex: raw`(b, 0)`, color: desmosPurple, secret: true },

					{ latex: raw`s = \frac{b - a}{n}`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`x = X \{-.02 \leq y \leq .02\}`, color: desmosPurple, secret: true }
				]
			},



			riemannSum:
			{
				bounds: { left: 0, right: 8, bottom: -2.5, top: 4.5 },

				expressions:
				[
					{ latex: raw`f(x) = 1+\frac{1}{4}(\sin(x) + \cos(2x))`, color: desmosPurple },
				]
			},



			riemannSum2:
			{
				bounds: { left: -7, right: 7, bottom: -7, top: 32 },

				expressions:
				[
					{ latex: raw`f(t) = t^2`, color: desmosPurple, secret: true },
					{ latex: raw`a = -5`, secret: true },
					{ latex: raw`b = 5`, secret: true },
					{ latex: raw`n = 5`, secret: true },

					{ latex: raw`s = \frac{b - a}{n}`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
					{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },
					{ latex: raw`U = [-5, -3, -1, 3, 5]`, secret: true },
					{ latex: raw`0 \leq y \leq f(U) \{ L \leq x \leq R \}`, color: desmosRed, secret: true },
					{ latex: raw`x = L \{ 0 \leq y \leq f(U) \}`, color: desmosRed, secret: true },
					{ latex: raw`x = R \{ 0 \leq y \leq f(U) \}`, color: desmosRed, secret: true }
				]
			},
		};

		return data;
	});

	createDesmosGraphs();



	showPage();
}