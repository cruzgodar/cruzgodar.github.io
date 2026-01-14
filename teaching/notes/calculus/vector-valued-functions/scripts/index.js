import {
	createDesmosGraphs,
	desmosBlue3d,
	desmosPurple3d,
	desmosRed3d,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			helix:
			{
				use3d: true,

				bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -3.5, zmax: 3.5 },

				expressions:
				[
					{ latex: raw`(\cos(t), \sin(t), 1)`, color: desmosPurple3d, parametricDomain: { min: -5, max: 5 } },
					{ latex: raw`v = \vector((0, 0, 0), (\cos(s), \sin(s), 1))`, color: desmosBlue3d, hidden: true, secret: true, },
					{ latex: raw`v`, color: desmosBlue3d, },
					{ latex: raw`(\cos(t), \sin(t), t)`, color: desmosPurple3d, parametricDomain: { min: -5, max: 5 }, hidden: true },
					{ latex: raw`w = \vector((0, 0, 0), (\cos(s), \sin(s), s))`, color: desmosBlue3d, hidden: true, secret: true, },
					{ latex: raw`w`, color: desmosBlue3d, hidden: true },
					...getDesmosSlider({
						expression: raw`s = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
				]
			},

			arcLength:
			{
				use3d: true,

				bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 100 },

				expressions:
				[
					{ latex: raw`(\cos(t), \sin(t), t^{3/2})`, color: desmosPurple3d, parametricDomain: { min: 0, max: 100 } },
					{ latex: raw`\vector((0, 0, 0), (\cos(s), \sin(s), s^{3/2}))`, color: desmosBlue3d, secret: true, },
					{ latex: raw`\vector((\cos(s), \sin(s), s^{3/2}), (\cos(s), \sin(s), s^{3/2}) + (-\sin(s), \cos(s), \frac{3}{2}s^{1/2}))`, color: desmosRed3d, secret: true, },
					...getDesmosSlider({
						expression: raw`s = 1`,
						min: 0,
						max: 20,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`a = 1`,
						min: 1,
						max: 40,
						secret: false,
					}),

					{ latex: raw`A = [0, \frac{20}{a}, ..., 20]`, secret: true, },

					{ latex: raw`(\cos(A), \sin(A), A^{3/2})`, points: true, lines: true, color: desmosRed3d, hidden: true, },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}