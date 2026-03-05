import { hsvToHex } from "/scripts/applets/applet.js";
import { createDesmosGraphs, getColored3DCurve, getDesmosSlider } from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		parametricCurveShaping:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`l(t) = (\cos(2t), \sin(2t), t)`, hidden: true },
				...getColored3DCurve({
					pathFunction: (t) => [t, 0, 0],
					pathFunctionDesmos: raw`(1 - s) (1, 0, 0)t + s l(6(t-0.5))`,
					minT: 0,
					maxT: 1,
					numSlices: 100,
					colorFunction: ([x]) =>
					{
						return hsvToHex(x, 1, 1);
					}
				}),

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),
			]
		},

		parametricSurfaceShaping:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`X(u) = \tan(\pi (u - \frac{1}{2}))`, hidden: true, secret: false },
				{ latex: raw`Y(v) = \tan(\pi (v - \frac{1}{2}))`, hidden: true, secret: false },
				{ latex: raw`c(u, v) = \frac{1}{1 + X(u)^2 + Y(v)^2}(2X(u), 2Y(v), -1 + X(u)^2 + Y(v)^2)`, hidden: true, secret: false },

				{ latex: raw`(1 - s) (u, v, 0) + s c(u, v)`, colorLatex: "C", secret: false },

				// The inverse of the parameterization. This isn't the exact inverse, but the
				// fiddling with s makes it work at both endpoints and look decent in-between.
				{ latex: raw`U(x, y, z) = s\frac{1}{2} + \frac{4 - 3s}{\pi}\arctan(\frac{x}{1 - z})`, secret: false },
				{ latex: raw`V(x, y, z) = s\frac{1}{2} + \frac{4 - 3s}{\pi}\arctan(\frac{y}{1 - z})`, secret: false },

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),

				{ latex: raw`C = \operatorname{rgb}(255U(x, y, z), 255V(x, y, z), 127)` },
			]
		},
	});
}