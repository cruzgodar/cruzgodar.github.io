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
			ftcPart1:
			{
				bounds: { left: -7, right: 10, bottom: -5, top: 12 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{27}x^3 - \frac{2}{9}x^2 + 2`, color: desmosPurple },
					{ latex: raw`F(x) = \int_0^x f(t) dt`, color: desmosBlue },
					{ latex: raw`F(c + 1) - F(c)` },

					{ latex: raw`c = 2` },

					{ latex: raw`x = [c, c + 1] \{0 \leq y \leq f(c)\}`, color: desmosRed, secret: true },
					{ latex: raw`x = [c, c + 1] \{f(c) \leq y \leq 0\}`, color: desmosRed, secret: true },

					{ latex: raw`0 \leq y \leq f(c) \{c \leq x \leq c + 1\}`, color: desmosRed, secret: true },
					{ latex: raw`f(c) \leq y \leq 0 \{c \leq x \leq c + 1\}`, color: desmosRed, secret: true }
				]
			},



			ftcPart2:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: raw`f(x) = (x+\frac{1}{2})^3 - 2(x+\frac{1}{2})^2 + 1`, color: desmosPurple },
					{ latex: raw`F(x) = \int_0^x f(t) dt`, color: desmosBlue },
					{ latex: raw`F(b) - F(a)` },

					{ latex: raw`a = -1.5`, secret: true },
					{ latex: raw`b = 1.5`, secret: true },

					{ latex: raw`(a, F(a))`, secret: true, color: desmosBlue },
					{ latex: raw`(b, F(b))`, secret: true, color: desmosBlue },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true },

					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}