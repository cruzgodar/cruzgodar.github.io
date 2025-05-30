import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			angles:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`y = 0 \left\{ x > 0 \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`(t \cos(\frac{\pi}{180} a), t \sin(\frac{\pi}{180} a))`, color: desmosPurple, secret: true, parametricDomain: { min: 0, max: 100 } },
					{ latex: raw`r = 1 \left\{ 0 \leq \theta \leq \frac{\pi}{180} a \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`(1.25 \cos(\frac{\pi}{360} a), 1.25 \sin(\frac{\pi}{360} a))`, color: desmosPurple, label: "θ", showLabel: true, labelSize: "large", hidden: true, secret: true },
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
				bounds: { left: -1, right: 5, bottom: -1.5, top: 4.5 },

				expressions:
				[
					{ latex: raw`(0, 0), (4, 0), (0, 3), (0, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(0, 0.25), (0.25, 0.25), (0.25, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(2, -0.25)`, color: desmosPurple, label: "Leg", showLabel: true, labelSize: "large", hidden: true, secret: true },
					{ latex: raw`(-0.25, 1.5)`, color: desmosPurple, label: "Leg", showLabel: true, labelSize: "large", hidden: true, secret: true },
					{ latex: raw`(2.35, 1.75)`, color: desmosPurple, label: "Hypotenuse", showLabel: true, labelSize: "large", hidden: true, secret: true },
				]
			},

			pythagoreanTheorem:
			{
				bounds: { left: -1, right: 11, bottom: -1, top: 11 },

				expressions:
				[
					{ latex: raw`(0, 0), (a, 0)`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(0, 0), (0, b)`, color: desmosBlue, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (0, b)`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: raw`(a, sb), (a + b, sb)`, color: desmosBlue, points: false, lines: true, secret: true },
					{ latex: raw`(a + b, sb), (a + b, a + sb)`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(a + b, a + sb), (a, sb)`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: raw`(sa, b), (sa, a + b)`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(sa, a + b), (b + sa, a + b)`, color: desmosBlue, points: false, lines: true, secret: true },
					{ latex: raw`(b + sa, a + b), (sa, b)`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: raw`((1 - s)b, (1 - s)a + b), (a + (1 - s)b, (1 - s)a + b)`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(a + (1 - s)b, (1 - s)a + b), (a + (1 - s)b, (1 - s)a)`, color: desmosBlue, points: false, lines: true, secret: true },
					{ latex: raw`(a + (1 - s)b, (1 - s)a), ((1 - s)b, (1 - s)a + b)`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: raw`\polygon((0, b), (b, a + b), (a + b, a), (a, 0))`, color: desmosPurple, lineOpacity: raw`1 - s`, fillOpacity: raw`0.5(1 - s)`, secret: true },

					{ latex: raw`\polygon((0, b), (a, b), (a, a + b), (0, a + b))`, color: desmosRed, lineOpacity: raw`s`, fillOpacity: raw`0.5s`, secret: true },
					{ latex: raw`\polygon((a, 0), (a + b, 0), (a + b, b), (a, b))`, color: desmosBlue, lineOpacity: raw`s`, fillOpacity: raw`0.5s`, secret: true },

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
						color: desmosRed,
						secret: true,
						dragMode: "X"
					}),

					...getDesmosPoint({
						point: ["0", "b"],
						color: desmosBlue,
						secret: true,
						dragMode: "Y"
					}),

					{ latex: raw`c = \sqrt{a^2 + b^2}`, color: desmosPurple },

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
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`(-1, 0), (0, 3), (4, 0), (-1, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(0.5, -0.5), (0, -2), (-2, -0.5), (0.5, -0.5)`, color: desmosBlue, points: false, lines: true, secret: true },
				]
			},

			unitCircle:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true, showLabel: true },
					
					...getDesmosSlider({
						expression: "a = 30",
						min: 0,
						max: 360,
						step: 1,
						secret: false
					}),

					{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}