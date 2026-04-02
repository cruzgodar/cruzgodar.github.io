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

			options: { showPlane3D: false },

			bounds: { xmin: -0.5, xmax: 1.5, ymin: -1, ymax: 1, zmin: -1, zmax: 1 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 + z^2 = 1 \{ x \geq 0.65 \}`, color: desmosColors.purple, secret: true },

				{ latex: raw`s(t) = (0.65, \sqrt{1 - 0.65^2}\cos(t), \sqrt{1 - 0.65^2}\sin(t))`, secret: true },
				{ latex: raw`s(t)`, color: desmosColors.blue, parametricDomain: { min: 0, max: "2\\pi" }, secret: true },

				{ latex: raw`T = [\frac{\pi}{4}, \frac{3\pi}{4}, \frac{5\pi}{4}, \frac{7\pi}{4}]`, secret: true },
				{ latex: raw`\vector(s(T), s(T) + 0.2\frac{s'(T)}{\left| s'(T) \right|})`, lineWidth: 10, color: desmosColors.blue, secret: true },

				{ latex: raw`P = [(\sin(i)\cos(j), \sin(i)\sin(j), \cos(i)) \for i = [0, \frac{\pi}{3} + a, \frac{\pi}{6} + a, \frac{\pi}{2}, \pi - \frac{\pi}{6} - a, \pi - \frac{\pi}{3} - a, \pi], j = [0, \frac{\pi}{4}, ..., 2\pi]]`, hidden: true, secret: false },

				{ latex: raw`a = 0.1`, secret: true },

				{ latex: raw`\vector(P, 1.25P)`, color: desmosColors.red, secret: true },
			]
		}
	});
}