import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			walledGarden:
			{
				options: { showXAxis: false, showYAxis: false, showGrid: false },

				bounds: { left: -6, right: 6, bottom: -1, top: 11 },

				expressions:
				[
					{ latex: raw`y = 0`, color: desmosBlack, secret: true },
					{ latex: raw`b = 6.6667`, sliderBounds: { min: 0, max: 10 } },
					{ latex: raw`a = 20 - 2b`, secret: true },
					{ latex: raw`A = 20b - 2b^2` },
					{ latex: raw`(-\frac{a}{2}, b)`, color: desmosPurple, secret: true },
					{ latex: raw`(-\frac{a}{2}, 0), (-\frac{a}{2}, b), (\frac{a}{2}, b), (\frac{a}{2}, 0)`, points: false, lines: true, color: desmosPurple, secret: true },
				]
			},



			ellipse:
			{
				bounds: { left: -4, right: 4, bottom: -4, top: 4 },

				expressions:
				[
					{ latex: raw`\frac{x^2}{4} + \frac{y^2}{9} = 1`, color: desmosPurple, secret: true },
					{ latex: raw`a = 1`, sliderBounds: { min: 0, max: 2 } },
					{ latex: raw`A = 4a\sqrt{9(1 - \frac{a^2}{4})}` },
					{ latex: raw`b = \sqrt{9(1 - \frac{a^2}{4})}`, secret: true },
					{ latex: raw`(a, b)`, color: desmosBlue, secret: true },
					{ latex: raw`(a, b), (-a, b), (-a, -b), (a, -b), (a, b)`, points: false, lines: true, color: desmosBlue, secret: true },
				]
			},



			river:
			{
				options: { showGrid: false },

				bounds: { left: -50, right: 550, bottom: -250, top: 350 },

				expressions:
				[
					{ latex: raw`0 \leq y \leq 100`, color: desmosBlue, secret: true },
					{ latex: raw`a = 100`, sliderBounds: { min: 0, max: 500 } },
					{ latex: raw`(a, 0)`, color: desmosPurple, secret: true },
					{ latex: raw`(0, 0), (a, 0), (500, 100)`, points: false, lines: true, color: desmosPurple, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}