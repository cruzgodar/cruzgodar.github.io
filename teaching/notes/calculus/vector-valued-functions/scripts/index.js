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

			slicedSphere:
			{
				use3d: true,

				bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4, zmin: -4, zmax: 4 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 + z^2 = 9`, color: desmosPurple3d },
					{ latex: raw`z = x + 4`, color: desmosBlue3d },
					{ latex: raw`x^2 + y^2 + z^2 = 9 \left\{ z = x + 4 \right\}`, color: desmosRed3d },
				]
			},

			arcLength:
			{
				use3d: true,

				bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 150 },

				expressions:
				[
					{ latex: raw`X(t) = \cos(t)`, hidden: true },
					{ latex: raw`Y(t) = \sin(t)`, hidden: true },
					{ latex: raw`Z(t) = \frac{2}{3}t^{3/2}`, hidden: true },
					{ latex: raw`l(t) = (X(t), Y(t), Z(t))`, color: desmosPurple3d, parametricDomain: { min: 0, max: "b" }, lineWidth: 2 },
					{ latex: raw`l(t)`, color: desmosPurple3d, parametricDomain: { min: 0, max: "b" }, lineWidth: 2 },
					...getDesmosSlider({
						expression: raw`b = 35`,
						min: 0,
						max: 35,
						secret: false,
					}),

					{ latex: raw`\vector((0, 0, 0), l(s))`, color: desmosBlue3d, lineWidth: 2, secret: true },

					...getDesmosSlider({
						expression: raw`s = 1`,
						min: 0,
						max: "b",
						secret: false,
					}),
					
					{ latex: raw`d(t) = (X'(t), Y'(t), Z'(t))` },

					{ latex: raw`\vector(l(s), l(s) + d(s))`, color: desmosRed3d, lineWidth: 2, secret: true },

					{ latex: raw`l(A)`, points: true, color: desmosRed3d, hidden: true, },
					
					{ latex: raw`(X(A) + tX'(A), Y(A) + tY'(A), Z(A) + tZ'(A))`, color: desmosRed3d, parametricDomain: { min: raw`-\frac{b}{2a}`, max: raw`\frac{b}{2a}` }, hidden: true, lineWidth: 2 },

					...getDesmosSlider({
						expression: raw`n = 2`,
						min: 2,
						max: "b",
						secret: false,
					}),

					{ latex: raw`a = n - 1`, secret: true, },

					{ latex: raw`A = [0, \frac{b}{a}, ..., b]`, secret: true, },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}