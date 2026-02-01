import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGray,
	desmosOrange,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector,
	setDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setDesmosData({
		angleBetweenVectors:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				{ latex: raw`v = (-1, -2, 3)`, hidden: true },
				{ latex: raw`w = (2, 3, 1)`, hidden: true },
				{ latex: raw`\vector((0, 0, 0), v)`, color: desmosRed, secret: true },
				{ latex: raw`\vector((0, 0, 0), w)`, color: desmosBlue, secret: true },
				{ latex: raw`n = v \times w`, color: desmosPurple, secret: true },
				{ latex: raw`n \cdot (x, y, z) = 0`, color: desmosGray, secret: true },
				{ latex: raw`a = \arccos(\frac{v \cdot w}{\left|v\right|\left|w\right|})`, secret: true },
				{ latex: raw`u = \frac{v}{\left|v\right|}`, secret: true, hidden: true },
				{ latex: raw`u_2 = n \times u`, secret: true },
				{ latex: raw`\cos(at)u + \sin(at)\frac{u_2}{\left|u_2\right|}`, color: desmosPurple, parametricDomain: { min: 0, max: 1 }, secret: true },
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
		},

		orthogonalPlane:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`a = 1`,
					min: -5,
					max: 5,
					secret: false,
				}),
				
				...getDesmosSlider({
					expression: raw`b = 5`,
					min: -5,
					max: 5,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`c = 4`,
					min: -5,
					max: 5,
					secret: false,
				}),

				{ latex: raw`v = \vector((0, 0, 0), (a, b, c))`, color: desmosPurple },

				{ latex: raw`ax+by+cz = 0`, color: desmosGray, },
			]
		},

		planeFromPoints:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`x_0 = 1`,
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
					expression: raw`z_0 = 2`,
					min: -5,
					max: 5,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`x_1 = -1`,
					min: -5,
					max: 5,
					secret: true,
				}),
				
				...getDesmosSlider({
					expression: raw`y_1 = 3`,
					min: -5,
					max: 5,
					secret: true,
				}),

				...getDesmosSlider({
					expression: raw`z_1 = 4`,
					min: -5,
					max: 5,
					secret: true,
				}),

				...getDesmosSlider({
					expression: raw`x_2 = 3`,
					min: -5,
					max: 5,
					secret: true,
				}),
				
				...getDesmosSlider({
					expression: raw`y_2 = 0`,
					min: -5,
					max: 5,
					secret: true,
				}),

				...getDesmosSlider({
					expression: raw`z_2 = 1`,
					min: -5,
					max: 5,
					secret: true,
				}),

				{ latex: raw`(x_0, y_0, z_0), (x_1, y_1, z_1), (x_2, y_2, z_2)`, color: desmosOrange },

				{ latex: raw`v = \vector((x_0, y_0, z_0), (x_1, y_1, z_1))`, color: desmosBlue, secret: true },

				{ latex: raw`w = \vector((x_0, y_0, z_0), (x_2, y_2, z_2))`, color: desmosRed, secret: true },

				{ latex: raw`m = -(x_1 - x_0, y_1 - y_0, z_1 - z_0) \times (x_2 - x_0, y_2 - y_0, z_2 - z_0)`, secret: true, hidden: true },

				{ latex: raw`n = \frac{m}{\left|m\right|}`, secret: true, hidden: true },

				{ latex: raw`\vector((x_0, y_0, z_0), (x_0, y_0, z_0) + n)`, color: desmosPurple, secret: true },

				{ latex: raw`n \cdot (x - x_0, y - y_0, z - z_0) = 0`, color: desmosGray, secret: true },
			]
		},

		crossProduct:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`a_1 = -2`,
					min: -5,
					max: 5,
					secret: false,
				}),
				
				...getDesmosSlider({
					expression: raw`a_2 = 1`,
					min: -5,
					max: 5,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`a_3 = 2`,
					min: -5,
					max: 5,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`b_1 = -3`,
					min: -5,
					max: 5,
					secret: false,
				}),
				
				...getDesmosSlider({
					expression: raw`b_2 = -3`,
					min: -5,
					max: 5,
					secret: false,
				}),

				...getDesmosSlider({
					expression: raw`b_3 = 1`,
					min: -5,
					max: 5,
					secret: false,
				}),

				{ latex: raw`a = \operatorname{vector}((0, 0, 0), (a_1, a_2, a_3))`, color: desmosBlue },

				{ latex: raw`b = \operatorname{vector}((0, 0, 0), (b_1, b_2, b_3))`, color: desmosRed },

				{ latex: raw`n = a \times b`, color: desmosPurple },
			]
		}
	});

	createDesmosGraphs();
}