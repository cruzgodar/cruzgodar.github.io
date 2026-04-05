import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		angleBetweenVectors:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [0.27, 0.96, 0.06, -0.94, 0.27, -0.2, -0.21, 0, 0.98]
			},

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				{ latex: raw`v = (-1, -2, 3)`, hidden: true },
				{ latex: raw`w = (2, 3, 1)`, hidden: true },
				{ latex: raw`\vector((0, 0, 0), v)`, color: desmosColors.red, secret: true },
				{ latex: raw`\vector((0, 0, 0), w)`, color: desmosColors.blue, secret: true },
				{ latex: raw`n = v \times w`, color: desmosColors.purple, secret: true, hidden: true },
				{ latex: raw`n \cdot (x, y, z) = 0`, color: desmosColors.gray, secret: true },
				{ latex: raw`a = \arccos(\frac{v \cdot w}{\left|v\right|\left|w\right|})`, secret: true },
				{ latex: raw`u = \frac{v}{\left|v\right|}`, secret: true, hidden: true },
				{ latex: raw`u_2 = n \times u`, secret: true, hidden: true },
				{ latex: raw`\cos(at)u + \sin(at)\frac{u_2}{\left|u_2\right|}`, color: desmosColors.purple, parametricDomain: { min: 0, max: 1 }, secret: true },
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
		},

		orthogonalPlane:
		{
			use3d: true,

			options: {
				worldRotation3D: [-0.86, 0.43, -0.29, -0.4, -0.9, -0.14, -0.33, 0, 0.95]
			},

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

				{ latex: raw`v = \vector((0, 0, 0), (a, b, c))`, color: desmosColors.purple },

				{ latex: raw`ax+by+cz = 0`, color: desmosColors.gray, },
			]
		},

		distanceToPlane:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.59, -0.8, -0.06, 0.8, -0.59, 0.09, -0.11, 0, 0.99]
			},

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				{ latex: raw`x + 3z = 4`, color: desmosColors.gray, secret: true },

				{ latex: raw`p = (2, -1, 3)`, color: desmosColors.orange, secret: true },

				{ latex: raw`n = \vector((0, 0, \frac{4}{3}), (0, 0, \frac{4}{3}) + (1, 0, 3))`, color: desmosColors.orange, secret: true },

				{ latex: raw`\vector((1, 1, 1), p)`, color: desmosColors.purple, secret: true },

				{ latex: raw`\vector(p - (\frac{7}{10}, 0, \frac{21}{10}), p)`, color: desmosColors.red, secret: true },

				{ latex: raw`\vector((1, 1, 1), p - (\frac{7}{10}, 0, \frac{21}{10}))`, color: desmosColors.blue, secret: true },
			]
		},

		planeFromPoints:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.95, 0.11, -0.3, -0.1, -0.99, -0.03, -0.3, 0, 0.95]
			},

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

				{ latex: raw`(x_0, y_0, z_0), (x_1, y_1, z_1), (x_2, y_2, z_2)`, color: desmosColors.orange },

				{ latex: raw`v = \vector((x_0, y_0, z_0), (x_1, y_1, z_1))`, color: desmosColors.blue, secret: true },

				{ latex: raw`w = \vector((x_0, y_0, z_0), (x_2, y_2, z_2))`, color: desmosColors.red, secret: true },

				{ latex: raw`m = -(x_1 - x_0, y_1 - y_0, z_1 - z_0) \times (x_2 - x_0, y_2 - y_0, z_2 - z_0)`, secret: true, hidden: true },

				{ latex: raw`n = \frac{m}{\left|m\right|}`, secret: true, hidden: true },

				{ latex: raw`\vector((x_0, y_0, z_0), (x_0, y_0, z_0) + n)`, color: desmosColors.purple, secret: true },

				{ latex: raw`n \cdot (x - x_0, y - y_0, z - z_0) = 0`, color: desmosColors.gray, secret: true },
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

				{ latex: raw`a = \operatorname{vector}((0, 0, 0), (a_1, a_2, a_3))`, color: desmosColors.blue },

				{ latex: raw`b = \operatorname{vector}((0, 0, 0), (b_1, b_2, b_3))`, color: desmosColors.red },

				{ latex: raw`n = a \times b`, color: desmosColors.purple },
			]
		},

		parallelepiped:
		{
			use3d: true,

			bounds: { xmin: -1, xmax: 6, ymin: -1, ymax: 6, zmin: -1, zmax: 6 },

			options: {
				showPlane3D: false,
				translucentSurfaces: true,
				worldRotation3D: [-0.93, -0.3, -0.21, 0.3, -0.95, 0.07, -0.22, 0, 0.98]
			},

			expressions:
			[
				{ latex: raw`a = (2, 1, 2)`, hidden: true },
				{ latex: raw`b = (1, 3, 1)`, hidden: true },
				{ latex: raw`c = (0, 1, 3)`, hidden: true },

				{ latex: raw`\triangle((0, 0, 0), a, b)`, color: desmosColors.purple },
				{ latex: raw`\triangle(a, b, a + b)`, color: desmosColors.purple },

				{ latex: raw`\triangle((0, 0, 0), c, b)`, color: desmosColors.blue },
				{ latex: raw`\triangle(c, b, c + b)`, color: desmosColors.blue },

				{ latex: raw`\triangle((0, 0, 0), a, c)`, color: desmosColors.red },
				{ latex: raw`\triangle(a, c, a + c)`, color: desmosColors.red },

				{ latex: raw`\triangle(a + b, a, a + c)`, color: desmosColors.blue },
				{ latex: raw`\triangle(a + b, a + b + c, a + c)`, color: desmosColors.blue },

				{ latex: raw`\triangle(b + a, b, b + c)`, color: desmosColors.red },
				{ latex: raw`\triangle(b + a, b + a + c, b + c)`, color: desmosColors.red },

				{ latex: raw`\triangle(c + a, c, c + b)`, color: desmosColors.purple },
				{ latex: raw`\triangle(c + a, c + b + a, c + b)`, color: desmosColors.purple },
			]
		},

		vectorValuedLine:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			expressions:
			[
				{ latex: raw`(1, 3, 2) + (-1, 0, 1)t`, color: desmosColors.purple, parametricDomain: { min: -5, max: 5 }, secret: true },
				{ latex: raw`\vector((0, 0, 0), (1, 3, 2) + (-1, 0, 1)a)`, color: desmosColors.orange, secret: true },
				{ latex: raw`\vector((0, 0, 0), (1, 3, 2))`, color: desmosColors.blue, secret: true },
				{ latex: raw`\vector((1, 3, 2), (1, 3, 2) + a(-1, 0, 1))`, color: desmosColors.red, secret: true },
				...getDesmosSlider({
					expression: raw`a = 1`,
					min: -5,
					max: 5,
					secret: false,
				}),
			]
		}
	});
}