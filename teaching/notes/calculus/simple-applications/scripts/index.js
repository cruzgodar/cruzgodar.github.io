import {
	createDesmosGraphs,
	desmosBlue,
	desmosOrange,
	desmosPurple,
	desmosRed
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		displacement:
		{
			bounds: { xmin: -1, xmax: 4, ymin: -7, ymax: 8 },

			expressions:
			[
				{ latex: raw`v(t) = 3t - 5 \left\{0 \leq t \leq 3\right\}`, color: desmosPurple },
				{ latex: raw`s(t) = \int_0^t v(x) dx`, color: desmosBlue },
				{ latex: raw`v_{pos}(t) = \left|v(t)\right|`, color: desmosRed },
				{ latex: raw`s_{tot}(t) = \int_0^t v_{pos}(x) dx`, color: desmosOrange }
			]
		},



		evenAndOddFunctions:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -2.5, ymax: 2.5 },

			expressions:
			[
				{ latex: raw`x^4 - x^2`, color: desmosPurple },
				{ latex: raw`\sin(x)`, color: desmosBlue }
			]
		}
	});
}