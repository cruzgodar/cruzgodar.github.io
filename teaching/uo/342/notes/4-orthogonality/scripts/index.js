import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosVector,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";

export function load()
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
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}