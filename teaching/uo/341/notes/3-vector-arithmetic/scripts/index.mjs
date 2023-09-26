import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"plane-vectors":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`(0, 0), (a, b)`, color: desmosPurple, lines: true, points: false, secret: true },
					{ latex: String.raw`(a, b)`, color: desmosPurple, dragMode: "XY" },
					{ latex: String.raw`a = 1`, secret: true },
					{ latex: String.raw`b = 2`, secret: true },
					{ latex: String.raw`s = \arctan(b, a)`, secret: true },
					{ latex: String.raw`(a, b), (a - .35\cos(s + .5), b - .35\sin(s + .5))`, color: desmosPurple, lines: true, points: false, secret: true },
					{ latex: String.raw`(a, b), (a - .35\cos(s - .5), b - .35\sin(s - .5))`, color: desmosPurple, lines: true, points: false, secret: true },
				]
			},

			"vector-addition":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`(0, 0), (a, b)`, color: desmosRed, lines: true, points: false, secret: true },
					{ latex: String.raw`(a, b)`, color: desmosRed, dragMode: "XY" },
					{ latex: String.raw`a = 2`, secret: true },
					{ latex: String.raw`b = 1`, secret: true },
					{ latex: String.raw`s = \arctan(b, a)`, secret: true },
					{ latex: String.raw`(a, b), (a - .35\cos(s + .5), b - .35\sin(s + .5))`, color: desmosRed, lines: true, points: false, secret: true },
					{ latex: String.raw`(a, b), (a - .35\cos(s - .5), b - .35\sin(s - .5))`, color: desmosRed, lines: true, points: false, secret: true },

					{ latex: String.raw`(c, d), (a + c, b + d)`, color: desmosRed, lines: true, points: false, secret: true },
					{ latex: String.raw`(a + c, b + d), (a + c - .35\cos(s + .5), b + d - .35\sin(s + .5))`, color: desmosRed, lines: true, points: false, secret: true },
					{ latex: String.raw`(a + c, b + d), (a + c - .35\cos(s - .5), b + d - .35\sin(s - .5))`, color: desmosRed, lines: true, points: false, secret: true },

					{ latex: String.raw`(0, 0), (c, d)`, color: desmosBlue, lines: true, points: false, secret: true },
					{ latex: String.raw`(c, d)`, color: desmosBlue, dragMode: "XY" },
					{ latex: String.raw`c = 2`, secret: true },
					{ latex: String.raw`d = -2`, secret: true },
					{ latex: String.raw`l = \arctan(d, c)`, secret: true },
					{ latex: String.raw`(c, d), (c - .35\cos(l + .5), d - .35\sin(l + .5))`, color: desmosBlue, lines: true, points: false, secret: true },
					{ latex: String.raw`(c, d), (c - .35\cos(l - .5), d - .35\sin(l - .5))`, color: desmosBlue, lines: true, points: false, secret: true },

					{ latex: String.raw`(a, b), (a + c, b + d)`, color: desmosBlue, lines: true, points: false, secret: true },
					{ latex: String.raw`(a + c, b + d), (a + c - .35\cos(l + .5), b + d - .35\sin(l + .5))`, color: desmosBlue, lines: true, points: false, secret: true },
					{ latex: String.raw`(a + c, b + d), (a + c - .35\cos(l - .5), b + d - .35\sin(l - .5))`, color: desmosBlue, lines: true, points: false, secret: true },

					{ latex: String.raw`(0, 0), (a + c, b + d)`, color: desmosPurple, lines: true, points: false, secret: true },
					{ latex: String.raw`m = \arctan(b + d, a + c)`, secret: true },
					{ latex: String.raw`(a + c, b + d), (a + c - .35\cos(m + .5), b + d - .35\sin(m + .5))`, color: desmosPurple, lines: true, points: false, secret: true },
					{ latex: String.raw`(a + c, b + d), (a + c - .35\cos(m - .5), b + d - .35\sin(m - .5))`, color: desmosPurple, lines: true, points: false, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}