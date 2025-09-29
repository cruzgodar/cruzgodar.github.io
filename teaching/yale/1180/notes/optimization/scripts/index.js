import {
	createDesmosGraphs,
	desmosBlue3d,
	desmosPurple3d,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			saddlePoint:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`f(x, y) = x^2 - y^2`, color: desmosPurple3d },
				]
			},

			secretSaddle:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -50, zmax: 50 },

				expressions:
				[
					{ latex: raw`f(x, y) = x^2 + y^2 - 3xy`, color: desmosPurple3d },

					{ latex: raw`(t, 0, f(t, 0))`, parametricDomain: { min: -5, max: 5 }, color: desmosBlue3d, secret: true },
					{ latex: raw`(0, t, f(0, t))`, parametricDomain: { min: -5, max: 5 }, color: desmosBlue3d, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}