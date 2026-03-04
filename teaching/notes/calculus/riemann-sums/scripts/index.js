import {
	createDesmosGraphs, desmosColors
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		netChange:
		{
			bounds: { xmin: -0.25, xmax: 0.75, ymin: -20, ymax: 80 },

			expressions:
			[
				{ latex: raw`a = 0` },
				{ latex: raw`b = \frac{1}{2}` },

				{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosColors.purple, secret: true },

				{ latex: raw`f(x) = 60\{a \leq x \leq b\}`, color: desmosColors.purple },

				{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosColors.blue, secret: true },
			]
		},



		rollerCoaster:
		{
			bounds: { xmin: -10, xmax: 70, ymin: -3, ymax: 3 },

			expressions:
			[
				{ latex: raw`\frac{x}{10} \{0 \leq x \leq 20\}`, color: desmosColors.purple, secret: true },
				{ latex: raw`5 + \frac{-3}{20}x \{20 \leq x \leq 40\}`, color: desmosColors.purple, secret: true },
				{ latex: raw`-1 \{40 \leq x \leq 60\}`, color: desmosColors.purple, secret: true },
			]
		},



		partitions:
		{
			bounds: { xmin: -1, xmax: 11, ymin: -1, ymax: 1 },

			expressions:
			[
				{ latex: raw`a = 0`, color: desmosColors.purple, sliderBounds: { min: 0, max: 10 } },
				{ latex: raw`b = 10`, color: desmosColors.purple, sliderBounds: { min: 0, max: 10 } },
				{ latex: raw`n = 10`, color: desmosColors.blue, sliderBounds: { min: 1, max: 30, step: 1 } },

				{ latex: raw`(a, 0)`, color: desmosColors.purple, secret: true },
				{ latex: raw`(b, 0)`, color: desmosColors.purple, secret: true },

				{ latex: raw`s = \frac{b - a}{n}`, secret: true },
				{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
				{ latex: raw`x = X \{-.02 \leq y \leq .02\}`, color: desmosColors.purple, secret: true }
			]
		},



		riemannSum:
		{
			bounds: { xmin: 0, xmax: 8, ymin: -1, ymax: 3 },

			expressions:
			[
				{ latex: raw`f(x) = \frac{3}{2} + \frac{2}{5}(\sin(\frac{2}{3}x) + \cos(\frac{3}{2}x))`, color: desmosColors.purple },
				{ latex: raw`a = 1`, sliderBounds: { min: 0, max: 8 } },
				{ latex: raw`b = 7`, sliderBounds: { min: 0, max: 8 } },
				{ latex: raw`n = 6`, sliderBounds: { min: 2, max: 100, step: 1 } },
				
				{ latex: raw`\sum_{i = 1}^n s f(L[i])` },
				{ latex: raw`\sum_{i = 1}^n s f(R[i])` },
				
				{ latex: raw`s = \frac{b - a}{n}`, secret: true },
				{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
				{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
				{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },

				{ latex: raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosColors.red, secret: true },
				{ latex: raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosColors.red, secret: true },
				{ latex: raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosColors.red, secret: true },

				{ latex: raw`f(L) \leq y \leq 0 \{ L \leq x \leq R \}`, color: desmosColors.blue, secret: true },
				{ latex: raw`x = L \{ f(L) \leq y \leq 0 \}`, color: desmosColors.blue, secret: true },
				{ latex: raw`x = R \{ f(L) \leq y \leq 0 \}`, color: desmosColors.blue, secret: true }
			]
		},



		riemannSum2:
		{
			bounds: { xmin: -7, xmax: 7, ymin: -7, ymax: 32 },

			expressions:
			[
				{ latex: raw`f(t) = t^2`, color: desmosColors.purple, secret: true },
				{ latex: raw`a = -5`, secret: true },
				{ latex: raw`b = 5`, secret: true },
				{ latex: raw`n = 5`, secret: true },

				{ latex: raw`s = \frac{b - a}{n}`, secret: true },
				{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
				{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
				{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },
				{ latex: raw`U = [-5, -3, -1, 3, 5]`, secret: true },
				{ latex: raw`0 \leq y \leq f(U) \{ L \leq x \leq R \}`, color: desmosColors.red, secret: true },
				{ latex: raw`x = L \{ 0 \leq y \leq f(U) \}`, color: desmosColors.red, secret: true },
				{ latex: raw`x = R \{ 0 \leq y \leq f(U) \}`, color: desmosColors.red, secret: true }
			]
		},
	});
}