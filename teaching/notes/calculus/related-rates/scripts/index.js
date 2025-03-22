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
			relatedRates:
			{
				bounds: { left: -10, right: 110, bottom: -10, top: 110 },

				expressions:
				[
					{ latex: raw`(0, 0), (10t, 100), (10t, 0), (0, 0)`, color: desmosPurple, lines: true },
					{ latex: raw`t = 10` },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}