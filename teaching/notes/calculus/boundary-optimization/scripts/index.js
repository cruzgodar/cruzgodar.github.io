import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	getDesmosPoint,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		endpoints:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = x^3 - x^2 - x + 1 \left\{ a \leq x \leq b\right\}`, color: desmosColors.purple },

				...getDesmosSlider({
					expression: raw`a = -1.5`,
					min: -2,
					max: 2,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`b = 2`,
					min: "a",
					max: 2,
					secret: false
				}),

				...getDesmosPoint({
					point: ["a", "f(a)"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
					secret: false
				}),

				...getDesmosPoint({
					point: ["b", "f(b)"],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE,
					secret: false
				}),
			]
		},

		boundary1:
		{
			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25 },

			expressions:
			[
				{ latex: raw`x^2 + y^2 \leq 1`, color: desmosColors.purple },
				{ latex: raw`x^2 + y^2 = 1`, color: desmosColors.blue },

				...getDesmosSlider({
					expression: raw`a = -0.5`,
					min: -1,
					max: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\epsilon = 0.1`,
					min: 0,
					max: 0.2,
					secret: false,
					hidden: true
				}),

				{ latex: raw`b = \sqrt{1 - a^2}`, secret: true },

				...getDesmosPoint({
					point: ["a", "b"],
					color: desmosColors.red,
					dragMode: desmosDragModes.NONE,
					secret: false
				}),

				{ latex: raw`(x - a)^2 + (y - b)^2 = \epsilon^2`, color: desmosColors.red, secret: true },
			]
		},

		boundary2:
		{
			bounds: { xmin: -0.5, xmax: 5.5, ymin: -0.5, ymax: 5.5 },

			expressions:
			[
				{ latex: raw`1 \leq x \leq 3 \left\{ 2 \leq y \leq 4 \right\}`, color: desmosColors.purple },
				{ latex: raw`x = [1, 3] \left\{ 2 \leq y \leq 4 \right\}`, color: desmosColors.blue },
				{ latex: raw`y = [2, 4] \left\{ 1 \leq x \leq 3 \right\}`, color: desmosColors.blue },

				{ latex: raw`r = 5`, color: desmosColors.black, hidden: true },
			]
		},

		evt:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				translucentSurfaces: true,
				worldRotation3D: [0.6, -0.8, 0.08, 0.79, 0.6, 0.1, -0.13, 0, 0.99]
			},

			bounds: { xmin: -3.5, xmax: 1, ymin: -3.5, ymax: 1, zmin: -3.5, zmax: 1 },

			expressions:
			[
				{ latex: raw`f(x, y) = x^3 - y^2 + 2xy \left\{ -1 \leq x \leq 0 \right\}\left\{ -2 \leq y \leq 0 \right\}`, color: desmosColors.purple },

				{ latex: raw`(-\frac{2}{3}, -\frac{2}{3}, f(-\frac{2}{3}, -\frac{2}{3}))`, color: desmosColors.orange },
				{ latex: raw`(0, -2, f(0, -2))`, color: desmosColors.blue },

				{ latex: raw`(t, [-2, 0], f(t, [-2, 0]))`, parametricDomain: { min: -1, max: 0 }, color: desmosColors.red, secret: true },
				{ latex: raw`([-1, 0], t, f([-1, 0], t))`, parametricDomain: { min: -2, max: 0 }, color: desmosColors.red, secret: true },
			]
		},

		triangularRegion:
		{
			use3d: true,

			options: { showPlane3D: false, },

			bounds: { xmin: -0.5, xmax: 2.5, ymin: -0.5, ymax: 4.5, zmin: -3, zmax: 0.5 },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{xy}{2} - x - y \{0 \leq x \leq 2\}\{ 0 \leq y \leq 2x \}`, color: desmosColors.purple },
			]
		},

		astroid:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.2, -0.98, -0.03, 0.96, -0.2, 0.17, -0.17, 0, 0.98]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -0.2, zmax: 0.2 },

			expressions:
			[
				{ latex: raw`f(x, y) = xy\{ x^{2/3} + y^{2/3} \leq 1 \}`, color: desmosColors.gray },
				{ latex: raw`z = xy\{ x^{2/3} + y^{2/3} = 1 \}`, color: desmosColors.purple, lineWidth: 1.5 },

				{ latex: raw`(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)`, color: desmosColors.orange, pointSize: 3.5 },
				{ latex: raw`((\frac{\sqrt{2}}{2})^3, (\frac{\sqrt{2}}{2})^3, \frac{1}{8}), ((-\frac{\sqrt{2}}{2})^3, (-\frac{\sqrt{2}}{2})^3, \frac{1}{8})`, color: desmosColors.red, pointSize: 3.5 },
				{ latex: raw`((-\frac{\sqrt{2}}{2})^3, (\frac{\sqrt{2}}{2})^3, -\frac{1}{8}), ((\frac{\sqrt{2}}{2})^3, (-\frac{\sqrt{2}}{2})^3, -\frac{1}{8})`, color: desmosColors.blue, pointSize: 3.5 },
			]
		},



		tiltedCircle:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [0.25, -0.97, 0.08, 0.92, 0.26, 0.29, -0.3, 0, 0.95]
			},

			bounds: { xmin: -6, xmax: 6, ymin: -6, ymax: 6, zmin: -6, zmax: 6 },

			expressions:
			[
				{ latex: raw`f(x, y) = 2x - 2y\{ x^2 + y^2 \leq 4 \}`, color: desmosColors.gray },
				{ latex: raw`z = 2x - 2y\{ x^2 + y^2 = 4 \}`, color: desmosColors.purple, lineWidth: 1.5 },

				{ latex: raw`(\sqrt{2}, -\sqrt{2}, 4\sqrt{2})`, color: desmosColors.red, pointSize: 3.5 },
				{ latex: raw`(-\sqrt{2}, \sqrt{2}, -4\sqrt{2})`, color: desmosColors.blue, pointSize: 3.5 },
			]
		},



		levelCurves:
		{
			bounds: { xmin: -5, xmax: 15, ymin: -5, ymax: 25 },

			expressions:
			[
				{ latex: raw`2x + xy + 5y = c`, color: desmosColors.purple },

				{ latex: raw`10x + 5y = 100`, color: desmosColors.blue },

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
				{ latex: raw`f(x, y) = 2x^2+\sqrt{3}xy+3y^2 `, color: desmosColors.purple },

				{ latex: raw`2x^2+\sqrt{3}xy+3y^2\left\{ x^2 + y^2 = 1\right\}`, color: desmosColors.blue },

				{ latex: raw`(\frac{1}{2}, \frac{\sqrt{3}}{2}, f(\frac{1}{2}, \frac{\sqrt{3}}{2}) ), (-\frac{1}{2}, -\frac{\sqrt{3}}{2}, f(-\frac{1}{2}, -\frac{\sqrt{3}}{2}) )`, color: desmosColors.orange },

				{ latex: raw`(-\frac{\sqrt{3}}{2}, \frac{1}{2}, f(-\frac{\sqrt{3}}{2}, \frac{1}{2}) ), (\frac{\sqrt{3}}{2}, -\frac{1}{2}, f(\frac{\sqrt{3}}{2}, -\frac{1}{2}) )`, color: desmosColors.red },
			]
		},
	});
}