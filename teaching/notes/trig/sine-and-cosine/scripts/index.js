import {
	createDesmosGraphs, desmosColors,
	desmosLineStyles,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		diagonalTriangle:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`a = 45`, secret: true, hidden: true },
				
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: true, secret: true, showLabel: true },

				{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosColors.blue, points: false, lines: true, lineStyle: desmosLineStyles.DASHED, secret: true },
			]
		},

		referenceTriangle:
		{
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

			expressions:
			[
				{ latex: raw`a = 30`, secret: true, hidden: true },
				
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: true, secret: true, showLabel: true },
				{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosColors.blue, points: false, lines: true, lineStyle: desmosLineStyles.DASHED, secret: true },

				{ latex: raw`(0, 0), (3 \cos(\frac{\pi}{180} a), 3 \sin(\frac{\pi}{180} a)), (3 \cos(\frac{\pi}{180} a), 0), (0, 0)`, color: desmosColors.red, points: false, lines: true, secret: true },
			]
		},

		upsideDownTriangle:
		{
			bounds: { xmin: -4, xmax: 4, ymin: -3, ymax: 5 },

			expressions:
			[
				{ latex: raw`(-3, 0), (3\cos(\frac{2\pi}{3}), 3\sin(\frac{2\pi}{3})), (3, 0), (-3, 0)`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`(-2.5, 0.3)`, color: desmosColors.black, points: false, hidden: true, showLabel: true, label: "θ", labelSize: "2", secret: true },

				{ latex: raw`(1.8, 0.35)`, color: desmosColors.black, points: false, hidden: true, showLabel: true, label: "φ", labelSize: "2", secret: true },
			]
		},

		scaledUpReferenceTriangle:
		{
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

			expressions:
			[
				{ latex: raw`a = 30`, secret: true, hidden: true },

				{ latex: raw`r = 0.25 \left\{ 0 \leq \theta \leq \frac{\pi}{180} a \right\}`, color: desmosColors.purple, secret: true },
				{ latex: raw`(.5 \cos(\frac{\pi}{360} a), .5 \sin(\frac{\pi}{360} a))`, color: desmosColors.purple, label: "θ", showLabel: true, labelSize: "large", hidden: true, secret: true },
				
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: true, secret: true },
				{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosColors.blue, points: false, lines: true, lineStyle: desmosLineStyles.DASHED, secret: true },

				{ latex: raw`(0, 0), (3 \cos(\frac{\pi}{180} a), 3 \sin(\frac{\pi}{180} a)), (3 \cos(\frac{\pi}{180} a), 0), (0, 0)`, color: desmosColors.red, points: false, lines: true, secret: true },
			]
		},

		upsideDownTriangle2:
		{
			bounds: { xmin: -4, xmax: 4, ymin: -3, ymax: 5 },

			expressions:
			[
				{ latex: raw`(-3, 0), (3\cos(\frac{2\pi}{3}), 3\sin(\frac{2\pi}{3})), (3, 0), (-3, 0)`, color: desmosColors.purple, points: false, lines: true, secret: true },
			]
		},

		referenceTriangle2:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: true, secret: true },
				
				{ latex: raw`a = 150`, secret: true, hidden: true },

				{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosColors.blue, points: false, lines: true, lineStyle: desmosLineStyles.DASHED, secret: true },
			]
		},

		sineAndCosine:
		{
			bounds: { xmin: -10, xmax: 370, ymin: -1.5, ymax: 1.5 },

			options: { degreeMode: true },

			expressions:
			[
				{ latex: raw`A = [ 0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360 ]` },

				{ latex: raw`(A, \sin(A))`, color: desmosColors.purple, points: true, lines: false },
				{ latex: raw`(A, \cos(A))`, color: desmosColors.blue, points: true, lines: false },

				{ latex: raw`\sin(x)\left\{ 0 \leq x \leq 360 \right\}`, color: desmosColors.purple, points: true, lines: false, hidden: true },
				{ latex: raw`\cos(x)\left\{ 0 \leq x \leq 360 \right\}`, color: desmosColors.blue, points: true, lines: false, hidden: true },
			]
		},

		bigAngles:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.black },

				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: true, secret: true, showLabel: true },
				
				...getDesmosSlider({
					expression: "a = 30",
					min: -360,
					max: 360 * 3,
					step: 1,
					secret: false
				}),

				{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosColors.purple, points: false, lines: true, secret: true },
				{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosColors.blue, points: false, lines: true, lineStyle: desmosLineStyles.DASHED, secret: true },

				{ latex: raw`r = 0.3 + 0.02\theta \left\{ 0 \leq \theta \leq \frac{\pi}{180} a \right\}`, color: desmosColors.purple, secret: true },
				{ latex: raw`r = 0.3 - 0.02\theta \left\{ 2\pi + \frac{\pi}{180} a \leq \theta \leq 2\pi \right\}`, color: desmosColors.purple, secret: true },
			]
		},

		sineAndCosineComplete:
		{
			bounds: { xmin: -360 * 1.25, xmax: 360 * 1.25, ymin: -1.5, ymax: 1.5 },

			options: { degreeMode: true },

			expressions:
			[
				{ latex: raw`\sin(x)`, color: desmosColors.purple },
				{ latex: raw`\cos(x)`, color: desmosColors.blue },
			]
		},

		sinusoidalFunction:
		{
			bounds: { xmin: -360 * 1.25, xmax: 360 * 1.25, ymin: -2.5, ymax: 2.5 },

			options: { degreeMode: true },

			expressions:
			[
				{ latex: raw`A\sin(B(x - h)) + k`, color: desmosColors.purple },
				...getDesmosSlider({
					expression: "A = 1",
					min: -2,
					max: 2,
					secret: false
				}),
				...getDesmosSlider({
					expression: "B = 1",
					min: 0,
					max: 2,
					secret: false
				}),
				...getDesmosSlider({
					expression: "h = 0",
					min: -360,
					max: 360,
					secret: false
				}),
				...getDesmosSlider({
					expression: "k = 0",
					min: -2,
					max: 2,
					secret: false
				}),
			]
		}
	});
}