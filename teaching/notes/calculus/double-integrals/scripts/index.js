import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
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
				bounds: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 },

				expressions:
				[
					{ latex: raw`f(x) = 1 + \frac{1}{4}(\sin(x) + \cos(2x)) - \frac{(x+2)^3}{150} - \frac{x^2}{10}`, color: desmosPurple },
					{ latex: raw`a = -5`, sliderBounds: { min: -10, max: "b" } },
					{ latex: raw`b = 5`, sliderBounds: { min: -10, max: 10 } },
					{ latex: raw`n = 10`, sliderBounds: { min: 2, max: 100, step: 1 } },

					...getDesmosPoint({
						point: ["a", "f(a)"],
						color: desmosBlack,
						dragMode: "X",
						secret: false,
					}),
					...getDesmosPoint({
						point: ["b", "f(b)"],
						color: desmosBlack,
						dragMode: "X",
						secret: false,
					}),
					
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
		};

		return data;
	});

	createDesmosGraphs();
}