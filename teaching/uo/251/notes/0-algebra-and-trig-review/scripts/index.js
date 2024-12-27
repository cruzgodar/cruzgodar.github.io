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
			testGraph:
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



			functions:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^2`, color: desmosPurple },
					{ latex: String.raw`y = x`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = x^3`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = \sqrt{x}`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = x^{\frac{1}{3}}`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = \frac{1}{x}`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = \frac{1}{x^2}`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = e^x`, color: desmosPurple, hidden: true },
					{ latex: String.raw`y = \ln(x)`, color: desmosPurple, hidden: true }
				]
			},



			trigReview:
			{
				bounds: { left: -1.25, right: 1.25, bottom: -1.25, top: 1.25 },

				expressions:
				[
					{ latex: String.raw`r = 1`, color: desmosBlack, secret: true },
					{ latex: String.raw`(0, 0), (\cos(t), \sin(t))`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: String.raw`y = 0\{0 \leq x \leq \cos(t)\}`, color: desmosBlue, secret: true },
					{ latex: String.raw`y = 0\{\cos(t) \leq x \leq 0\}`, color: desmosBlue, secret: true },
					{ latex: String.raw`x = \cos(t)\{0 \leq y \leq \sin(t)\}`, color: desmosRed, secret: true },
					{ latex: String.raw`x = \cos(t)\{\sin(t) \leq y \leq 0\}`, color: desmosRed, secret: true },

					{ latex: String.raw`t = .52359878`, sliderBounds: { min: 0, max: String.raw`2\pi` } },

					{ latex: String.raw`(\cos(t), \sin(t))`, color: desmosPurple, showLabel: true },
				]
			},



			trigGraphs:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: String.raw`\sin(x)`, color: desmosRed },
					{ latex: String.raw`\cos(x)`, color: desmosBlue },
					{ latex: String.raw`\tan(x)`, color: desmosGreen, hidden: true },
					{ latex: String.raw`\csc(x)`, color: desmosBlue, hidden: true },
					{ latex: String.raw`\sec(x)`, color: desmosRed, hidden: true },
					{ latex: String.raw`\cot(x)`, color: desmosGreen, hidden: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}