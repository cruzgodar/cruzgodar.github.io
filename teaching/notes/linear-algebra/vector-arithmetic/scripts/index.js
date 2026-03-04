import {
	createDesmosGraphs, desmosColors,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector
} from "/scripts/src/desmos.js";

export default function()
{
	createDesmosGraphs({
		planeVectors:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				...getDesmosSlider({ expression: "a = 1" }),
				...getDesmosSlider({ expression: "b = 2" }),
				...getDesmosPoint({ point: ["a", "b"], color: desmosColors.purple }),
				...getDesmosVector({ from: [0, 0], to: ["a", "b"], color: desmosColors.purple }),
			]
		},

		vectorAddition:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				...getDesmosSlider({ expression: "a = 2" }),
				...getDesmosSlider({ expression: "b = 1" }),
				...getDesmosSlider({ expression: "c = 2" }),
				...getDesmosSlider({ expression: "d = -2" }),

				...getDesmosPoint({ point: ["a", "b"], color: desmosColors.red }),
				...getDesmosPoint({ point: ["c", "d"], color: desmosColors.blue }),

				...getDesmosVector({ from: [0, 0], to: ["a", "b"], color: desmosColors.red }),
				...getDesmosVector({ from: [0, 0], to: ["c", "d"], color: desmosColors.blue }),
				
				...getDesmosVector({
					from: ["a", "b"],
					to: ["a + c", "b + d"],
					color: desmosColors.blue
				}),

				...getDesmosVector({
					from: ["c", "d"],
					to: ["a + c", "b + d"],
					color: desmosColors.red
				}),

				...getDesmosVector({
					from: [0, 0],
					to: ["a + c", "b + d"],
					color: desmosColors.purple
				}),
			]
		},
	});
}