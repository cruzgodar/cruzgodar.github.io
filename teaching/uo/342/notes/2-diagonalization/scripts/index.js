import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	getDesmosPoint,
	getDesmosSlider,
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
			"rotation-matrix":
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					...getDesmosVector({ from: [0, 0], to: ["a", "b"], color: desmosPurple }),
					...getDesmosVector({
						from: [0, 0],
						to: ["6a + 3b", "-3a + 6b"],
						color: desmosBlue,
					}),
					...getDesmosPoint({
						point: ["a", "b"],
						color: desmosPurple,
						dragMode: "XY"
					}),
					...getDesmosSlider({ expression: "a = 1" }),
					...getDesmosSlider({ expression: "b = 1" })
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}