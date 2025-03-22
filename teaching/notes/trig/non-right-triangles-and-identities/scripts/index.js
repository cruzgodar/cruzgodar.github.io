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
			},

			lawOfSines2:
			{
				bounds: { left: -1, right: 2, bottom: -0.5, top: 2.5 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`\gamma = 1.645`,
						min: 0,
						max: raw`\pi`,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`a = 1`,
						min: 0,
						max: 3,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`b = 2`,
						min: 0,
						max: 3,
						secret: false,
					}),

					{ latex: raw`c = \sqrt{a^2 + b^2 - 2ab\cos(\gamma)}`, secret: false },

					{ latex: raw`(0, 0), (a, 0)`, color: desmosBlack, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, points: false, lines: true, secret: true },
					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosBlack, points: false, lines: true, secret: true },

					{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, secret: true },

					{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
					{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
					{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },

					{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a) + 0.2`, secret: false },
					{ latex: raw`(a, 0) + (0.35\cos(b_3), 0.35\sin(b_3))`, color: desmosBlack, label: "π/3", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(0.5a, -0.2)`, color: desmosBlack, label: "1", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5b\cos(\gamma), 0.5b\sin(\gamma)) + (0.2\cos(b_3), 0.2\sin(b_3))`, color: desmosBlack, label: "2", showLabel: true, hidden: true, secret: true },
				]
			},

			lawOfSines3:
			{
				bounds: {
					left: -0.25,
					right: Math.sqrt(3) + 0.25,
					bottom: -(Math.sqrt(3) / 2 + 0.25) + 0.5,
					top: (Math.sqrt(3) / 2 + 0.25) + 0.5
				},

				expressions:
				[
					...getDesmosSlider({
						expression: raw`\gamma = \frac{\pi}{6}`,
						min: 0,
						max: raw`\pi`,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`a = \sqrt{3}`,
						min: 0,
						max: 3,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`b = 2`,
						min: 0,
						max: 3,
						secret: false,
					}),

					{ latex: raw`(0, 0), (a, 0)`, color: desmosBlack, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, points: false, lines: true, secret: true },
					{ latex: raw`(b\cos(\gamma), b\sin(\gamma)), (0, 0)`, color: desmosBlack, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma)) \left\{ b < 0.95 \right\}`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma)) \left\{ 1.05 < b < 1.95 \right\}`, color: desmosRed, points: false, lines: true, secret: true },
					{ latex: raw`(a, 0), (b\cos(\gamma), b\sin(\gamma)) \left\{ 2.05 < b \right\}`, color: desmosRed, points: false, lines: true, secret: true },

					{ latex: raw`(0, 0), (a, 0), (b\cos(\gamma), b\sin(\gamma))`, color: desmosBlack, secret: true },

					{ latex: raw`a_1 = \arctan(-b\sin(\gamma), -b\cos(\gamma))`, secret: true },
					{ latex: raw`a_2 = \arctan(-b\sin(\gamma), a - b\cos(\gamma))`, secret: true },
					{ latex: raw`a_3 = \frac{a_1 + a_2}{2}`, secret: true },

					{ latex: raw`b_3 = \arctan(0.5b\sin(\gamma), 0.5b\cos(\gamma) - a) + 0.2`, secret: true },

					{ latex: raw`(0.4\cos(0.5\gamma), 0.4\sin(0.5\gamma))`, color: desmosBlack, label: "π/6", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5a, -0.2)`, color: desmosBlack, label: "√3", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))\left\{0.95 \leq b \leq 1.05 \right\}`, color: desmosBlack, label: "1", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.5b\cos(\gamma) + 0.5a, 0.5b\sin(\gamma)) + (0.2\cos(0.5\gamma), 0.2\sin(0.5\gamma))\left\{1.95 \leq b \leq 2.05 \right\}`, color: desmosBlack, label: "1", showLabel: true, hidden: true, secret: true },
				]
			},

			cotangent:
			{
				bounds: {
					left: - 0.5 * Math.PI - 0.5,
					right: 1.5 * Math.PI + 0.5,
					bottom: - Math.PI - 0.5,
					top: Math.PI + 0.5
				},
	
				expressions:
				[
					{ latex: raw`\cot(x)`, color: desmosPurple },
				]
			},

			cosecant:
			{
				bounds: {
					left: -Math.PI - 0.5,
					right: 3 * Math.PI + 0.5,
					bottom: - 2 * Math.PI - 0.5,
					top: 2 * Math.PI + 0.5
				},
	
				expressions:
				[
					{ latex: raw`\csc(x)`, color: desmosPurple },
					{ latex: raw`\sin(x)`, color: desmosBlue },

					{ latex: raw`\sec(x)`, color: desmosPurple, hidden: true },
					{ latex: raw`\cos(x)`, color: desmosBlue, hidden: true },
				]
			},

			sumFormulas:
			{
				bounds: { left: -0.25, right: 1.25, bottom: -0.25, top: 1.25 },
	
				expressions:
				[
					...getDesmosSlider({
						expression: raw`\alpha = 0.5`,
						min: 0,
						max: raw`\frac{\pi}{2}`,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`\beta = 0.5`,
						min: 0,
						max: raw`\frac{\pi}{2} - \alpha`,
						secret: false,
					}),

					{ latex: raw`x^2 + y^2 = 1 \left\{ x \geq 0 \right\} \left\{ y \geq 0 \right\}`, color: desmosBlack, secret: true },

					{ latex: raw`\polygon((0, 0), (\cos(\alpha)\cos(\beta), 0), (\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)), (0, 0))`, color: desmosPurple, lines: true, fill: true, fillOpacity: 0.25, secret: true },

					{ latex: raw`\polygon((0, 0), (\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)), (\cos(\alpha + \beta), \sin(\alpha + \beta)), (0, 0))`, color: desmosBlue, lines: true, fill: true, fillOpacity: 0.25, secret: true },

					{ latex: raw`\polygon((\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)), (\cos(\alpha)\cos(\beta), \sin(\alpha + \beta)), (\cos(\alpha + \beta), \sin(\alpha + \beta)), (\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)))`, color: desmosRed, lines: true, fill: true, fillOpacity: 0.25, secret: true },

					{ latex: raw`(0, 0), (\cos(\alpha + \beta), \sin(\alpha + \beta)), (\cos(\alpha + \beta), 0), (0, 0)`, color: desmosGreen, points: false, lines: true, secret: true },

					{ latex: raw`(0.2\cos(0.5\alpha), 0.2\sin(0.5\alpha))`, color: desmosPurple, label: "α", showLabel: true, hidden: true, secret: true },
					{ latex: raw`(0.2\cos(0.5\beta + \alpha), 0.2\sin(0.5\beta + \alpha))`, color: desmosBlue, label: "β", showLabel: true, hidden: true, secret: true },

					{ latex: raw`(\cos(\alpha)\cos(\beta), \sin(\alpha)\cos(\beta)) + (0.15\cos(\frac{\pi}{2} + 0.5\alpha), 0.15\sin(\frac{\pi}{2} + 0.5\alpha))`, color: desmosRed, label: "α", showLabel: true, hidden: true, secret: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}