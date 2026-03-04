import {
	createDesmosGraphs, desmosColors
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		testGraph:
		{
			bounds: { xmin: -1, xmax: 3, ymin: -1, ymax: 3 },

			expressions:
			[
				{ latex: raw`f(x) = x^3 - 2x^2 + 2`, color: desmosColors.purple },
				{ latex: raw`a = 0` },
				{ latex: raw`b = 2` },

				{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosColors.purple, secret: true },
				{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosColors.purple, secret: true }
			]
		},



		functions:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x) = x^2`, color: desmosColors.purple },
				{ latex: raw`y = x`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = x^3`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = \sqrt{x}`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = x^{\frac{1}{3}}`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = \frac{1}{x}`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = \frac{1}{x^2}`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = e^x`, color: desmosColors.purple, hidden: true },
				{ latex: raw`y = \ln(x)`, color: desmosColors.purple, hidden: true }
			]
		},



		trigReview:
		{
			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25 },

			expressions:
			[
				{ latex: raw`r = 1`, color: desmosColors.black, secret: true },
				{ latex: raw`(0, 0), (\cos(t), \sin(t))`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`y = 0\{0 \leq x \leq \cos(t)\}`, color: desmosColors.blue, secret: true },
				{ latex: raw`y = 0\{\cos(t) \leq x \leq 0\}`, color: desmosColors.blue, secret: true },
				{ latex: raw`x = \cos(t)\{0 \leq y \leq \sin(t)\}`, color: desmosColors.red, secret: true },
				{ latex: raw`x = \cos(t)\{\sin(t) \leq y \leq 0\}`, color: desmosColors.red, secret: true },

				{ latex: raw`t = .52359878`, sliderBounds: { min: 0, max: raw`2\pi` } },

				{ latex: raw`(\cos(t), \sin(t))`, color: desmosColors.purple, showLabel: true },
			]
		},



		trigGraphs:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`\sin(x)`, color: desmosColors.red },
				{ latex: raw`\cos(x)`, color: desmosColors.blue },
				{ latex: raw`\tan(x)`, color: desmosColors.orange, hidden: true },
				{ latex: raw`\csc(x)`, color: desmosColors.blue, hidden: true },
				{ latex: raw`\sec(x)`, color: desmosColors.red, hidden: true },
				{ latex: raw`\cot(x)`, color: desmosColors.orange, hidden: true },
			]
		}
	});
}