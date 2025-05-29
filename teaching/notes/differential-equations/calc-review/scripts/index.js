import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
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



			limitExample:
			{
				bounds: { left: -20, right: 20, bottom: -2, top: 2 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{\sin(x)}{x}`, color: desmosBlue },
					{ latex: raw`(0, 1)`, color: desmosBlue, pointStyle: "OPEN" }
				]
			},



			secantLineExample:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -1, top: 4 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`a = 1` },
					{ latex: raw`h = 0.1` },
					{ latex: raw`m = \frac{f(a + h) - f(a)}{h}` },

					{ latex: raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: raw`(a + h, f(a + h))`, color: desmosBlue, secret: true },
					{ latex: raw`y - f(a) = m(x - a)`, color: desmosBlue, secret: true }
				]
			},



			definiteIntegralExample:
			{
				bounds: { left: -5, right: 5, bottom: -100, top: 100 },

				expressions:
				[
					{ latex: raw`f(x) = x^3`, color: desmosBlue },
					{ latex: raw`a = -2` },
					{ latex: raw`b = 4` },
					{ latex: raw`\int_a^b f(x)\ dx` },

					{ latex: raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: raw`(b, f(b))`, color: desmosBlue, secret: true },
					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosBlue, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosBlue, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosBlue, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosBlue, secret: true }
				]
			},



			uSubExample:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x\sin(x^2)`, color: desmosPurple },
					{ latex: raw`F(x) = \int_0^x f(t)\ dt`, hidden: true },
					{ latex: raw`F(\sqrt{\pi}) - F(0)` },


					{ latex: raw`a = 0`, secret: true },
					{ latex: raw`b = \sqrt{\pi}`, secret: true },
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