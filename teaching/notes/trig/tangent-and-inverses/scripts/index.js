import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosOrange,
	desmosPurple,
	getDesmosSlider,
	setDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setDesmosData({
		tanAsSlope:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

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
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`y = \sqrt{3}x + 2`, color: desmosPurple, secret: true },
			]
		},

		tanReferenceTriangle:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },
			
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
			bounds: { xmin: -10, xmax: 370, ymin: -3, ymax: 3 },

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
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

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

				{ latex: raw`(\sign(\cos(a)), \sign(\cos(a))\tan(a)), (\sign(\cos(a)), 0)`, color: desmosOrange, points: false, lines: true, secret: true },

				{ latex: raw`(0, 0), (\sign(\cos(a)), \sign(\cos(a))\tan(a))`, color: desmosPurple, points: true, lines: true, secret: true },

				{ latex: raw`\tan(a)` },
			]
		},

		sinRange:
		{
			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

			options: { degreeMode: true },

			expressions:
			[
				{ latex: raw`x^2 + y^2 = 1`, color: desmosBlack },
				{ latex: raw`x^2 + y^2 = 1 \left\{ x \geq 0 \right\}`, color: desmosPurple, secret: true, lineWidth: 10, lineOpacity: 0.75 },
			]
		},

		arcFunctionsTriangle:
		{
			bounds: { xmin: -1, xmax: 4, ymin: -1.75, ymax: 3.25 },

			options: { degreeMode: true },

			expressions:
			[
				{ latex: raw`(0, 0), (2\sqrt{3}, 2), (2\sqrt{3}, 0), (0, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
			]
		},
	});

	createDesmosGraphs();
}