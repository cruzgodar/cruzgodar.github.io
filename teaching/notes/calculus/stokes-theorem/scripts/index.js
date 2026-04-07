import {
	createDesmosGraphs,
	desmosColors,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		unitCircle3D:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 \leq 1 \{z = 0\}`, color: desmosColors.purple, secret: true },

				{ latex: raw`s(t) = (\cos(t), \sin(t), 0)`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [\frac{\pi}{4}, \frac{3\pi}{4}, \frac{5\pi}{4}, \frac{7\pi}{4}]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.2\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },
			]
		},

		sphereCap:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.87, -0.48, -0.13, 0.48, -0.87, 0.07, -0.15, 0, 0.99]
			},

			bounds: { xmin: -0.5, xmax: 1.5, ymin: -1, ymax: 1, zmin: -1, zmax: 1 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 + z^2 = 1 \{ x \geq 0.65 \}`, color: desmosColors.purple, secret: true },

				{ latex: raw`s(t) = (0.65, \sqrt{1 - 0.65^2}\cos(t), \sqrt{1 - 0.65^2}\sin(t))`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [\frac{\pi}{4}, \frac{3\pi}{4}, \frac{5\pi}{4}, \frac{7\pi}{4}]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.15\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`P = [(\cos(i), \sin(i)\cos(j), \sin(i)\sin(j)) \for i = [0, 0.375, 0.7], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: true },

				{ latex: raw`\vector(P, 1.2P)`, color: desmosColors.red, secret: true },
			]
		},

		cylinder:
		{
			use3d: true,

			options: { showPlane3D: false, showNumbers3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`(\cos(u), \sin(u), v)`, color: desmosColors.purple, parametricDomain3Du: { min: 0, max: "2\\pi" }, parametricDomain3Dv: { min: -1, max: 1 } },

				{ latex: raw`s_1(t) = (\cos(t), \sin(t), 1)`, secret: true },
				{ latex: raw`s_1(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [0, \frac{\pi}{2}, ..., \frac{3\pi}{2}]`, secret: true },
				{ latex: raw`\vector(s_1(T), s_1(T) + 0.25\frac{s_1'(T)}{\left| s_1'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`s_2(t) = (\cos(-t), \sin(-t), -1)`, secret: true },
				{ latex: raw`s_2(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`\vector(s_2(T), s_2(T) + 0.25\frac{s_2'(T)}{\left| s_2'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`P = [(0.99\cos(j), 0.99\sin(j), i) \for i = [-0.75, 0, 0.75], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: true },

				{ latex: raw`Q = [(-\cos(j), -\sin(j), 0) \for i = [-0.75, 0, 0.75], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: true },

				{ latex: raw`\vector(P, P + 0.35\frac{Q}{\left|Q\right|})`, color: desmosColors.red, secret: true },
			]
		},

		eggCarton:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4, zmin: -2, zmax: 6 },

			expressions:
			[
				{ latex: raw`z = \cos(x) + \cos(y) + 2 \{ x^2 + y^2 \leq \pi^2 \}`, color: desmosColors.purple, secret: true },

				{ latex: raw`s(t) = (\pi\cos(-t), \pi\sin(-t), \cos(\pi\cos(-t)) + \cos(\pi\sin(-t)) + 2)`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [\frac{\pi}{8}, \frac{3\pi}{8}, ..., \frac{15\pi}{8}]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.5\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`P = [(i\cos(j), i\sin(j), \cos(i\cos(j)) + \cos(i\sin(j)) + 2) \for i = [0.5, 1.5, 2.5], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: false },

				{ latex: raw`Q = [(-\sin(i\cos(j)), -\sin(i\sin(j)), -1) \for i = [0.5, 1.5, 2.5], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: false },

				{ latex: raw`\vector(P - (0, 0, 0.01), P + 0.8\frac{Q}{\left|Q\right|})`, color: desmosColors.red, secret: true },
			]
		},

		suspendedCircle:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				translucentSurfaces: true,
				worldRotation3D: [-0.87, 0.34, -0.35, -0.31, -0.94, -0.13, -0.38, 0, 0.93]
			},

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: 0.25, zmax: 5.25 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 \leq 4 \{z = 3\}`, color: desmosColors.purple, hidden: true },
				{ latex: raw`z = \frac{3}{4} (x^2 + y^2) \{z \leq 3\}`, color: desmosColors.red, hidden: true },
				{ latex: raw`x^2 + y^2 + z^2 = 13 \{z \geq 3\}`, color: desmosColors.orange, hidden: true },

				{ latex: raw`s(t) = (2\cos(t), 2\sin(t), 3)`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [\frac{\pi}{4}, \frac{3\pi}{4}, \frac{5\pi}{4}, \frac{7\pi}{4}]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.35\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },
			]
		},

		planeTriangle:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				showNumbers3D: false,
				worldRotation3D: [-0.62, 0.7, -0.35, -0.61, -0.72, -0.34, -0.49, 0, 0.87],
			},

			bounds: { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 2.5, zmin: -0.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`(u, v, 2 - u - v)\{z \geq 0\}`, parametricDomain3Du: { min: 0, max: 2 }, parametricDomain3Dv: { min: 0, max: 2 }, color: desmosColors.purple },

				

				{ latex: raw`Q = [(i, j, 2 - i - j\{2 - i - j \geq 0\}) \for i = [0.1, 0.1 + \frac{2}{6}, ... 1.8], j = [0.1, 0.1 + \frac{2}{6}, ... 1.8]]`, hidden: true, secret: true },

				{ latex: raw`\vector(Q, Q + 0.05(Q.x + 2Q.z, -2Q.y - 2Q.x, 5Q.y + Q.z))`, color: desmosColors.orange, secret: true },

				{ latex: raw`s_1(t) = (2, 0, 0) + (-2, 0, 2)t`, secret: true },
				{ latex: raw`s_1(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`T = [0.5]`, secret: true },
				{ latex: raw`\vector(s_1(T), s_1(T) + 0.2\frac{s_1'(T)}{\left| s_1'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`s_2(t) = (0, 0, 2) + (0, 2, -2)t`, secret: true },
				{ latex: raw`s_2(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`\vector(s_2(T), s_2(T) + 0.25\frac{s_2'(T)}{\left| s_2'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`s_3(t) = (0, 2, 0) + (2, -2, 0)t`, secret: true },
				{ latex: raw`s_3(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`\vector(s_3(T), s_3(T) + 0.25\frac{s_3'(T)}{\left| s_3'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },
			]
		},

		hemisphere:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.9, -0.3, -0.33, 0.28, -0.95, 0.1, -0.34, 0, 0.94]
			},

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.25, zmax: 1.75 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 + z^2 = 1 \{z \geq 0\}`, color: desmosColors.purple },

				{ latex: raw`s(t) = (\cos(-t), \sin(-t), 0)`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [\frac{\pi}{4}, \frac{3\pi}{4}, \frac{5\pi}{4}, \frac{7\pi}{4}]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.225\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`P = [(i\cos(j), i\sin(j), \sqrt{1 - i^2}) \for i = [0.25, 0.6, 0.99], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: true },

				{ latex: raw`\vector(0.99P, 0.75P)`, color: desmosColors.red, secret: true },
			]
		},

		whorl:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [0.93, -0.16, 0.33, 0.15, 0.99, 0.05, -0.34, 0, 0.94]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -0.75, zmax: 1.5 },

			expressions:
			[
				...getDesmosSlider({
					expression: "a = 0",
					min: 0,
					max: 1,
					secret: false,
				}),

				{ latex: raw`S(u, v) = (\sin(u)\cos(v), \sin(u)\sin(v), (1 - a^5)\cos(u) + (1 - a)\frac{1}{5}\sin^2( \frac{v}{2} ) \cos(u)\sin(4uv) + 0.015a)`, secret: true },
				{ latex: raw`S(u, v)`, parametricDomain3Du: { min: 0, max: "\\frac{\\pi}{2}" }, parametricDomain3Dv: { min: 0, max: "2\\pi" }, colorLatex: "C", secret: false },



				{ latex: raw`s(t) = (\cos(t), \sin(t), 0.015)`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [0 - 0.75, \frac{\pi}{2} - 0.75, \pi - 0.75, \frac{3\pi}{2} - 0.75]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.225\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },



				{ latex: raw`P = [(i, j) \for i = [0.25, 0.6, 0.99], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: true },

				{ latex: raw`S_u(u, v) = \frac{d}{du}S(u, v)`, hidden: true, secret: true },
				{ latex: raw`S_v(u, v) = \frac{d}{dv}S(u, v)`, hidden: true, secret: true },

				{ latex: raw`n = \vector(S(P.x, P.y), S(P.x, P.y) + 0.35\frac{S_u(P.x, P.y) \times S_v(P.x, P.y)}{\left| S_u(P.x, P.y) \times S_v(P.x, P.y) \right|})`, secret: true, hidden: true },

				{ latex: raw`n`, color: desmosColors.red, hidden: true },


				
				// UV coordiates for the point (x, y, z)
				{ latex: raw`U(x, y) = (\arcsin(\sqrt{x^2+y^2}), \mod(\arctan(y, x), 2\pi))`, secret: true, hidden: true },
				{ latex: raw`N(x, y) = \frac{S_u(U(x, y).x, U(x, y).y) \times S_v(U(x, y).x, U(x, y).y)}{\left| S_u(U(x, y).x, U(x, y).y) \times S_v(U(x, y).x, U(x, y).y) \right|}`, secret: true, hidden: true },
				{ latex: raw`f(x, y, z) = N(x, y) \cdot (\tan(y), 2xy - z, y^2 - 2xz)`, secret: true, hidden: true },

				{ latex: raw`P_1(x, y, z) = e^{-f(x, y, z)^2}`, secret: true },
				{ latex: raw`R_1(x, y, z) = \{ f(x, y, z) \geq 0 : 1 - P_1(x, y, z), f(x, y, z) < 0: 0 \}`, secret: true },
				{ latex: raw`B_1(x, y, z) = \{ f(x, y, z) \leq 0 : 1 - P_1(x, y, z), f(x, y, z) > 0: 0 \}`, secret: true },

				{ latex: raw`C = \operatorname{rgb}(204R_1(x, y, z) + 40B_1(x, y, z) + 122P_1(x, y, z), 40R_1(x, y, z) + 122B_1(x, y, z) + 40P_1(x, y, z), 40R_1(x, y, z) + 204B_1(x, y, z) + 205P_1(x, y, z))`, secret: true },
			]
		},

		puzzleFeeder:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.69, 0.72, -0.11, -0.71, -0.69, -0.11, -0.15, 0, 0.99]
			},

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`S(u, v) = (u\sin(v + \pi), \sin^2(2\pi u)\cos^2(uv\sin(v)), u\cos(v + \pi))`, secret: true },
				{ latex: raw`S(u, v)`, parametricDomain3Du: { min: 1, max: 2 }, parametricDomain3Dv: { min: 0, max: "2\\pi" }, color: desmosColors.purple, secret: false },
			]
		}
	});
}