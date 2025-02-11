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



			functions:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`y = x`, color: desmosPurple, hidden: true },
					{ latex: raw`y = x^3`, color: desmosPurple, hidden: true },
					{ latex: raw`y = \sqrt{x}`, color: desmosPurple, hidden: true },
					{ latex: raw`y = x^{\frac{1}{3}}`, color: desmosPurple, hidden: true },
					{ latex: raw`y = \frac{1}{x}`, color: desmosPurple, hidden: true },
					{ latex: raw`y = \frac{1}{x^2}`, color: desmosPurple, hidden: true },
					{ latex: raw`y = e^x`, color: desmosPurple, hidden: true },
					{ latex: raw`y = \ln(x)`, color: desmosPurple, hidden: true }
				]
			},



			trigReview:
			{
				bounds: { left: -1.25, right: 1.25, bottom: -1.25, top: 1.25 },

				expressions:
				[
					{ latex: raw`r = 1`, color: desmosBlack, secret: true },
					{ latex: raw`(0, 0), (\cos(t), \sin(t))`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: raw`y = 0\{0 \leq x \leq \cos(t)\}`, color: desmosBlue, secret: true },
					{ latex: raw`y = 0\{\cos(t) \leq x \leq 0\}`, color: desmosBlue, secret: true },
					{ latex: raw`x = \cos(t)\{0 \leq y \leq \sin(t)\}`, color: desmosRed, secret: true },
					{ latex: raw`x = \cos(t)\{\sin(t) \leq y \leq 0\}`, color: desmosRed, secret: true },

					{ latex: raw`t = .52359878`, sliderBounds: { min: 0, max: raw`2\pi` } },

					{ latex: raw`(\cos(t), \sin(t))`, color: desmosPurple, showLabel: true },
				]
			},



			trigGraphs:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`\sin(x)`, color: desmosRed },
					{ latex: raw`\cos(x)`, color: desmosBlue },
					{ latex: raw`\tan(x)`, color: desmosGreen, hidden: true },
					{ latex: raw`\csc(x)`, color: desmosBlue, hidden: true },
					{ latex: raw`\sec(x)`, color: desmosRed, hidden: true },
					{ latex: raw`\cot(x)`, color: desmosGreen, hidden: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}