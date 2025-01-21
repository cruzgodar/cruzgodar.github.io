import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
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
				bounds: { left: -4, right: 4, bottom: -4, top: 4 },

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
					{ latex: String.raw`(-3, 0), (-3 + \cos(\frac{\pi}{6}), 3 + \sin(\frac{\pi}{6})), (3, 0), (-3, 0)`, color: desmosPurple, points: false, lines: true, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}