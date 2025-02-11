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
			antiderivative:
			{
				bounds: { left: -3, right: 3, bottom: -1, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = \frac{x^3}{3} + C`, color: desmosPurple },
					{ latex: raw`f'(x)`, color: desmosBlue },
					{ latex: raw`C = 2` }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}