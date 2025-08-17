import {
	createDesmosGraphs,
	desmosBlack3d,
	desmosBlue3d,
	desmosPurple3d,
	desmosRed3d,
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
			}
		};

		return data;
	});

	createDesmosGraphs();
}