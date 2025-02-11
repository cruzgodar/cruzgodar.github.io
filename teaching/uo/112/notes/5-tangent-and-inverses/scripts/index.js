import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGreen,
	desmosPurple,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			tanAsSlope:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				options: { degreeMode: true },

				expressions:
				[
					...getDesmosSlider({
						expression: "a = 45",
						min: 0,
						max: 360,
						step: 1,
						secret: false
					}),

					{ latex: raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: raw`(\cos(a), \sin(a))`, color: desmosPurple, points: true, secret: false },
					{ latex: raw`(0, 0), (\cos(a), \sin(a))`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: raw`\tan(a)` },
				]
			},

			slopedLine:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`y = \sqrt{3}x + 2`, color: desmosPurple, secret: true },
				]
			},

			tanReferenceTriangle:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },
				
				expressions:
				[
					{ latex: raw`a = 210`, secret: true, hidden: true },
					
					{ latex: raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: true, secret: true, showLabel: true },
					{ latex: raw`(0, 0), (\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(\cos(\frac{\pi}{180} a), \sin(\frac{\pi}{180} a)), (\cos(\frac{\pi}{180} a), 0)`, color: desmosBlue, points: false, lines: true, lineStyle: "DASHED", secret: true },
				]
			},

			tanGraph:
			{
				bounds: { left: -10, right: 370, bottom: -3, top: 3 },

				options: { degreeMode: true },
	
				expressions:
				[
					{ latex: raw`A = [ 0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360 ]` },

					{ latex: raw`(A, \tan(A))`, color: desmosPurple, points: true, lines: false },
					{ latex: raw`\tan(x)`, color: desmosPurple },
				]
			},

			tangentLines:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				options: { degreeMode: true },

				expressions:
				[
					...getDesmosSlider({
						expression: "a = 45",
						min: 0,
						max: 360,
						step: 1,
						secret: false
					}),

					{ latex: raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: raw`(\cos(a), \sin(a))`, color: desmosPurple, points: true, secret: false },

					{ latex: raw`(\sign(\cos(a)), \sign(\cos(a))\tan(a)), (\sign(\cos(a)), 0)`, color: desmosGreen, points: false, lines: true, secret: true },

					{ latex: raw`(0, 0), (\sign(\cos(a)), \sign(\cos(a))\tan(a))`, color: desmosPurple, points: true, lines: true, secret: true },

					{ latex: raw`\tan(a)` },
				]
			},

			sinRange:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				options: { degreeMode: true },

				expressions:
				[
					{ latex: raw`x^2 + y^2 = 1`, color: desmosBlack },
					{ latex: raw`x^2 + y^2 = 1 \left\{ x \geq 0 \right\}`, color: desmosPurple, secret: true, lineWidth: 10, lineOpacity: 0.75 },
				]
			},

			arcFunctionsTriangle:
			{
				bounds: { left: -1, right: 4, bottom: -1.75, top: 3.25 },

				options: { degreeMode: true },

				expressions:
				[
					{ latex: raw`(0, 0), (2\sqrt{3}, 2), (2\sqrt{3}, 0), (0, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}