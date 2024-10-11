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
			"displacement":
			{
				bounds: { left: -1, right: 4, bottom: -7, top: 8 },

				expressions:
				[
					{ latex: String.raw`v(t) = 3t - 5 \left\{0 \leq t \leq 3\right\}`, color: desmosPurple },
					{ latex: String.raw`s(t) = \int_0^t v(x) dx`, color: desmosBlue },
					{ latex: String.raw`v_{pos}(t) = \left|v(t)\right|`, color: desmosRed },
					{ latex: String.raw`s_{tot}(t) = \int_0^t v_{pos}(x) dx`, color: desmosGreen }
				]
			},



			"even-and-odd-functions":
			{
				bounds: { left: -5, right: 5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: String.raw`x^4 - x^2`, color: desmosPurple },
					{ latex: String.raw`\sin(x)`, color: desmosBlue }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}