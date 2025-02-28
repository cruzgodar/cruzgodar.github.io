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
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}