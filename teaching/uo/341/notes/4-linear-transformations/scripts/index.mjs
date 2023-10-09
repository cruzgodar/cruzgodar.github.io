import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector,
	setGetDesmosData
} from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"1d-linear-transformation":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({ expression: "a = 2", secret: false }),
					...getDesmosPoint({ point: ["a", 0], dragMode: "X", color: desmosRed }),
					...getDesmosVector({ from: [0, 0], to: ["a", "0"], color: desmosBlue }),
					...getDesmosVector({ from: [0, 0], to: [1, 0], color: desmosPurple }),
				]
			},

			"2d-linear-transformation":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({ expression: "a_{11} = 0", secret: false }),
					...getDesmosSlider({ expression: "a_{12} = 1", secret: false }),
					...getDesmosSlider({ expression: "a_{21} = -2", secret: false }),
					...getDesmosSlider({ expression: "a_{22} = 1", secret: false }),
					...getDesmosSlider({ expression: "b = 2", secret: false }),
					...getDesmosSlider({ expression: "c = 1", secret: false }),
					
					...getDesmosPoint({ point: ["a_{11}", "a_{21}"], color: desmosRed }),
					...getDesmosPoint({ point: ["a_{12}", "a_{22}"], color: desmosBlue }),
					...getDesmosPoint({ point: ["b", "c"], color: desmosPurple }),

					...getDesmosVector({ from: [0, 0], to: [1, 0], color: desmosRed }),
					...getDesmosVector({ from: [0, 0], to: [0, 1], color: desmosBlue }),
					...getDesmosVector({ from: [0, 0], to: ["b", "c"], color: desmosPurple }),

					...getDesmosVector({
						from: [0, 0],
						to: ["a_{11}", "a_{21}"],
						color: desmosRed
					}),

					...getDesmosVector({
						from: [0, 0],
						to: ["a_{12}", "a_{22}"],
						color: desmosBlue
					}),

					...getDesmosVector({
						from: [0, 0],
						to: ["a_{11}b + a_{12}c", "a_{21}b + a_{22}c"],
						color: desmosPurple
					}),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}