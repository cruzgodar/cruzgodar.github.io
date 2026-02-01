import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setDesmosData({
		sinAndCos:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x) = \sin(x)`, color: desmosPurple },
				{ latex: raw`f'(x)`, color: desmosBlue, secret: true },
				{ latex: raw`a = 0` },
				{ latex: raw`(a, f(a))`, secret: true, color: desmosPurple },
				{ latex: raw`(a, f'(a))`, color: desmosBlue, secret: true, showLabel: true },
				{ latex: raw`y = f(a) + f'(a)(x - a)`, color: desmosRed, secret: true }
			]
		},



		expDerivative:
		{
			bounds: { xmin: -2.5, xmax: 2.5, ymin: -.5, ymax: 4.5 },

			expressions:
			[
				{ latex: raw`f(x) = e^x`, color: desmosPurple },
				{ latex: raw`a = 0` },
				{ latex: raw`(a, f(a))`, secret: true, color: desmosPurple, showLabel: true },
				{ latex: raw`y = f(a) + f'(a)(x - a)`, color: desmosBlue, secret: true }
			]
		},
	});

	createDesmosGraphs();
}