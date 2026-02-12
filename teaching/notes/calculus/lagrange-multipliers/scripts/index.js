import {
	createDesmosGraphs,
	desmosBlue,
	desmosGray,
	desmosOrange,
	desmosPurple,
	desmosRed,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		astroid:
		{
			use3d: true,

			options: { showPlane3D: false, },

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -0.2, zmax: 0.2 },

			expressions:
			[
				{ latex: raw`f(x, y) = xy\{ x^{2/3} + y^{2/3} \leq 1 \}`, color: desmosGray },
				{ latex: raw`z = xy\{ x^{2/3} + y^{2/3} = 1 \}`, color: desmosPurple, lineWidth: 1.5 },

				{ latex: raw`(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)`, color: desmosOrange, pointSize: 3.5 },
				{ latex: raw`((\frac{\sqrt{2}}{2})^3, (\frac{\sqrt{2}}{2})^3, \frac{1}{8}), ((-\frac{\sqrt{2}}{2})^3, (-\frac{\sqrt{2}}{2})^3, \frac{1}{8})`, color: desmosRed, pointSize: 3.5 },
				{ latex: raw`((-\frac{\sqrt{2}}{2})^3, (\frac{\sqrt{2}}{2})^3, -\frac{1}{8}), ((\frac{\sqrt{2}}{2})^3, (-\frac{\sqrt{2}}{2})^3, -\frac{1}{8})`, color: desmosBlue, pointSize: 3.5 },
			]
		},



		tiltedCircle:
		{
			use3d: true,

			options: { showPlane3D: false, },

			bounds: { xmin: -6, xmax: 6, ymin: -6, ymax: 6, zmin: -6, zmax: 6 },

			expressions:
			[
				{ latex: raw`f(x, y) = 2x - 2y\{ x^2 + y^2 \leq 4 \}`, color: desmosGray },
				{ latex: raw`z = 2x - 2y\{ x^2 + y^2 = 4 \}`, color: desmosPurple, lineWidth: 1.5 },

				{ latex: raw`(\sqrt{2}, -\sqrt{2}, 4\sqrt{2})`, color: desmosRed, pointSize: 3.5 },
				{ latex: raw`(-\sqrt{2}, \sqrt{2}, -4\sqrt{2})`, color: desmosBlue, pointSize: 3.5 },
			]
		},



		levelCurves:
		{
			bounds: { xmin: -5, xmax: 15, ymin: -5, ymax: 25 },

			expressions:
			[
				{ latex: raw`2x + xy + 5y = c`, color: desmosPurple },

				{ latex: raw`10x + 5y = 100`, color: desmosBlue },

				...getDesmosSlider({
					expression: raw`c = 100`,
					min: 0,
					max: 200,
					secret: false
				}),
			]
		},

		

		lagrangeExample:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -0.5, zmax: 4 },

			expressions:
			[
				{ latex: raw`f(x, y) = 2x^2+\sqrt{3}xy+3y^2 `, color: desmosPurple },

				{ latex: raw`2x^2+\sqrt{3}xy+3y^2\left\{ x^2 + y^2 = 1\right\}`, color: desmosBlue },

				{ latex: raw`(\frac{1}{2}, \frac{\sqrt{3}}{2}, f(\frac{1}{2}, \frac{\sqrt{3}}{2}) ), (-\frac{1}{2}, -\frac{\sqrt{3}}{2}, f(-\frac{1}{2}, -\frac{\sqrt{3}}{2}) )`, color: desmosOrange },

				{ latex: raw`(-\frac{\sqrt{3}}{2}, \frac{1}{2}, f(-\frac{\sqrt{3}}{2}, \frac{1}{2}) ), (\frac{\sqrt{3}}{2}, -\frac{1}{2}, f(\frac{\sqrt{3}}{2}, -\frac{1}{2}) )`, color: desmosRed },
			]
		},
	});
}