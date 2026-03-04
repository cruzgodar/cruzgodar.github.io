import {
	createDesmosGraphs, desmosColors,
	desmosPointStyles
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		limitExample:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`\frac{x^2 - 1}{x - 1}`, color: desmosColors.purple },
				{ latex: raw`(1, 2)`, color: desmosColors.purple, pointStyle: desmosPointStyles.OPEN },
			]
		},



		limitExample2:
		{
			bounds: { xmin: 0, xmax: 8, ymin: -3, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(t) = \sqrt{t - 2}`, color: desmosColors.purple },
			]
		},



		squeezeTheorem:
		{
			bounds: {
				xmin: -25 * Math.PI / 2,
				xmax: 25 * Math.PI / 2,
				ymin: -25 * Math.PI / 2,
				ymax: 25 * Math.PI / 2
			},

			expressions:
			[
				{ latex: raw`f(x) = -\left|x\right|`, color: desmosColors.blue },
				{ latex: raw`g(x) = x\sin(x)`, color: desmosColors.purple },
				{ latex: raw`h(x) = \left|x\right|`, color: desmosColors.red },
			]
		},
	});
}