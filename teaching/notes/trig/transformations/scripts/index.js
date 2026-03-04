import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	desmosLineStyles,
	getDesmosPoint,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		testGraph:
		{
			bounds: { xmin: -1, xmax: 3, ymin: -1, ymax: 3 },

			expressions:
			[
				{ latex: raw`f(x) = x^3 - 2x^2 + 2`, color: desmosColors.purple },
				{ latex: raw`a = 0` },
				{ latex: raw`b = 2` },

				{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosColors.purple, secret: true },
				{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosColors.purple, secret: true }
			]
		},

		powerFunctions:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x`, color: desmosColors.purple },
				{ latex: raw`f(x) = x^2`, color: desmosColors.blue },
				{ latex: raw`f(x) = x^3`, color: desmosColors.red },
				{ latex: raw`f(x) = x^a`, color: desmosColors.orange },
				{ latex: raw`a = 4`, sliderBounds: { min: 4, max: 10, step: 1 } },
			]
		},

		negativePowerFunctions:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^{-1}`, color: desmosColors.purple },
				{ latex: raw`f(x) = x^{-2}`, color: desmosColors.blue },
				{ latex: raw`f(x) = x^{-a}`, color: desmosColors.red },
				{ latex: raw`a = 3`, sliderBounds: { min: 3, max: 10, step: 1 } },
			]
		},

		fractionalPowerFunctions:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^{1/2}`, color: desmosColors.purple },
				{ latex: raw`f(x) = x^{1/3}`, color: desmosColors.blue },
				{ latex: raw`f(x) = x^{1/a}`, color: desmosColors.red },
				...getDesmosSlider({
					expression: "a = 4",
					min: 4,
					max: 10,
					step: 1,
					secret: false
				}),
			]
		},

		inverses:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^3`, color: desmosColors.purple },
				{ latex: raw`f(x) = x^{1/3}`, color: desmosColors.blue },
				{ latex: raw`y = x`, color: desmosColors.black, secret: true, lineStyle: desmosLineStyles.DASHED },
			]
		},

		exponentials:
		{
			bounds: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = e^x`, color: desmosColors.purple },
			]
		},

		verticalShift:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^2`, color: desmosColors.purple },
				{ latex: raw`g(x) = f(x) + b`, color: desmosColors.blue },
				...getDesmosSlider({
					expression: "b = 1",
					min: -5,
					max: 5,
					secret: false
				}),
				...getDesmosPoint({
					point: ["0", "b"],
					color: desmosColors.red,
					dragMode: desmosDragModes.Y,
				}),
			]
		},

		verticalStretch:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^2`, color: desmosColors.purple },
				{ latex: raw`g(x) = af(x)`, color: desmosColors.blue },
				...getDesmosSlider({
					expression: "a = 2",
					min: -5,
					max: 5,
					secret: false
				}),
				...getDesmosPoint({
					point: ["1", "a"],
					color: desmosColors.red,
					dragMode: desmosDragModes.Y,
				}),
			]
		},

		combinedTransformations:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = e^x`, color: desmosColors.purple },
				...getDesmosPoint({
					point: ["0", "f(0)"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
				}),
				...getDesmosPoint({
					point: ["1", "f(1)"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
				}),
				{ latex: raw`g(x) = \frac{1}{5}f(x)`, color: desmosColors.blue },
				...getDesmosPoint({
					point: ["0", "g(0)"],
					color: desmosColors.blue,
					dragMode: desmosDragModes.NONE,
				}),
				...getDesmosPoint({
					point: ["1", "g(1)"],
					color: desmosColors.blue,
					dragMode: desmosDragModes.NONE,
				}),
				{ latex: raw`h(x) = g(x) - 2`, color: desmosColors.red },
				...getDesmosPoint({
					point: ["0", "h(0)"],
					color: desmosColors.red,
					dragMode: desmosDragModes.NONE,
				}),
				...getDesmosPoint({
					point: ["1", "h(1)"],
					color: desmosColors.red,
					dragMode: desmosDragModes.NONE,
				}),
			]
		},

		intuitiveHorizontalTransformations:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`x = y^3`, color: desmosColors.purple },
				{ latex: raw`x = cy^3 + d`, color: desmosColors.blue },
				...getDesmosSlider({
					expression: "c = 2",
					min: -5,
					max: 5,
					secret: false
				}),
				...getDesmosSlider({
					expression: "d = 1",
					min: -5,
					max: 5,
					secret: false
				}),
			]
		},

		identifyFormulaFromGraph: {
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x) = \ln(x - 2)`, secret: true, hidden: true },
				{ latex: raw`f(x)`, color: desmosColors.purple },

				{ latex: raw`g(x) = \ln(\frac{1}{3}(x + 1))`, secret: true, hidden: true },
				{ latex: raw`g(x)`, color: desmosColors.blue, hidden: true },

				{ latex: raw`h(x) = 2\ln(-2x)`, secret: true, hidden: true },
				{ latex: raw`h(x)`, color: desmosColors.red, hidden: true },

				{ latex: raw`l(x) = -2\ln(-\frac{1}{2}(x + 1)) + 1`, secret: true, hidden: true },
				{ latex: raw`l(x)`, color: desmosColors.orange, hidden: true },
			]
		}
	});
}