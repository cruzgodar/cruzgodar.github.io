import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
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
			improperIntegral:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{x^2}`, color: desmosPurple },
					{ latex: raw`a = 1` },
					{ latex: raw`b = \infty` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
				]
			},



			improperIntegral2:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{x}`, color: desmosPurple },
					{ latex: raw`a = -\infty` },
					{ latex: raw`b = -1` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
				]
			},



			improperIntegral3:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{\sqrt{4 - x}}`, color: desmosPurple },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 4` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
				]
			},



			improperIntegral4:
			{
				bounds: { left: -4, right: 4, bottom: -4, top: 4 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{x^3}`, color: desmosPurple },
					{ latex: raw`a = -1` },
					{ latex: raw`b = 1` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}