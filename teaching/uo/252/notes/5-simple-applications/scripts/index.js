import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
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
			displacement:
			{
				bounds: { left: -1, right: 4, bottom: -7, top: 8 },

				expressions:
				[
					{ latex: raw`v(t) = 3t - 5 \left\{0 \leq t \leq 3\right\}`, color: desmosPurple },
					{ latex: raw`s(t) = \int_0^t v(x) dx`, color: desmosBlue },
					{ latex: raw`v_{pos}(t) = \left|v(t)\right|`, color: desmosRed },
					{ latex: raw`s_{tot}(t) = \int_0^t v_{pos}(x) dx`, color: desmosGreen }
				]
			},



			evenAndOddFunctions:
			{
				bounds: { left: -5, right: 5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: raw`x^4 - x^2`, color: desmosPurple },
					{ latex: raw`\sin(x)`, color: desmosBlue }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}