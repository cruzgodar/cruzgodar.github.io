import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector,
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
			vectors:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`x_0 = 0`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_0 = 0`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_1 = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_1 = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0", "y_0"],
						color: desmosRed,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosBlue,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosPurple,
					})
				]
			},



			vectorAddition:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`x_0 = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_0 = -1`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_1 = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_1 = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_2 = -3`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_2 = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0", "y_0"],
						color: desmosBlack,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosBlue,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
						color: desmosRed,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosBlue,
					}),

					...getDesmosVector({
						from: ["x_0 + x_1", "y_0 + y_1"],
						to: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
						color: desmosRed,
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_2", "y_0 + y_2"],
						color: desmosRed,
						lineStyle: "DASHED",
					}),

					...getDesmosVector({
						from: ["x_0 + x_2", "y_0 + y_2"],
						to: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
						color: desmosBlue,
						lineStyle: "DASHED",
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
						color: desmosPurple,
					}),
				]
			},

			vectorArithmeticExercise:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosVector({
						from: ["1", "0"],
						to: ["2", "-2"],
						color: desmosPurple,
					}),

					...getDesmosVector({
						from: ["0", "-1"],
						to: ["-1", "0"],
						color: desmosBlue,
					}),
				]
			},

			componentVectors:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`A = [ 0, ..., \floor(\abs(a))\sign(a) ]` },
					...getDesmosSlider({
						expression: raw`a = 3`,
						min: -5,
						max: 5,
						secret: false,
					}),

					{ latex: raw`B = [ 0, ..., \floor(\abs(b))\sign(b) ]` },
					
					...getDesmosSlider({
						expression: raw`b = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosPoint({
						point: ["a", "b"],
						color: desmosBlack,
						dragMode: "XY",
						secret: false,
					}),

					...(Array(5).fill().map((_, i) => getDesmosVector({
						from: [`A[${i + 1}]`, "0"],
						to: [`A[${i + 2}]`, "0"],
						color: desmosRed,
						secret: false
					})).flat()),

					...(Array(5).fill().map((_, i) => getDesmosVector({
						from: ["a", `B[${i + 1}]`],
						to: ["a", `B[${i + 2}]`],
						color: desmosBlue,
						secret: false
					})).flat()),

					...getDesmosVector({
						from: [raw`\floor(\abs(a))\sign(a)`, "0"],
						to: [raw`a + 0.00001\sign(a)`, "0"],
						color: desmosRed,
					}),

					...getDesmosVector({
						from: ["a", raw`\floor(\abs(b))\sign(b)`],
						to: ["a", raw`b + 0.00001\sign(b)`],
						color: desmosBlue,
					}),

					...getDesmosVector({
						from: ["0", "0"],
						to: ["a", "b"],
						color: desmosPurple,
					}),
				]
			},

			dotProductMotivation:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`x_0 = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_0 = -1`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_1 = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_1 = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_2 = -3`,
						min: -5,
						max: 5,
						secret: false,
					}),
					
					...getDesmosSlider({
						expression: raw`y_2 = 2`,
						min: -5,
						max: 5,
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0", "y_0"],
						color: desmosBlack,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosBlue,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosPoint({
						point: ["x_0 + x_2", "y_0 + y_2"],
						color: desmosRed,
						dragMode: "XY",
						secret: false,
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_1", "y_0 + y_1"],
						color: desmosBlue,
					}),

					...getDesmosVector({
						from: ["x_0", "y_0"],
						to: ["x_0 + x_2", "y_0 + y_2"],
						color: desmosRed,
					}),

					...getDesmosVector({
						from: ["x_0 + x_1", "y_0 + y_1"],
						to: ["x_0 + x_2", "y_0 + y_2"],
						color: desmosPurple,
					}),
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}