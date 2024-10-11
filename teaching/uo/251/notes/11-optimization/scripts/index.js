import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
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
			"extrema":
			{
				bounds: { left: -3.5, right: 3.5, bottom: -3.5, top: 3.5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^5 - 3x^3 + x \{-1.5 \leq x \leq 1.5\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`(-3, 0), (-2, 2), (-1.5, f(-1.5))`, secret: true, points: false, lines: true, color: desmosPurple },
					{ latex: String.raw`(-3, 0), (-1.5, f(-1.5)), (-.345, f(-.345)), (1.297, f(1.297))`, secret: true, color: desmosBlue },
					{ latex: String.raw`(-2, 2), (-1.297, f(-1.297)), (.345, f(.345)), (1.5, f(1.5))`, secret: true, color: desmosRed },
				]
			},



			"saddle-point":
			{
				bounds: { left: -3, right: 3, bottom: -3, top: 3 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^3`, color: desmosPurple },
					{ latex: String.raw`(0, 0)`, color: desmosBlue },
				]
			},



			"critical-points":
			{
				bounds: { left: -2.5, right: 2.5, bottom: -15, top: 10 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^5 - 3x^3 + x \left\{-2 \leq x \leq 1.5\right\}`, color: desmosPurple },
				]
			},



			"concavity":
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^5 - 3x^3 + x`, color: desmosPurple, hidden: true, secret: true },
					{ latex: String.raw`f(x)`, color: desmosPurple },
					{ latex: String.raw`f''(x)`, color: desmosGreen, hidden: true },

					{ latex: String.raw`y \geq f(x) \{-.949 \leq x \leq 0, .949 \leq x\}`, color: desmosRed, secret: true },
					{ latex: String.raw`y \leq f(x) \{x \leq -.949, 0 \leq x \leq .949\}`, color: desmosBlue, secret: true },
				]
			},



			"first-derivative-test":
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: String.raw`g(t) = t^6 - t^4`, color: desmosPurple },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}