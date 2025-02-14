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
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			lawOfCosines:
			{
				bounds: { left: -3, right: 3, bottom: -3, top: 3 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 = b^2`, color: desmosBlack, hidden: true },

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

					{ latex: raw`(0, 0), (a, 0)`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosBlue, points: false, lines: true, secret: true },

					{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, secret: true },

					{ latex: raw`(0.4\cos(0.5\gamma), 0.4\sin(0.5\gamma))`, color: desmosPurple, label: "γ", showLabel: true, hidden: true, secret: true },

					{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
					{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
					{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },
					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)) + (0.4\cos(a_3), 0.4\sin(a_3))`, color: desmosRed, label: "α", showLabel: true, hidden: true, secret: true },

					{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a)`, secret: true },
					{ latex: raw`(a, 0) + (0.35\cos(b_3), 0.35\sin(b_3))`, color: desmosBlue, label: "β", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(0.5a, -0.2)`, color: desmosRed, label: "a", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5b\cos(\gamma), 0.5b\sin(\gamma)) + (0.2\cos(b_3), 0.2\sin(b_3))`, color: desmosBlue, label: "b", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))`, color: desmosPurple, label: "c", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(a, 0), (a, b\sin(\gamma)), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, hidden: true, points: false, lines: true, lineStyle: "DASHED" },
				]
			},

			lawOfSines:
			{
				bounds: { left: -1, right: 3, bottom: -1, top: 3 },

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

					{ latex: raw`(0, 0), (a, 0)`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosPurple, points: false, lines: true, secret: true },
					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosBlue, points: false, lines: true, secret: true },

					{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, secret: true },

					{ latex: raw`(0.4\cos(0.5\gamma), 0.4\sin(0.5\gamma))`, color: desmosPurple, label: "γ", showLabel: true, hidden: true, secret: true },

					{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
					{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
					{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },
					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)) + (0.4\cos(a_3), 0.4\sin(a_3))`, color: desmosRed, label: "α", showLabel: true, hidden: true, secret: true },

					{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a)`, secret: true },
					{ latex: raw`(a, 0) + (0.35\cos(b_3), 0.35\sin(b_3))`, color: desmosBlue, label: "β", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(0.5a, -0.2)`, color: desmosRed, label: "a", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5b\cos(\gamma), 0.5b\sin(\gamma)) + (0.2\cos(b_3), 0.2\sin(b_3))`, color: desmosBlue, label: "b", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))`, color: desmosPurple, label: "c", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (b\cos(\gamma), 0)`, color: desmosBlack, points: false, lines: true, lineStyle: "DASHED" },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}