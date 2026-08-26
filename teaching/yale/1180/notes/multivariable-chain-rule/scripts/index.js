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

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

			options: { showPlane3D: false },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{4}(x^2 - y^3)`, color: desmosColors.purple },

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
					expression: "h = 1",
					min: -2,
					max: 2,
					secret: false,
				}),

				{ latex: raw`(a, b, f(a, b))`, color: desmosColors.red },
				{ latex: raw`(a + h, b, f(a + h, b))`, color: desmosColors.red },

				{ latex: raw`(a, b, f(a, b)) + t(h, 0, f(a + h, b) - f(a, b))`, parametricDomain: { min: -2, max: 2 }, color: desmosColors.blue, secret: true },
			]
		},

		partialDerivativeWireframes:
		{
			use3d: true,

			bounds: { xmin: -1, xmax: 1, ymin: -1, ymax: 1, zmin: -1, zmax: 1 },

			options: { showPlane3D: false },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{4}(x^2 - y^3 - x^3y)`, color: desmosColors.orange, hidden: true },

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

			options: { showPlane3D: false },

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