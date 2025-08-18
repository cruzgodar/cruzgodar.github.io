import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlack3d,
	desmosBlue,
	desmosBlue3d,
	desmosGreen,
	desmosPurple,
	desmosPurple3d,
	desmosRed,
	desmosRed3d,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			extendTo3d:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`y = x`, color: desmosPurple3d },
					{ latex: raw`x = 0`, color: desmosBlue3d },
					{ latex: raw`y = \sin(x)`, color: desmosRed3d },
				]
			},

			extendTo3d2:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`y = x^2`, color: desmosPurple3d },
				]
			},

			distance:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`(x_1, y_1, z_1)`, color: desmosBlue3d },
					{ latex: raw`x_1 = 1` },
					{ latex: raw`y_1 = 2` },
					{ latex: raw`z_1 = 0` },
					{ latex: raw`(x_2, y_2, z_2)`, color: desmosRed3d },
					{ latex: raw`x_2 = -3` },
					{ latex: raw`y_2 = -1` },
					{ latex: raw`z_2 = 2` },

					{ latex: raw`(x_2, y_2, z_1)`, color: desmosPurple3d },

					{ latex: raw`(x_1, y_1, z_1), (x_2, y_2, 0), (x_2, y_2, z_2), (x_1, y_1, z_1)`, color: desmosBlack3d, points: false, lines: true, secret: true },
					
				]
			},

			sphereAndCylinder:
			{
				use3d: true,

				bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 + z^2 = 1`, color: desmosPurple3d },
					{ latex: raw`x^2 + y^2 = 1`, color: desmosBlue3d },
				]
			},

			vectors:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`x_0 = 0`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_0 = 0`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_1 = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_1 = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0", "y_0"],
						color: desmosRed,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosBlue,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosPurple,
					}),

					{ latex: raw`(x_0, y_0), (x_0 + x_1, y_0)`, color: desmosGreen, points: false, lines: true, lineStyle: "DASHED" },
					{ latex: raw`(x_0 + x_1, y_0), (x_0 + x_1, y_0 + y_1)`, color: desmosGreen, points: false, lines: true, lineStyle: "DASHED" },
				]
			},

			equalVectors:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					...getDesmosVector({
						from: ["0", "0"],
						to: ["0 + 1", "0 - 2"],
						color: desmosPurple,
					}),

					...getDesmosVector({
						from: ["1", "2"],
						to: ["1 + 1", "2 - 2"],
						color: desmosPurple,
					}),

					...getDesmosVector({
						from: ["-2", "4"],
						to: ["-2 + 1", "4 - 2"],
						color: desmosPurple,
					}),

					...getDesmosVector({
						from: ["-2", "0"],
						to: ["-2 + 1", "0 - 2"],
						color: desmosPurple,
					}),
				]
			},

			threeDVector:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`\vector((0, 0, 0), (1, -2, 3))`, color: desmosPurple3d },
				]
			},

			unitVectors2d:
			{
				bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5 },

				expressions:
				[
					{ latex: raw`r = 1`, color: desmosBlack, secret: true },

					...getDesmosVector({
						from: ["0", "0"],
						to: ["\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}"],
						color: desmosPurple,
					}),

					...getDesmosVector({
						from: ["0", "0"],
						to: ["\\frac{1}{2}", "-\\frac{\\sqrt{3}}{2}"],
						color: desmosPurple,
					}),
				]
			},

			unitVectors3d:
			{
				use3d: true,

				bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 + z^2 = 1`, color: desmosBlack3d, secret: true },

					{ latex: raw`(\frac{1}{2}, \frac{\sqrt{3}}{2}\cos(t), \frac{\sqrt{3}}{2}\sin(t))`, color: desmosPurple3d, secret: true, parametricDomain: { min: 0, max: 2 * Math.PI } },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}