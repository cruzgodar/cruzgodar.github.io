import {
    createDesmosGraphs,
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
			determinantScaling:
			{
				bounds: { xmin: -8, xmax: 8, ymin: -10, ymax: 6 },

				expressions:
				[
					{ latex: raw`x^2 + (y - 2)^2 \leq 1`, color: desmosPurple, secret: true },
					{ latex: raw`(2(x - 2) + (y + 4))^2 + (3(x - 2) - (y + 4))^2 \leq 25`, color: desmosBlue, secret: true }
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}