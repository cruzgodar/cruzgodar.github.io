import { hsvToHex } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs,
	desmosColors,
	getColored3DCurve,
	getDesmosSlider
} from "/scripts/src/desmos.js";
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
						return hsvToHex(1 - 0.5 * x, 1, 1);
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

				{ latex: raw`(1 - s) (u, v, 0) + s c(u, v)`, colorLatex: "C", secret: true },

				// The inverse of the parameterization. This isn't the exact inverse, but the
				// fiddling with s makes it work at both endpoints and look decent in-between.
				{ latex: raw`U(x, y, z) = s\frac{1}{2} + \frac{4 - 3s}{\pi}\arctan(\frac{x}{1 - z})`, secret: true },
				{ latex: raw`V(x, y, z) = s\frac{1}{2} + \frac{4 - 3s}{\pi}\arctan(\frac{y}{1 - z})`, secret: true },

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),

				{ latex: raw`C = \operatorname{rgb}(255\left|U(x, y, z)\right|^{1.3151}, 255\left|V(x, y, z)\right|^{1.3151}, 255)`, secret: true },
			]
		},

		parametricSurface:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`s(u, v) = (v, \cos(u), \sin(u))` },

				{ latex: raw`s(u, v)`, parametricDomain3Du: { min: 0, max: "2\\pi" }, parametricDomain3Dv: { min: -1, max: 1 }, color: desmosColors.purple },

				{ latex: raw`U = [0, \frac{\pi}{4}, ..., 2\pi]` },
				{ latex: raw`V = [-1, -0.5, ..., 1]` },

				{ latex: raw`s(t, V)`, parametricDomain: { min: 0, max: "2\\pi" }, color: desmosColors.blue },
				{ latex: raw`s(U, t)`, parametricDomain: { min: -1, max: 1 }, color: desmosColors.red },
			]
		},

		doubleCone:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`(v\cos(u), v\sin(u), v)`, parametricDomain3Du: { min: 0, max: "2\\pi" }, parametricDomain3Dv: { min: -2, max: 2 }, color: desmosColors.purple, secret: true },
			]
		},

		functionParameterization:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -7.5, xmax: 7.5, ymin: -7.5, ymax: 7.5, zmin: -7.5, zmax: 7.5 },

			expressions:
			[
				{ latex: raw`(u, v, u\cos(v))`, parametricDomain3Du: { min: "-2\\pi", max: "2\\pi" }, parametricDomain3Dv: { min: "-2\\pi", max: "2\\pi" }, color: desmosColors.purple, secret: true },
			]
		},

		parametricPlane:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`2x+2(z-1)=0`, color: desmosColors.purple },

				{ latex: raw`(0, 0, 1)`, color: desmosColors.orange },
				{ latex: raw`\vector((0, 0, 1), (-1, -2, 2))`, color: desmosColors.blue },
				{ latex: raw`\vector((0, 0, 1), (1, 0, 0))`, color: desmosColors.red },
			]
		},

		wigglyCylinder:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`(v, \cos(u), \sin(\frac{\pi}{2} v) + \sin(u))`, parametricDomain3Du: { min: 0, max: "2\\pi" }, parametricDomain3Dv: { min: -2, max: 2 }, color: desmosColors.purple },
			]
		},

		surfaceOfRevolution:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`f(x) = \frac{1}{2}\sin(x) + \frac{3}{2}`, hidden: true },
				{ latex: raw`(t, f(t), 0)`, parametricDomain: { min: -2.5, max: 2.5 }, color: desmosColors.blue, secret: true },
				...getDesmosSlider({
					expression: "b = 0",
					min: 0,
					max: "2\\pi",
					secret: false,
				}),
				{ latex: raw`(u, f(u)\cos(v), f(u)\sin(v))`, parametricDomain3Du: { min: -2.5, max: 2.5 }, parametricDomain3Dv: { min: 0, max: "b" }, color: desmosColors.purple },
			]
		},

		wireframeNormalVector:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`s(u, v) = (\cos(u), \sin(v), \sin(u)\cos(v))` },

				{ latex: raw`s(u, v)`, parametricDomain3Du: { min: 0, max: "\\pi" }, parametricDomain3Dv: { min: 0, max: "2\\pi" }, color: desmosColors.gray },

				...getDesmosSlider({
					expression: "a = 1",
					min: 0,
					max: "\\pi",
					secret: false
				}),
				...getDesmosSlider({
					expression: "b = 0",
					min: 0,
					max: "2\\pi",
					secret: false
				}),

				{ latex: raw`s(a, b)`, color: desmosColors.orange },
				{ latex: raw`s(t, b)`, parametricDomain: { min: 0, max: "\\pi" }, color: desmosColors.blue },
				{ latex: raw`s(a, t)`, parametricDomain: { min: 0, max: "2\\pi" }, color: desmosColors.red },

				{ latex: raw`s_u(t) = \frac{d}{dt}s(t, b)`, hidden: true, secret: true },
				{ latex: raw`s_v(t) = \frac{d}{dt}s(a, t)`, hidden: true, secret: true },

				{ latex: raw`\vector(s(a, b), s(a, b) + s_u(a))`, color: desmosColors.purple, secret: true },
				{ latex: raw`\vector(s(a, b), s(a, b) + s_v(b))`, color: desmosColors.purple, secret: true },

				{ latex: raw`(s_u(a) \times s_v(b)) \cdot ((x, y, z) - s(a, b)) = 0`, color: desmosColors.orange, hidden: true },
			]
		},

		nastyTangentPlanes:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`s(u, v) = (\sin(u + 2v), \sin(u), \cos(v))` },

				{ latex: raw`s(u, v)`, parametricDomain3Du: { min: 0, max: "2\\pi" }, parametricDomain3Dv: { min: 0, max: "\\pi" }, color: desmosColors.gray },

				{ latex: raw`s(0, 0)`, color: desmosColors.purple },
				{ latex: raw`s(\frac{\pi}{2}, 0)`, color: desmosColors.blue },
				{ latex: raw`s(0, \frac{\pi}{2})`, color: desmosColors.red },
			]
		},

		surfaceAreaParallelograms:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`s(u, v) = (\cos(u), \sin(v), \sin(u)\cos(v))` },

				{ latex: raw`s(u, v)`, parametricDomain3Du: { min: 0, max: "\\pi" }, parametricDomain3Dv: { min: 0, max: "2\\pi" }, color: desmosColors.gray },

				...getDesmosSlider({
					expression: "a = 0.6",
					min: 0,
					max: "\\pi",
					secret: false
				}),

				...getDesmosSlider({
					expression: "b = 1.6",
					min: "a",
					max: "\\pi",
					secret: false
				}),

				...getDesmosSlider({
					expression: "c = 5",
					min: 0,
					max: "2\\pi",
					secret: false
				}),

				...getDesmosSlider({
					expression: "d = 6",
					min: "c",
					max: "2\\pi",
					secret: false
				}),

				...getDesmosSlider({
					expression: "m = 4",
					min: 1,
					max: 10,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "n = 4",
					min: 1,
					max: 10,
					step: 1,
					secret: false
				}),

				{ latex: raw`P = [(i, j) \for i = [a, a + \frac{b - a}{m - 1}, ..., b], j = [c, c + \frac{d - c}{n - 1}, ..., d]]`, hidden: true, secret: true },

				

				{ latex: raw`s_u(t, y) = \frac{d}{dt}s(t, y)`, hidden: true, secret: true },
				{ latex: raw`s_v(x, t) = \frac{d}{dt}s(x, t)`, hidden: true, secret: true },

				{
					latex: raw`s(P.x, P.y) + u(s_u(P.x, P.y)) + v(s_v(P.x, P.y))`,
					color: desmosColors.purple,
					parametricDomain3Du: {
						min: "-\\frac{b - a}{2(m - 1)}",
						max: "\\frac{b - a}{2(m - 1)}"
					},
					parametricDomain3Dv: {
						min: "-\\frac{d - c}{2(n - 1)}",
						max: "\\frac{d - c}{2(n - 1)}"
					},
					secret: true
				},
			]
		},
	});
}