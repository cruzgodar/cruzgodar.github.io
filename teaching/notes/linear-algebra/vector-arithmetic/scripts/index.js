import {
    createDesmosGraphs,
    desmosBlue,
    desmosPurple,
    desmosRed,
    getDesmosPoint,
    getDesmosSlider,
    getDesmosVector,
    setGetDesmosData
} from "/scripts/src/desmos.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			planeVectors:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({ expression: "a = 1" }),
					...getDesmosSlider({ expression: "b = 2" }),
					...getDesmosPoint({ point: ["a", "b"], color: desmosPurple }),
					...getDesmosVector({ from: [0, 0], to: ["a", "b"], color: desmosPurple }),
				]
			},

			vectorAddition:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({ expression: "a = 2" }),
					...getDesmosSlider({ expression: "b = 1" }),
					...getDesmosSlider({ expression: "c = 2" }),
					...getDesmosSlider({ expression: "d = -2" }),

					...getDesmosPoint({ point: ["a", "b"], color: desmosRed }),
					...getDesmosPoint({ point: ["c", "d"], color: desmosBlue }),

					...getDesmosVector({ from: [0, 0], to: ["a", "b"], color: desmosRed }),
					...getDesmosVector({ from: [0, 0], to: ["c", "d"], color: desmosBlue }),
					
					...getDesmosVector({
						from: ["a", "b"],
						to: ["a + c", "b + d"],
						color: desmosBlue
					}),

					...getDesmosVector({
						from: ["c", "d"],
						to: ["a + c", "b + d"],
						color: desmosRed
					}),

					...getDesmosVector({
						from: [0, 0],
						to: ["a + c", "b + d"],
						color: desmosPurple
					}),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}