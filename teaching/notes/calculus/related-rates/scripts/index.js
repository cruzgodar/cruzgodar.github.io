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
				bounds: { xmin: -10, xmax: 110, ymin: -10, ymax: 110 },

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
}