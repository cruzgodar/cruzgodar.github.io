import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
    createDesmosGraphs,
    desmosBlue,
    desmosPurple,
    setGetDesmosData
} from "/scripts/src/desmos.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"test-graph":
			{
				bounds: { left: -1, right: 3, bottom: -1, top: 3 },

				expressions:
				[
					{ latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: desmosPurple },
					{ latex: String.raw`a = 0` },
					{ latex: String.raw`b = 2` },

					{ latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},
			
			"linear-system":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`x + y = 1`, color: desmosPurple, secret: true },
					{ latex: String.raw`(a + 1)x + (a^2 + 1)y = 4a + 1`, color: desmosBlue, secret: true },
					{ latex: String.raw`a = 2`, sliderBounds: { min: -2, max: 2 } },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}