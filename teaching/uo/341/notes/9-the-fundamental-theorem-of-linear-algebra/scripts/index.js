import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	setGetDesmosData
} from "/scripts/src/desmos.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			coordinateSystems:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`A = [-50, ..., 50]`, secret: true },
					{ latex: String.raw`y - 2A = -x + A`, color: desmosPurple, secret: true },
					{ latex: String.raw`x - A = 2(y + A)`, color: desmosPurple, secret: true },
					{ latex: String.raw`(3, 3)`, color: desmosBlue, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}