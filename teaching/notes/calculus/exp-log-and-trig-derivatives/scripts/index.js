import {
	createDesmosGraphs, desmosColors,
	desmosDragModes
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		unitCircleDerivatives:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },
				{ latex: raw`s = 0` },
				{ latex: raw`(\cos(s), \sin(s))`, color: desmosColors.purple, dragMode: desmosDragModes.XY },
				{ latex: raw`y = \sin(s) - \cot(s)(x - \cos(s))`, color: desmosColors.red, secret: true },
				{ latex: raw`x = \cos(s) \{s = 0\}`, color: desmosColors.red, secret: true },
				{ latex: raw`x = \cos(s) \{s = \pi\}`, color: desmosColors.red, secret: true }
			]
		},

		sinAndCos:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x) = \sin(x)`, color: desmosColors.purple },
				{ latex: raw`f'(x)`, color: desmosColors.blue, secret: true },
				{ latex: raw`a = 0` },
				{ latex: raw`(a, f(a))`, secret: true, color: desmosColors.purple },
				{ latex: raw`(a, f'(a))`, color: desmosColors.blue, secret: true, showLabel: true },
				{ latex: raw`y = f(a) + f'(a)(x - a)`, color: desmosColors.red, secret: true }
			]
		},



		expDerivative:
		{
			bounds: { xmin: -2.5, xmax: 2.5, ymin: -.5, ymax: 4.5 },

			expressions:
			[
				{ latex: raw`f(x) = e^x`, color: desmosColors.purple },
				{ latex: raw`a = 0` },
				{ latex: raw`(a, f(a))`, secret: true, color: desmosColors.purple, showLabel: true },
				{ latex: raw`y = f(a) + f'(a)(x - a)`, color: desmosColors.blue, secret: true }
			]
		},
	});
}