import {
	createDesmosGraphs,
	desmosPurple
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		relatedRates:
		{
			bounds: { xmin: -5, xmax: 45, ymin: -10, ymax: 40 },

			expressions:
			[
				{ latex: raw`(0, 0), (10t, 30), (10t, 0), (0, 0)`, color: desmosPurple, lines: true },
				{ latex: raw`t = 4` },
			]
		},
	});
}