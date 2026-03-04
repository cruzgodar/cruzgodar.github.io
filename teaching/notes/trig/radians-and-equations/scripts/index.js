import {
	createDesmosGraphs, desmosColors,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		radiusWrap:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`a = [0, 1, 2, 3, 4, 5, 6]`, color: desmosColors.purple, points: true, secret: false },
				{ latex: raw`1.05(\cos(0), \sin(0))`, color: desmosColors.purple, hidden: true, secret: true, label: "0", showLabel: true },
				{ latex: raw`1.05(\cos(1), \sin(1))`, color: desmosColors.purple, hidden: true, secret: true, label: "1", showLabel: true },
				{ latex: raw`1.05(\cos(2), \sin(2))`, color: desmosColors.purple, hidden: true, secret: true, label: "2", showLabel: true },
				{ latex: raw`1.05(\cos(3), \sin(3))`, color: desmosColors.purple, hidden: true, secret: true, label: "3", showLabel: true },
				{ latex: raw`1.05(\cos(4), \sin(4))`, color: desmosColors.purple, hidden: true, secret: true, label: "4", showLabel: true },
				{ latex: raw`1.05(\cos(5), \sin(5))`, color: desmosColors.purple, hidden: true, secret: true, label: "5", showLabel: true },
				{ latex: raw`1.05(\cos(6), \sin(6))`, color: desmosColors.purple, hidden: true, secret: true, label: "6", showLabel: true },

				{ latex: raw`(\cos(a), \sin(a))`, color: desmosColors.purple, points: true, secret: false },
			]
		},

		arcLengthEtc:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				...getDesmosSlider({
					expression: raw`a = 1`,
					min: 0,
					max: raw`2\pi`,
					secret: false,
				}),

				{ latex: raw`(1, 0), (0, 0), (\cos(a), \sin(a))`, color: desmosColors.black, points: true, lines: true, secret: true },
				{ latex: raw`r \leq 1 \left\{ 0 \leq \theta \leq a \right\}`, color: desmosColors.blue, points: false, lines: true, secret: true },
				{ latex: raw`r = 1 \left\{ 0 \leq \theta \leq a \right\}`, color: desmosColors.purple, points: false, lines: true, secret: true },
			]
		},

		circleAndLine:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`y = \frac{1}{2}`, color: desmosColors.blue },
				{ latex: raw`( \frac{\sqrt{3}}{2}, \frac{1}{2} ), ( -\frac{\sqrt{3}}{2}, \frac{1}{2} )`, color: desmosColors.purple, pointSize: 15 },
			]
		}
	});
}