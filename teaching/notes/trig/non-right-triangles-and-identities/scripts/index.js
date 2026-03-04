import {
	createDesmosGraphs, desmosColors,
	desmosLineStyles,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		lawOfCosines:
		{
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = b^2`, color: desmosColors.black, hidden: true },

				...getDesmosSlider({
					expression: raw`\gamma = 1`,
					min: 0,
					max: raw`\pi`,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`a = 2`,
					min: 0,
					max: 3,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`b = 2.5`,
					min: 0,
					max: 3,
					secret: false,
				}),

				{ latex: raw`c = \sqrt{a^2 + b^2 - 2ab\cos(\gamma)}`, secret: true },

				{ latex: raw`(0, 0), (a, 0)`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosColors.blue, points: false, lines: true, secret: true },

				{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, secret: true },

				{ latex: raw`(0.4\cos(0.5\gamma), 0.4\sin(0.5\gamma))`, color: desmosColors.purple, label: "γ", showLabel: true, hidden: true, secret: true },

				{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
				{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
				{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },
				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)) + (0.4\cos(a_3), 0.4\sin(a_3))`, color: desmosColors.red, label: "α", showLabel: true, hidden: true, secret: true },

				{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a)`, secret: true },
				{ latex: raw`(a, 0) + (0.35\cos(b_3), 0.35\sin(b_3))`, color: desmosColors.blue, label: "β", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(0.5a, -0.2)`, color: desmosColors.red, label: "a", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5b\cos(\gamma), 0.5b\sin(\gamma)) + (0.2\cos(b_3), 0.2\sin(b_3))`, color: desmosColors.blue, label: "b", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))`, color: desmosColors.purple, label: "c", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(a, 0), (a, b\sin(\gamma)), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, hidden: true, points: false, lines: true, lineStyle: desmosLineStyles.DASHED },
			]
		},

		lawOfSines:
		{
			bounds: { xmin: -1, xmax: 3, ymin: -1, ymax: 3 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`\gamma = 1`,
					min: 0,
					max: raw`\pi`,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`a = 2`,
					min: 0,
					max: 3,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`b = 2.5`,
					min: 0,
					max: 3,
					secret: false,
				}),

				{ latex: raw`c = \sqrt{a^2 + b^2 - 2ab\cos(\gamma)}`, secret: true },

				{ latex: raw`(0, 0), (a, 0)`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosColors.blue, points: false, lines: true, secret: true },

				{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, secret: true },

				{ latex: raw`(0.4\cos(0.5\gamma), 0.4\sin(0.5\gamma))`, color: desmosColors.purple, label: "γ", showLabel: true, hidden: true, secret: true },

				{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
				{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
				{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },
				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)) + (0.4\cos(a_3), 0.4\sin(a_3))`, color: desmosColors.red, label: "α", showLabel: true, hidden: true, secret: true },

				{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a)`, secret: true },
				{ latex: raw`(a, 0) + (0.35\cos(b_3), 0.35\sin(b_3))`, color: desmosColors.blue, label: "β", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(0.5a, -0.2)`, color: desmosColors.red, label: "a", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5b\cos(\gamma), 0.5b\sin(\gamma)) + (0.2\cos(b_3), 0.2\sin(b_3))`, color: desmosColors.blue, label: "b", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))`, color: desmosColors.purple, label: "c", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (b\cos(\gamma), 0)`, color: desmosColors.black, points: false, lines: true, lineStyle: desmosLineStyles.DASHED },
			]
		},

		lawOfSines2:
		{
			bounds: { xmin: -1, xmax: 2, ymin: -0.5, ymax: 2.5 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`\gamma = 1.645`,
					min: 0,
					max: raw`\pi`,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`a = 1`,
					min: 0,
					max: 3,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`b = 2`,
					min: 0,
					max: 3,
					secret: false,
				}),

				{ latex: raw`c = \sqrt{a^2 + b^2 - 2ab\cos(\gamma)}`, secret: false },

				{ latex: raw`(0, 0), (a, 0)`, color: desmosColors.black, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, points: false, lines: true, secret: true },
				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosColors.black, points: false, lines: true, secret: true },

				{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, secret: true },

				{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
				{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
				{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },

				{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a) + 0.2`, secret: false },
				{ latex: raw`(a, 0) + (0.35\cos(b_3), 0.35\sin(b_3))`, color: desmosColors.black, label: "π/3", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(0.5a, -0.2)`, color: desmosColors.black, label: "1", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5b\cos(\gamma), 0.5b\sin(\gamma)) + (0.2\cos(b_3), 0.2\sin(b_3))`, color: desmosColors.black, label: "2", showLabel: true, hidden: true, secret: true },
			]
		},

		lawOfSines3:
		{
			bounds: {
				xmin: -0.25,
				xmax: Math.sqrt(3) + 0.25,
				ymin: -(Math.sqrt(3) / 2 + 0.25) + 0.5,
				ymax: (Math.sqrt(3) / 2 + 0.25) + 0.5
			},

			expressions:
			[
				...getDesmosSlider({
					expression: raw`\gamma = \frac{\pi}{6}`,
					min: 0,
					max: raw`\pi`,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`a = \sqrt{3}`,
					min: 0,
					max: 3,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`b = 2`,
					min: 0,
					max: 3,
					secret: false,
				}),

				{ latex: raw`(0, 0), (a, 0)`, color: desmosColors.black, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, points: false, lines: true, secret: true },
				{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosColors.black, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma)) \left\{ b < 0.95 \right\}`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma)) \left\{ 1.05 < b < 1.95 \right\}`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma)) \left\{ 2.05 < b \right\}`, color: desmosColors.red, points: false, lines: true, secret: true },

				{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosColors.black, secret: true },

				{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
				{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
				{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },

				{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a) + 0.2`, secret: true },

				{ latex: raw`(0.4\cos(0.5\gamma), 0.4\sin(0.5\gamma))`, color: desmosColors.black, label: "π/6", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5a, -0.2)`, color: desmosColors.black, label: "√3", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))\left\{0.95 \leq b \leq 1.05 \right\}`, color: desmosColors.black, label: "1", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))\left\{1.95 \leq b \leq 2.05 \right\}`, color: desmosColors.black, label: "1", showLabel: true, hidden: true, secret: true },
			]
		},

		cotangent:
		{
			bounds: {
				xmin: - 0.5 * Math.PI - 0.5,
				xmax: 1.5 * Math.PI + 0.5,
				ymin: - Math.PI - 0.5,
				ymax: Math.PI + 0.5
			},

			expressions:
			[
				{ latex: raw`\cot(x)`, color: desmosColors.purple },
			]
		},

		cosecant:
		{
			bounds: {
				xmin: -Math.PI - 0.5,
				xmax: 3 * Math.PI + 0.5,
				ymin: - 2 * Math.PI - 0.5,
				ymax: 2 * Math.PI + 0.5
			},

			expressions:
			[
				{ latex: raw`\csc(x)`, color: desmosColors.purple },
				{ latex: raw`\sin(x)`, color: desmosColors.blue },

				{ latex: raw`\sec(x)`, color: desmosColors.purple, hidden: true },
				{ latex: raw`\cos(x)`, color: desmosColors.blue, hidden: true },
			]
		},

		sumFormulas:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`\alpha = 0.5`,
					min: 0,
					max: raw`\frac{\pi}{2}`,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`\beta = 0.5`,
					min: 0,
					max: raw`\frac{\pi}{2} - \alpha`,
					secret: false,
				}),

				{ latex: raw`x^2 + y^2 = 1 \left\{ x \geq 0 \right\} \left\{ y \geq 0 \right\}`, color: desmosColors.black, secret: true },

				{ latex: raw`\polygon((0, 0), (\cos(\alpha)\cos(\beta), 0), (\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)), (0, 0))`, color: desmosColors.purple, lines: true, fill: true, fillOpacity: 0.25, secret: true },

				{ latex: raw`\polygon((0, 0), (\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)), (\cos(\alpha + \beta), \sin(\alpha + \beta)), (0, 0))`, color: desmosColors.blue, lines: true, fill: true, fillOpacity: 0.25, secret: true },

				{ latex: raw`\polygon((\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)), (\cos(\alpha)\cos(\beta), \sin(\alpha + \beta)), (\cos(\alpha + \beta), \sin(\alpha + \beta)), (\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)))`, color: desmosColors.red, lines: true, fill: true, fillOpacity: 0.25, secret: true },

				{ latex: raw`(0, 0), (\cos(\alpha + \beta), \sin(\alpha + \beta)), (\cos(\alpha + \beta), 0), (0, 0)`, color: desmosColors.orange, points: false, lines: true, secret: true },

				{ latex: raw`(0.2\cos(0.5\alpha), 0.2\sin(0.5\alpha))`, color: desmosColors.purple, label: "α", showLabel: true, hidden: true, secret: true },
				{ latex: raw`(0.2\cos(0.5\beta + \alpha), 0.2\sin(0.5\beta + \alpha))`, color: desmosColors.blue, label: "β", showLabel: true, hidden: true, secret: true },

				{ latex: raw`(\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)) + (0.15\cos(\frac{\pi}{2} + 0.5\alpha), 0.15\sin(\frac{\pi}{2} + 0.5\alpha))`, color: desmosColors.red, label: "α", showLabel: true, hidden: true, secret: true },
			]
		}
	});
}