import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			diagonalTriangle:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: String.raw`a = 45`, secret: true, hidden: true },
					
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true, showLabel: true },

					{ latex: String.raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },
				]
			},

			referenceTriangle:
			{
				bounds: { left: -3, right: 3, bottom: -3, top: 3 },

				expressions:
				[
					{ latex: String.raw`a = 30`, secret: true, hidden: true },
					
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true, showLabel: true },
					{ latex: String.raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },

					{ latex: String.raw`(0, 0), (3 \cos(\frac{\pi}{180} a), 3 \sin(\frac{\pi}{180} a)), (3 \cos(\frac{\pi}{180} a), 0), (0, 0)`, color: desmosRed, points: false, lines: true, secret: true },
				]
			},

			upsideDownTriangle:
			{
				bounds: { left: -4, right: 4, bottom: -3, top: 5 },

				expressions:
				[
					{ latex: String.raw`(-3, 0), (3\cos(\frac{2\pi}{3}), 3\sin(\frac{2\pi}{3})), (3, 0), (-3, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
				]
			},

			scaledUpReferenceTriangle:
			{
				bounds: { left: -3, right: 3, bottom: -3, top: 3 },

				expressions:
				[
					{ latex: String.raw`a = 30`, secret: true, hidden: true },

					{ latex: String.raw`r = 0.25 \left\{ 0 \leq \theta \leq \frac{\pi}{180} a \right\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`(.5 \cos(\frac{\pi}{360} a), .5 \sin(\frac{\pi}{360} a))`, color: desmosPurple, label: "θ", showLabel: true, labelSize: "large", hidden: true, secret: true },
					
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },

					{ latex: String.raw`(0, 0), (3 \cos(\frac{\pi}{180} a), 3 \sin(\frac{\pi}{180} a)), (3 \cos(\frac{\pi}{180} a), 0), (0, 0)`, color: desmosRed, points: false, lines: true, secret: true },
				]
			},

			upsideDownTriangle2:
			{
				bounds: { left: -4, right: 4, bottom: -3, top: 5 },

				expressions:
				[
					{ latex: String.raw`(-3, 0), (3\cos(\frac{2\pi}{3}), 3\sin(\frac{2\pi}{3})), (3, 0), (-3, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
				]
			},

			referenceTriangle2:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },
	
				expressions:
				[
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true },
					
					{ latex: String.raw`a = 150`, secret: true, hidden: true },

					{ latex: String.raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },
				]
			},

			sineAndCosine:
			{
				bounds: { left: -10, right: 370, bottom: -1.5, top: 1.5 },

				options: { degreeMode: true },
	
				expressions:
				[
					{ latex: String.raw`A = [ 0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360 ]` },

					{ latex: String.raw`(A, \sin(A))`, color: desmosPurple, points: true, lines: false },
					{ latex: String.raw`(A, \cos(A))`, color: desmosBlue, points: true, lines: false },

					{ latex: String.raw`\sin(x)\left\{ 0 \leq x \leq 360 \right\}`, color: desmosPurple, points: true, lines: false, hidden: true },
					{ latex: String.raw`\cos(x)\left\{ 0 \leq x \leq 360 \right\}`, color: desmosBlue, points: true, lines: false, hidden: true },
				]
			},

			bigAngles:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true, showLabel: true },
					
					...getDesmosSlider({
						expression: "a = 30",
						min: -360,
						max: 360 * 3,
						step: 1,
						secret: false
					}),

					{ latex: String.raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },

					{ latex: String.raw`r = 0.3 + 0.02\theta \left\{ 0 \leq \theta \leq \frac{\pi}{180} a \right\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`r = 0.3 - 0.02\theta \left\{ 2\pi + \frac{\pi}{180} a \leq \theta \leq 2\pi \right\}`, color: desmosPurple, secret: true },
				]
			},

			sineAndCosineComplete:
			{
				bounds: { left: -360 * 1.25, right: 360 * 1.25, bottom: -1.5, top: 1.5 },

				options: { degreeMode: true },
	
				expressions:
				[
					{ latex: String.raw`\sin(x)`, color: desmosPurple },
					{ latex: String.raw`\cos(x)`, color: desmosBlue },
				]
			},

			sinusoidalFunction:
			{
				bounds: { left: -360 * 1.25, right: 360 * 1.25, bottom: -2.5, top: 2.5 },

				options: { degreeMode: true },
	
				expressions:
				[
					{ latex: String.raw`A\sin(B(x - h)) + k`, color: desmosPurple },
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
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}