import {
	createDesmosGraphs,
	desmosBlue,
	desmosGreen,
	desmosPurple,
	desmosRed,
	getDesmosVector,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"vector-subtraction":
			{
				bounds: { left: -4, right: 4, bottom: -3, top: 5 },

				expressions:
				[
					...getDesmosVector({ from: [0, 0], to: [3, 2], color: desmosPurple }),
					...getDesmosVector({ from: [0, 0], to: [-2, 1], color: desmosBlue }),
					...getDesmosVector({ from: [-2, 1], to: [3, 2], color: desmosRed })
				]
			},

			"gram-schmidt":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosVector({ from: [0, 0], to: [3, 2], color: desmosPurple }),
					...getDesmosVector({ from: [0, 0], to: [-3, 1], color: desmosBlue }),

					...getDesmosVector({
						from: [0, 0],
						to: ["\\frac{-21}{13}", "\\frac{-14}{13}"],
						color: desmosRed
					}),

					...getDesmosVector({
						from: ["\\frac{-21}{13}", "\\frac{-14}{13}"],
						to: [-3, 1],
						color: desmosGreen
					}),
					...getDesmosVector({
						from: [0, 0],
						to: ["-3 - \\frac{-21}{13}", "1 - \\frac{-14}{13}"],
						color: desmosGreen
					}),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}