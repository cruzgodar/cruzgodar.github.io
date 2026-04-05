import {
	createDesmosGraphs,
	desmosColors
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

				{ latex: raw`\vector(P - (0, 0, 0.01), P + 0.5Q)`, color: desmosColors.red, secret: true },
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

				{ latex: raw`\vector(P, P + 0.35Q)`, color: desmosColors.red, secret: true },
			]
		},

		planeTriangle:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				showNumbers3D: false,
				worldRotation3D: [-0.9, 0.23, -0.37, -0.21, -0.97, -0.09, -0.38, 0, 0.92],
			},

			bounds: { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 2.5, zmin: -0.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`(u, v, 2 - u - v)\{z \geq 0\}`, parametricDomain3Du: { min: 0, max: 2 }, parametricDomain3Dv: { min: 0, max: 2 }, color: desmosColors.purple },

				

				{ latex: raw`Q = [(i, j, 2 - i - j\{2 - i - j \geq 0\}) \for i = [0.1, 0.1 + \frac{2}{6}, ... 1.8], j = [0.1, 0.1 + \frac{2}{6}, ... 1.8]]`, hidden: true, secret: true },

				{ latex: raw`\vector(Q, Q + 0.05(Q.x + 2Q.z, 2Q.y - 3Q.x, 5Q.y + Q.z))`, color: desmosColors.orange, secret: true },

				// { latex: raw`s_1(t) = (\cos(t), \sin(t), 1)`, secret: true },
				// { latex: raw`s_1(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				// { latex: raw`T = [0, \frac{\pi}{2}, ..., \frac{3\pi}{2}]`, secret: true },
				// { latex: raw`\vector(s_1(T), s_1(T) + 0.25\frac{s_1'(T)}{\left| s_1'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },
			]
		}
	});
}