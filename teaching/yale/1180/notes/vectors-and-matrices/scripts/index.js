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
			testGraph:
			{
				bounds: { xmin: -1, xmax: 3, ymin: -1, ymax: 3 },

				expressions:
				[
					{ latex: raw`f(x) = x^3 - 2x^2 + 2`, color: desmosPurple },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 2` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},
			
			linearSystem:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`x + y = 1`, color: desmosPurple, secret: true },
					{ latex: raw`(a + 1)x + (a^2 + 1)y = 4a + 1`, color: desmosBlue, secret: true },
					{ latex: raw`a = 2`, sliderBounds: { min: -2, max: 2 } },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}