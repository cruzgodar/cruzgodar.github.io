import {
	createDesmosGraphs,
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
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -1, zmax: 1 },

				expressions:
				[
					{ latex: raw`f(x, y) = x^3 + y^3`, color: desmosPurple3d },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}