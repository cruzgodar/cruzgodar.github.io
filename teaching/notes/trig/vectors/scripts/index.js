import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	desmosLineStyles,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		vectors:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

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
					color: desmosColors.red,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosPoint({
					point: ["x_0 + x_1", "y_0 + y_1"],
					color: desmosColors.blue,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosVector({
					from: ["x_0", "y_0"],
					to: ["x_0 + x_1", "y_0 + y_1"],
					color: desmosColors.purple,
				})
			]
		},



		vectorAddition:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

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
					color: desmosColors.black,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosPoint({
					point: ["x_0 + x_1", "y_0 + y_1"],
					color: desmosColors.blue,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosPoint({
					point: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
					color: desmosColors.red,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosVector({
					from: ["x_0", "y_0"],
					to: ["x_0 + x_1", "y_0 + y_1"],
					color: desmosColors.blue,
				}),

				...getDesmosVector({
					from: ["x_0 + x_1", "y_0 + y_1"],
					to: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
					color: desmosColors.red,
				}),

				...getDesmosVector({
					from: ["x_0", "y_0"],
					to: ["x_0 + x_2", "y_0 + y_2"],
					color: desmosColors.red,
					lineStyle: desmosLineStyles.DASHED,
				}),

				...getDesmosVector({
					from: ["x_0 + x_2", "y_0 + y_2"],
					to: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
					color: desmosColors.blue,
					lineStyle: desmosLineStyles.DASHED,
				}),

				...getDesmosVector({
					from: ["x_0", "y_0"],
					to: ["x_0 + x_1 + x_2", "y_0 + y_1 + y_2"],
					color: desmosColors.purple,
				}),
			]
		},

		vectorArithmeticExercise:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				...getDesmosVector({
					from: ["1", "0"],
					to: ["2", "-2"],
					color: desmosColors.purple,
				}),

				...getDesmosVector({
					from: ["0", "-1"],
					to: ["-1", "0"],
					color: desmosColors.blue,
				}),
			]
		},

		componentVectors:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

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
					color: desmosColors.black,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...(Array(5).fill().map((_, i) => getDesmosVector({
					from: [`A[${i + 1}]`, "0"],
					to: [`A[${i + 2}]`, "0"],
					color: desmosColors.red,
					secret: false
				})).flat()),

				...(Array(5).fill().map((_, i) => getDesmosVector({
					from: ["a", `B[${i + 1}]`],
					to: ["a", `B[${i + 2}]`],
					color: desmosColors.blue,
					secret: false
				})).flat()),

				...getDesmosVector({
					from: [raw`\floor(\abs(a))\sign(a)`, "0"],
					to: [raw`a + 0.00001\sign(a)`, "0"],
					color: desmosColors.red,
				}),

				...getDesmosVector({
					from: ["a", raw`\floor(\abs(b))\sign(b)`],
					to: ["a", raw`b + 0.00001\sign(b)`],
					color: desmosColors.blue,
				}),

				...getDesmosVector({
					from: ["0", "0"],
					to: ["a", "b"],
					color: desmosColors.purple,
				}),
			]
		},

		dotProductMotivation:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

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
					color: desmosColors.black,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosPoint({
					point: ["x_0 + x_1", "y_0 + y_1"],
					color: desmosColors.blue,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosPoint({
					point: ["x_0 + x_2", "y_0 + y_2"],
					color: desmosColors.red,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...getDesmosVector({
					from: ["x_0", "y_0"],
					to: ["x_0 + x_1", "y_0 + y_1"],
					color: desmosColors.blue,
				}),

				...getDesmosVector({
					from: ["x_0", "y_0"],
					to: ["x_0 + x_2", "y_0 + y_2"],
					color: desmosColors.red,
				}),

				...getDesmosVector({
					from: ["x_0 + x_1", "y_0 + y_1"],
					to: ["x_0 + x_2", "y_0 + y_2"],
					color: desmosColors.purple,
				}),
			]
		}
	});
}