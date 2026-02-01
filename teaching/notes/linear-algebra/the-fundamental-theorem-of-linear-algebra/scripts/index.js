import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		coordinateSystems:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`A = [-50, ..., 50]`, secret: true },
				{ latex: raw`y - 2A = -x + A`, color: desmosPurple, secret: true },
				{ latex: raw`x - A = 2(y + A)`, color: desmosPurple, secret: true },
				{ latex: raw`(3, 3)`, color: desmosBlue, secret: true },
			]
		},
	});
}