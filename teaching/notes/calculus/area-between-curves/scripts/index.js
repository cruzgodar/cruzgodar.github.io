import {
	createDesmosGraphs, desmosColors
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		areaBetweenCurves:
		{
			bounds: { xmin: -1, xmax: 2, ymin: -1, ymax: 2 },

			expressions:
			[
				{ latex: raw`f(x) = x`, color: desmosColors.red },
				{ latex: raw`g(x) = x^2`, color: desmosColors.blue },
				{ latex: raw`a = 0` },
				{ latex: raw`b = 1` },
				{ latex: raw`g(x) \leq y \leq f(x)\{a \leq x \leq b\}`, secret: true, color: desmosColors.purple },
				{ latex: raw`f(x) \leq y \leq g(x)\{a \leq x \leq b\}`, secret: true, color: desmosColors.purple }
			]
		},



		areaBetweenCurves2:
		{
			bounds: { xmin: -1, xmax: 4.14, ymin: -2.57, ymax: 2.57 },

			expressions:
			[
				{ latex: raw`f(x) = \sin(x)`, color: desmosColors.red },
				{ latex: raw`g(x) = \cos(x)`, color: desmosColors.blue },
				{ latex: raw`a = 0` },
				{ latex: raw`b = \pi` },
				{ latex: raw`g(x) \leq y \leq f(x)\{a \leq x \leq b\}`, secret: true, color: desmosColors.purple },
				{ latex: raw`f(x) \leq y \leq g(x)\{a \leq x \leq b\}`, secret: true, color: desmosColors.purple }
			]
		},



		areaBetweenCurves3:
		{
			bounds: { xmin: -2, xmax: 4, ymin: -2, ymax: 4 },

			expressions:
			[
				{ latex: raw`f(x) = 1`, color: desmosColors.red },
				{ latex: raw`g(x) = 3 - x`, color: desmosColors.orange },
				{ latex: raw`h(x) = x^2 + 1`, color: desmosColors.blue },

				{ latex: raw`f(x) \leq y \leq h(x)\{0 \leq x \leq 1\}`, secret: true, color: desmosColors.purple },
				{ latex: raw`f(x) \leq y \leq g(x)\{1 \leq x \leq 2\}`, secret: true, color: desmosColors.purple }
			]
		},



		areaBetweenCurves4:
		{
			bounds: { xmin: -1, xmax: 2, ymin: -1, ymax: 2 },

			expressions:
			[
				{ latex: raw`f(x) = 1 - x`, color: desmosColors.red },
				{ latex: raw`g(x) = x^2`, color: desmosColors.blue },
				{ latex: raw`h(x) = \sqrt{x}`, color: desmosColors.orange },

				{ latex: raw`f(x) \leq y \leq h(x)\{\frac{3}{2} - \frac{\sqrt{5}}{2} \leq x \leq -\frac{1}{2} + \frac{\sqrt{5}}{2}\}`, secret: true, color: desmosColors.purple },
				{ latex: raw`g(x) \leq y \leq h(x)\{-\frac{1}{2} + \frac{\sqrt{5}}{2} \leq x \leq 1\}`, secret: true, color: desmosColors.purple }
			]
		},



		areaBetweenCurves5:
		{
			bounds: { xmin: -2, xmax: 4, ymin: -2, ymax: 4 },

			expressions:
			[
				{ latex: raw`f(x) = 1`, color: desmosColors.red },
				{ latex: raw`g(x) = 3 - x`, color: desmosColors.orange },
				{ latex: raw`h(x) = x^2 + 1`, color: desmosColors.blue },

				{ latex: raw`f(x) \leq y \leq h(x)\{0 \leq x \leq 1\}`, secret: true, color: desmosColors.purple },
				{ latex: raw`f(x) \leq y \leq g(x)\{1 \leq x \leq 2\}`, secret: true, color: desmosColors.purple }
			]
		},



		areaBetweenCurves6:
		{
			bounds: { xmin: -1, xmax: 2, ymin: -1, ymax: 2 },

			expressions:
			[
				{ latex: raw`f(x) = 1 - x`, color: desmosColors.red },
				{ latex: raw`g(x) = x^2`, color: desmosColors.blue },
				{ latex: raw`h(x) = \sqrt{x}`, color: desmosColors.orange },

				{ latex: raw`f(x) \leq y \leq h(x)\{\frac{3}{2} - \frac{\sqrt{5}}{2} \leq x \leq -\frac{1}{2} + \frac{\sqrt{5}}{2}\}`, secret: true, color: desmosColors.purple },
				{ latex: raw`g(x) \leq y \leq h(x)\{-\frac{1}{2} + \frac{\sqrt{5}}{2} \leq x \leq 1\}`, secret: true, color: desmosColors.purple }
			]
		},
	});
}