import { createDesmosGraphs, desmosBlue, desmosPurple, desmosRed, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"ftc-part-1":
			{
				bounds: { left: -7, right: 10, bottom: -5, top: 12 },

				expressions:
				[
					{ latex: String.raw`f(x) = \frac{1}{27}x^3 - \frac{2}{9}x^2 + 2`, color: desmosPurple },
					{ latex: String.raw`F(x) = \int_0^x f(t) dt`, color: desmosBlue },
					{ latex: String.raw`F(c + 1) - F(c)` },

					{ latex: String.raw`c = 2` },

					{ latex: String.raw`x = [c, c + 1] \{0 \leq y \leq f(c)\}`, color: desmosRed, secret: true },
					{ latex: String.raw`x = [c, c + 1] \{f(c) \leq y \leq 0\}`, color: desmosRed, secret: true },

					{ latex: String.raw`0 \leq y \leq f(c) \{c \leq x \leq c + 1\}`, color: desmosRed, secret: true },
					{ latex: String.raw`f(c) \leq y \leq 0 \{c \leq x \leq c + 1\}`, color: desmosRed, secret: true }
				]
			},



			"ftc-part-2":
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: String.raw`f(x) = (x+\frac{1}{2})^3 - 2(x+\frac{1}{2})^2 + 1`, color: desmosPurple },
					{ latex: String.raw`F(x) = \int_0^x f(t) dt`, color: desmosBlue },
					{ latex: String.raw`F(b) - F(a)` },

					{ latex: String.raw`a = -1.5`, secret: true },
					{ latex: String.raw`b = 1.5`, secret: true },

					{ latex: String.raw`(a, F(a))`, secret: true, color: desmosBlue },
					{ latex: String.raw`(b, F(b))`, secret: true, color: desmosBlue },

					{ latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true },

					{ latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}