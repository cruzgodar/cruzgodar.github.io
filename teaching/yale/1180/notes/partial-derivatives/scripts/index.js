import {
	createDesmosGraphs, desmosColors,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		secantLines:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				translucentSurfaces: true,
				worldRotation3D: [-0.17, -0.98, -0.02, 0.98, -0.18, 0.1, -0.1, 0, 0.99]
			},

			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{4}(x^2 + y^2)`, color: desmosColors.purple },

				...getDesmosSlider({
					expression: "a = 1",
					min: -5,
					max: 5,
					secret: false,
				}),
				...getDesmosSlider({
					expression: "b = -1",
					min: -5,
					max: 5,
					secret: false,
				}),
				...getDesmosSlider({
					expression: "h = 0.75",
					min: -0.5,
					max: 0.5,
					step: 0.05,
					secret: false,
				}),

				{ latex: raw`(a, b, f(a, b))`, color: desmosColors.red },
				{ latex: raw`(a + h, b, f(a + h, b))`, color: desmosColors.red },

				{ latex: raw`(a, b, f(a, b)) + t\frac{(h, 0, f(a + h, b) - f(a, b))}{\left| (h, 0, f(a + h, b) - f(a, b)) \right|}`, parametricDomain: { min: -5, max: 5 }, color: desmosColors.blue, secret: true },
			]
		},

		partialDerivativeWireframes:
		{
			use3d: true,

			bounds: { xmin: -1, xmax: 1, ymin: -1, ymax: 1, zmin: -1, zmax: 1 },

			options: {
				showPlane3D: false,
				translucentSurfaces: true,
				worldRotation3D: [-0.45, -0.86, -0.23, 0.77, -0.51, 0.39, -0.45, 0, 0.89]
			},

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{4}(x^2 - y^3 - x^3y)`, color: desmosColors.gray },

				{ latex: raw`f_x(x, y) = \frac{d}{dx}(f(x, y))`, color: desmosColors.purple, hidden: true, secret: true },
				{ latex: raw`f_y(x, y) = \frac{d}{dy}(f(x, y))`, color: desmosColors.purple, hidden: true, secret: true },

				...getDesmosSlider({
					expression: "a = -0.4",
					min: -5,
					max: 5,
					secret: false,
				}),
				...getDesmosSlider({
					expression: "b = 0.6",
					min: -5,
					max: 5,
					secret: false,
				}),

				{ latex: raw`(a, b, f(a, b))`, color: desmosColors.red },

				{ latex: raw`(a + t, b, f(a + t, b))`, parametricDomain: { min: -2, max: 2 }, color: desmosColors.purple, secret: true },
				{ latex: raw`(a, b + t, f(a, b + t))`, parametricDomain: { min: -2, max: 2 }, color: desmosColors.purple, secret: true },

				{ latex: raw`(a, b, f(a, b)) + t(1, 0, f_x(a, b))`, parametricDomain: { min: -2, max: 2 }, color: desmosColors.blue, secret: true },
				{ latex: raw`(a, b, f(a, b)) + t(0, 1, f_y(a, b))`, parametricDomain: { min: -2, max: 2 }, color: desmosColors.blue, secret: true },

				{ latex: raw`x = a + 0z`, color: desmosColors.gray, hidden: true },
				{ latex: raw`y = b + 0z`, color: desmosColors.gray, hidden: true },
			]
		},

		tangentPlane:
		{
			use3d: true,

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			options: {
				showPlane3D: false,
				translucentSurfaces: true,
				worldRotation3D: [-0.84, 0.43, -0.33, -0.4, -0.9, -0.15, -0.36, 0, 0.93]
			},

			expressions:
			[
				{ latex: raw`f(x, y) = \sqrt{20 - x^2 - 3y^2}`, color: desmosColors.purple },

				...getDesmosSlider({
					expression: "a = 1",
					min: -5,
					max: 5,
					secret: false,
				}),
				...getDesmosSlider({
					expression: "b = 1",
					min: -5,
					max: 5,
					secret: false,
				}),

				{ latex: raw`f_x(x, y) = \frac{d}{dx}(f(x, y))`, color: desmosColors.purple, hidden: true, secret: true },
				{ latex: raw`f_y(x, y) = \frac{d}{dy}(f(x, y))`, color: desmosColors.purple, hidden: true, secret: true },

				{ latex: raw`z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)`, color: desmosColors.blue },

				{ latex: raw`(a, b, f(a, b))`, color: desmosColors.red },
			]
		},
	});
}