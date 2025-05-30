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
			"1dLinearTransformation":
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

			"2dLinearTransformation":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({ expression: "a_{11} = 0", secret: false }),
					...getDesmosSlider({ expression: "a_{12} = 1", secret: false }),
					...getDesmosSlider({ expression: "a_{21} = -2", secret: false }),
					...getDesmosSlider({ expression: "a_{22} = 1", secret: false }),
					...getDesmosSlider({ expression: "x_1 = 2", secret: false }),
					...getDesmosSlider({ expression: "x_2 = 1", secret: false }),
					
					...getDesmosPoint({ point: ["a_{11}", "a_{21}"], color: desmosRed }),
					...getDesmosPoint({ point: ["a_{12}", "a_{22}"], color: desmosBlue }),
					...getDesmosPoint({ point: ["x_1", "x_2"], color: desmosPurple }),

					...getDesmosVector({ from: [0, 0], to: [1, 0], color: desmosRed }),
					...getDesmosVector({ from: [0, 0], to: [0, 1], color: desmosBlue }),
					...getDesmosVector({ from: [0, 0], to: ["x_1", "x_2"], color: desmosPurple }),

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
						to: ["a_{11}x_1 + a_{12}x_2", "a_{21}x_1 + a_{22}x_2"],
						color: desmosPurple
					}),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}