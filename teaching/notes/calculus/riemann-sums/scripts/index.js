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
				bounds: { xmin: -1, xmax: 3, ymin: -1, ymax: 3 },

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
				bounds: { xmin: -1, xmax: 11, ymin: -1, ymax: 1 },

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
				bounds: { xmin: 0, xmax: 8, ymin: -2.5, ymax: 4.5 },

				expressions:
				[
					{ latex: raw`f(x) = 1+\frac{1}{4}(\sin(x) + \cos(2x))`, color: desmosPurple },
					{ latex: raw`a = 1`, sliderBounds: { min: 0, max: 8 } },
					{ latex: raw`b = 7`, sliderBounds: { min: 0, max: 8 } },
					{ latex: raw`n = 6`, sliderBounds: { min: 2, max: 100, step: 1 } },
					
					{ latex: raw`\sum_{i = 1}^n s f(L[i])` },
					{ latex: raw`\sum_{i = 1}^n s f(R[i])` },
					
					{ latex: raw`s = \frac{b - a}{n}`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
					{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },

					{ latex: raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosRed, secret: true },
					{ latex: raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true },
					{ latex: raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true },

					{ latex: raw`f(L) \leq y \leq 0 \{ L \leq x \leq R \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = L \{ f(L) \leq y \leq 0 \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = R \{ f(L) \leq y \leq 0 \}`, color: desmosBlue, secret: true }
				]
			},



			riemannSum2:
			{
				bounds: { xmin: -7, xmax: 7, ymin: -7, ymax: 32 },

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
}