import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGreen,
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
			radiusWrap:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					{ latex: String.raw`a = [0, 1, 2, 3, 4, 5, 6]`, color: desmosPurple, points: true, secret: false },
					{ latex: String.raw`(0, 0), (\cos(0), \sin(0))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(1), \sin(1))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(2), \sin(2))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(3), \sin(3))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(4), \sin(4))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(5), \sin(5))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: String.raw`(0, 0), (\cos(6), \sin(6))`, color: desmosPurple, points: false, lines: true, secret: true },

					{ latex: String.raw`r \leq 1 \left\{ 0 \leq \theta \leq 1 \right\}`, color: desmosPurple,  secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 1 \leq \theta \leq 2 \right\}`, color: desmosBlue,  secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 2 \leq \theta \leq 3 \right\}`, color: desmosRed,  secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 3 \leq \theta \leq 4 \right\}`, color: desmosPurple,  secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 4 \leq \theta \leq 5 \right\}`, color: desmosBlue,  secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 5 \leq \theta \leq 6 \right\}`, color: desmosRed,  secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 6 \leq \theta \leq 2\pi \right\}`, color: desmosGreen,  secret: true },

					{ latex: String.raw`(\cos(a), \sin(a))`, color: desmosPurple, points: true, secret: false },
				]
			},

			arcLengthEtc:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: String.raw`x^2 + y^2 = 1`, color: desmosBlack },

					...getDesmosSlider({
						expression: String.raw`a = 1`,
						min: 0,
						max: String.raw`2\pi`,
						secret: false,
					}),

					{ latex: String.raw`(1, 0), (0, 0), (\cos(a), \sin(a))`, color: desmosBlack, points: true, lines: true, secret: true },
					{ latex: String.raw`r \leq 1 \left\{ 0 \leq \theta \leq a \right\}`, color: desmosBlue, points: false, lines: true, secret: true },
					{ latex: String.raw`r = 1 \left\{ 0 \leq \theta \leq a \right\}`, color: desmosPurple, points: false, lines: true, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}