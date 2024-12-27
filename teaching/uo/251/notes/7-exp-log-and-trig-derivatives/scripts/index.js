import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
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
			sinAndCos:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: String.raw`f(x) = \sin(x)`, color: desmosPurple },
					{ latex: String.raw`f'(x)`, color: desmosBlue, secret: true },
					{ latex: String.raw`a = 0` },
					{ latex: String.raw`(a, f(a))`, secret: true, color: desmosPurple },
					{ latex: String.raw`(a, f'(a))`, color: desmosBlue, secret: true, showLabel: true },
					{ latex: String.raw`y = f(a) + f'(a)(x - a)`, color: desmosRed, secret: true }
				]
			},



			expDerivative:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -.5, top: 4.5 },

				expressions:
				[
					{ latex: String.raw`f(x) = e^x`, color: desmosPurple },
					{ latex: String.raw`a = 0` },
					{ latex: String.raw`(a, f(a))`, secret: true, color: desmosPurple, showLabel: true },
					{ latex: String.raw`y = f(a) + f'(a)(x - a)`, color: desmosBlue, secret: true }
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}