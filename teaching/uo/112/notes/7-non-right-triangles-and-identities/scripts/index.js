import {
	createDesmosGraphs,
	desmosBlack,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			lawOfCosines:
			{
				bounds: { left: -3, right: 3, bottom: -3, top: 3 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 = 4`, color: desmosBlack },

					...getDesmosSlider({
						expression: raw`\alpha = 1`,
						min: 0,
						max: raw`\pi`,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`\beta = 1`,
						min: 0,
						max: raw`\pi - \alpha`,
						secret: false,
					}),

					{ latex: raw`\gamma = \pi - \alpha - \beta` },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}