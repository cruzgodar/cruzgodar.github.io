import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		antiderivative:
		{
			bounds: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = \frac{x^3}{3} + C`, color: desmosPurple },
				{ latex: raw`f'(x)`, color: desmosBlue },
				{ latex: raw`C = 2` }
			]
		}
	});
}