import {
    createDesmosGraphs,
    desmosBlue,
    desmosPurple,
    setGetDesmosData
} from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"test-graph":
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



			"limit-example":
			{
				bounds: { left: -20, right: 20, bottom: -2, top: 2 },

				expressions:
				[
					{ latex: String.raw`f(x) = \frac{\sin(x)}{x}`, color: desmosBlue },
					{ latex: String.raw`(0, 1)`, color: desmosBlue, pointStyle: "OPEN" }
				]
			},



			"secant-line-example":
			{
				bounds: { left: -2.5, right: 2.5, bottom: -1, top: 4 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^2`, color: desmosPurple },
					{ latex: String.raw`a = 1` },
					{ latex: String.raw`h = 0.1` },
					{ latex: String.raw`m = \frac{f(a + h) - f(a)}{h}` },

					{ latex: String.raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: String.raw`(a + h, f(a + h))`, color: desmosBlue, secret: true },
					{ latex: String.raw`y - f(a) = m(x - a)`, color: desmosBlue, secret: true }
				]
			},



			"definite-integral-example":
			{
				bounds: { left: -5, right: 5, bottom: -100, top: 100 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^3`, color: desmosBlue },
					{ latex: String.raw`a = -2` },
					{ latex: String.raw`b = 4` },
					{ latex: String.raw`\int_a^b f(x)\ dx` },

					{ latex: String.raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: String.raw`(b, f(b))`, color: desmosBlue, secret: true },
					{ latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosBlue, secret: true },
					{ latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosBlue, secret: true },
					{ latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosBlue, secret: true },
					{ latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosBlue, secret: true }
				]
			},



			"u-sub-example":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x\sin(x^2)`, color: desmosPurple },
					{ latex: String.raw`F(x) = \int_0^x f(t)\ dt`, hidden: true },
					{ latex: String.raw`F(\sqrt{\pi}) - F(0)` },


					{ latex: String.raw`a = 0`, secret: true },
					{ latex: String.raw`b = \sqrt{\pi}`, secret: true },
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