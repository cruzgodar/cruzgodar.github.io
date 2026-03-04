import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	desmosLineStyles,
	desmosPointStyles,
	getDesmosPoint,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		periodicFunction:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x - a)`, color: desmosColors.blue },
				{ latex: raw`f(x) = 3m(x)^3 - 3m(x)^2 - 1`, secret: true },
				{ latex: raw`f(x)`, color: desmosColors.purple },
				{ latex: raw`m(x) = \mod(x + 0.5, 2) - 0.5`, hidden: true, secret: true },
				...getDesmosSlider({
					expression: "a = 0",
					min: -5,
					max: 5,
					secret: false
				}),
				...getDesmosPoint({
					point: ["a", "f(0)"],
					color: desmosColors.blue,
					dragMode: desmosDragModes.X,
				})
			]
		},

		periodicFunction2:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`g(x) = \{ 0 \leq x \leq 1: x^2, 1 \leq x \leq 3: 1.5 - \frac{x}{2} \}`, secret: true, color: desmosColors.purple },
			]
		},

		periodicFunction3:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`h(x) = \{ -2 \leq x \leq -1: 2 + x, 3 \leq x \leq 4: 2 - (x - 3)^2 \}`, secret: true, color: desmosColors.purple },
				...getDesmosPoint({
					point: ["-2", "0"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
					style: desmosPointStyles.OPEN,
				}),
				...getDesmosPoint({
					point: ["-1", "1"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
				}),
				...getDesmosPoint({
					point: ["3", "2"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
					style: desmosPointStyles.OPEN,
				}),
				...getDesmosPoint({
					point: ["4", "1"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
				}),
			]
		},

		carEngine:
		{
			bounds: { xmin: -1 / 1200, xmax: 3 / 1200, ymin: -5, ymax: 50 },

			expressions:
			[
				{ latex: raw`N(t) = N_0(\mod(t, \frac{1}{600}))\left\{ t \geq 0 \right\}`, secret: true, hidden: true },
				{ latex: raw`N(x)`, color: desmosColors.blue },
				{ latex: raw`N_0(t) = \left\{ 0 \leq t \leq \frac{1}{1200}: 20 + 12000t, \frac{1}{1200} \leq t \leq \frac{1}{600}: 40 - 12000t \right\}`, color: desmosColors.purple },
			]
		},
		
		angles:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`y = 0 \left\{ x > 0 \right\}`, color: desmosColors.purple, secret: true },
				{ latex: raw`(t \cos(\frac{\pi}{180} a), t \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, secret: true, parametricDomain: { min: 0, max: 100 } },
				{ latex: raw`r = 1 \left\{ 0 \leq \theta \leq \frac{\pi}{180} a \right\}`, color: desmosColors.purple, secret: true },
				{ latex: raw`(1.25 \cos(\frac{\pi}{360} a), 1.25 \sin(\frac{\pi}{360} a))`, color: desmosColors.purple, label: "θ", showLabel: true, labelSize: "large", hidden: true, secret: true },
				...getDesmosSlider({
					expression: "a = 90",
					min: 0,
					max: 360,
					step: 1,
					secret: false
				}),
			]
		},

		rightTriangle:
		{
			bounds: { xmin: -1, xmax: 5, ymin: -1.5, ymax: 4.5 },

			expressions:
			[
				{ latex: raw`(0, 0), (4, 0), (0, 3), (0, 0)`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(0, 0.25), (0.25, 0.25), (0.25, 0)`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(2, -0.25)`, color: desmosColors.purple, label: "Leg", showLabel: true, labelSize: "large", hidden: true, secret: true },
				{ latex: raw`(-0.25, 1.5)`, color: desmosColors.purple, label: "Leg", showLabel: true, labelSize: "large", hidden: true, secret: true },
				{ latex: raw`(2.35, 1.75)`, color: desmosColors.purple, label: "Hypotenuse", showLabel: true, labelSize: "large", hidden: true, secret: true },
			]
		},

		pythagoreanTheorem:
		{
			bounds: { xmin: -1, xmax: 11, ymin: -1, ymax: 11 },

			expressions:
			[
				{ latex: raw`(0, 0), (a, 0)`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(0, 0), (0, b)`, color: desmosColors.blue, points: false, lines: true, secret: true },
				{ latex: raw`(a, 0), (0, b)`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`(a, sb), (a + b, sb)`, color: desmosColors.blue, points: false, lines: true, secret: true },
				{ latex: raw`(a + b, sb), (a + b, a + sb)`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(a + b, a + sb), (a, sb)`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`(sa, b), (sa, a + b)`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(sa, a + b), (b + sa, a + b)`, color: desmosColors.blue, points: false, lines: true, secret: true },
				{ latex: raw`(b + sa, a + b), (sa, b)`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`((1 - s)b, (1 - s)a + b), (a + (1 - s)b, (1 - s)a + b)`, color: desmosColors.red, points: false, lines: true, secret: true },
				{ latex: raw`(a + (1 - s)b, (1 - s)a + b), (a + (1 - s)b, (1 - s)a)`, color: desmosColors.blue, points: false, lines: true, secret: true },
				{ latex: raw`(a + (1 - s)b, (1 - s)a), ((1 - s)b, (1 - s)a + b)`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`\polygon((0, b), (b, a + b), (a + b, a), (a, 0))`, color: desmosColors.purple, lineOpacity: raw`1 - s`, fillOpacity: raw`0.5(1 - s)`, secret: true },

				{ latex: raw`\polygon((0, b), (a, b), (a, a + b), (0, a + b))`, color: desmosColors.red, lineOpacity: raw`s`, fillOpacity: raw`0.5s`, secret: true },
				{ latex: raw`\polygon((a, 0), (a + b, 0), (a + b, b), (a, b))`, color: desmosColors.blue, lineOpacity: raw`s`, fillOpacity: raw`0.5s`, secret: true },

				...getDesmosSlider({
					expression: "a = 4",
					min: 0.5,
					max: 5,
					secret: false
				}),

				...getDesmosSlider({
					expression: "b = 3",
					min: 0.5,
					max: 5,
					secret: false
				}),

				...getDesmosPoint({
					point: ["a", "0"],
					color: desmosColors.red,
					secret: true,
					dragMode: desmosDragModes.X
				}),

				...getDesmosPoint({
					point: ["0", "b"],
					color: desmosColors.blue,
					secret: true,
					dragMode: desmosDragModes.Y
				}),

				{ latex: raw`c = \sqrt{a^2 + b^2}`, color: desmosColors.purple },

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),
			]
		},

		similarTriangles:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`(-1, 0), (0, 3), (4, 0), (-1, 0)`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(0.5, -0.5), (0, -2), (-2, -0.5), (0.5, -0.5)`, color: desmosColors.blue, points: false, lines: true, secret: true },
			]
		},

		unitCircle:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: true, secret: true, showLabel: true },
				
				...getDesmosSlider({
					expression: "a = 30",
					min: 0,
					max: 360,
					step: 1,
					secret: false
				}),

				{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosColors.blue, points: false, lines: true, lineStyle: desmosLineStyles.DASHED, secret: true },
			]
		},
	});
}