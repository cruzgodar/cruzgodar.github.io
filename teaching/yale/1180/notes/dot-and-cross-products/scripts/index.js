import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosBlue3d,
	desmosGray3d,
	desmosPurple,
	desmosPurple3d,
	desmosRed,
	desmosRed3d,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			angleBetweenVectors:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`v = (-1, -2, 3)`, hidden: true },
					{ latex: raw`w = (2, 3, 1)`, hidden: true },
					{ latex: raw`\vector((0, 0, 0), v)`, color: desmosRed3d, secret: true },
					{ latex: raw`\vector((0, 0, 0), w)`, color: desmosBlue3d, secret: true },
					{ latex: raw`n = v \times w`, color: desmosPurple3d, secret: true },
					{ latex: raw`n \cdot (x, y, z) = 0`, color: desmosGray3d, secret: true },
					{ latex: raw`a = \arccos(\frac{v \cdot w}{\left|v\right|\left|w\right|})`, secret: true },
					{ latex: raw`u = \frac{v}{\left|v\right|}`, secret: true, hidden: true },
					{ latex: raw`u_2 = n \times u`, secret: true },
					{ latex: raw`\cos(at)u + \sin(at)\frac{u_2}{\left|u_2\right|}`, color: desmosPurple3d, parametricDomain: { min: 0, max: 1 }, secret: true },
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
}