import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { createEmphemeralApplet } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGraphs,
	desmosGray,
	desmosPurple,
	desmosRed,
	getDesmosBounds,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		pathIntegral:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },
			
			expressions:
			[
				{ latex: raw`f(x, y) = \sin(-x) + \cos(y) + \frac{(-x + y)^3}{100} - 0.49`, color: desmosGray, hidden: false },
				{ latex: raw`f_1(x, y) = f(x, y)\{ f(x, y) \geq 0 \}`, hidden: true, secret: true },
				{ latex: raw`f_2(x, y) = f(x, y)\{ f(x, y) \leq 0 \}`, hidden: true, secret: true },

				{ latex: raw`s(t) = (-2 + t, -2 + 1.5t)`, parametricDomain: { min: "a", max: "b" } },

				...getDesmosSlider({
					expression: "a = 0",
					min: 0,
					max: "2\\pi",
					secret: false,
				}),
				...getDesmosSlider({
					expression: "b = 3",
					min: "a",
					max: "2\\pi",
					secret: false,
				}),

				// We use these to not draw the side boundaries if they overlap.
				{ latex: raw`c = a \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },
				{ latex: raw`d = b \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },

				// Fills
				{ latex: raw`(s(u).x, s(u).y, vf_1(s(u).x, s(u).y))`, color: desmosRed, parametricDomain3Du: { min: "a", max: "b" }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(s(u).x, s(u).y, vf_2(s(u).x, s(u).y))`, color: desmosBlue, parametricDomain3Du: { min: "a", max: "b" }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },

				// Top
				{ latex: raw`(s(t).x, s(t).y, f_1(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, f_2(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Bottom
				{ latex: raw`(s(t).x, s(t).y, 0f_1(s(t).x, s(t).y))`, color: desmosRed, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, 0f_2(s(t).x, s(t).y))`, color: desmosBlue, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Side boundaries
				{ latex: raw`(s([c,d]).x, s([c,d]).y, tf_1(s([c,d]).x, s([c,d]).y))`, color: desmosRed, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(s([c,d]).x, s([c,d]).y, tf_2(s([c,d]).x, s([c,d]).y))`, color: desmosBlue, parametricDomain: { min: 0, max: 1 }, secret: true },
			]
		},

		pathIntegral2:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },
			
			expressions:
			[
				{ latex: raw`f(x, y) = \sin(y) + \cos(-x) + \frac{(y - x)^3}{100} - \frac{1}{2}`, color: desmosGray, hidden: false },
				{ latex: raw`f_1(x, y) = f(x, y)\{ f(x, y) \geq 0 \}`, hidden: true, secret: true },
				{ latex: raw`f_2(x, y) = f(x, y)\{ f(x, y) \leq 0 \}`, hidden: true, secret: true },

				{ latex: raw`s(t) = (t, -\cos(\pi t) + t - \frac{1}{2})`, hidden: true },

				...getDesmosSlider({
					expression: "a = -1",
					min: -5,
					max: "2\\pi",
					secret: false,
				}),
				...getDesmosSlider({
					expression: "b = 2",
					min: "a",
					max: "5",
					secret: false,
				}),

				// We use these to not draw the side boundaries if they overlap.
				{ latex: raw`c = a \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },
				{ latex: raw`d = b \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },

				// Fills
				{ latex: raw`(s(u).x, s(u).y, vf_1(s(u).x, s(u).y))`, color: desmosRed, parametricDomain3Du: { min: "a", max: "b" }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(s(u).x, s(u).y, vf_2(s(u).x, s(u).y))`, color: desmosBlue, parametricDomain3Du: { min: "a", max: "b" }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },

				// Top
				{ latex: raw`(s(t).x, s(t).y, f_1(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, f_2(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Bottom
				{ latex: raw`(s(t).x, s(t).y, 0f_1(s(t).x, s(t).y))`, color: desmosRed, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, 0f_2(s(t).x, s(t).y))`, color: desmosBlue, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Side boundaries
				{ latex: raw`(s([c,d]).x, s([c,d]).y, tf_1(s([c,d]).x, s([c,d]).y))`, color: desmosRed, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(s([c,d]).x, s([c,d]).y, tf_2(s([c,d]).x, s([c,d]).y))`, color: desmosBlue, parametricDomain: { min: 0, max: 1 }, secret: true },
			]
		},

		pathIntegralRectangles:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },
			
			expressions:
			[
				...getDesmosSlider({
					expression: raw`n = 25`,
					min: 1,
					max: 60,
					secret: false,
				}),

				{ latex: raw`f(x, y) = \sin(y) + \cos(-x) + \frac{(y - x)^3}{100} - \frac{1}{2}`, color: desmosGray, hidden: true },
				{ latex: raw`f_1(x, y) = f(x, y)\{ f(x, y) \geq 0 \}`, hidden: true, secret: true },
				{ latex: raw`f_2(x, y) = f(x, y)\{ f(x, y) \leq 0 \}`, hidden: true, secret: true },

				{ latex: raw`X(t) = t`, hidden: true },
				{ latex: raw`Y(t) = -\cos(\pi t) + t - \frac{1}{2}`, hidden: true },
				{ latex: raw`s(t) = (X(t), Y(t))`, hidden: true },

				...getDesmosSlider({
					expression: "a = -1",
					min: -5,
					max: "2\\pi",
					secret: false,
				}),
				...getDesmosSlider({
					expression: "b = 2",
					min: "a",
					max: "5",
					secret: false,
				}),

				{ latex: raw`A = [a, a + \frac{b - a}{n}, ..., b]`, secret: true, },

				// We use these to not draw the side boundaries if they overlap.
				{ latex: raw`c = a \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },
				{ latex: raw`d = b \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },

				// Fills
				{ latex: raw`(X(A) + uX'(A), Y(A) + uY'(A), vf_1(X(A), Y(A)))`, color: desmosRed, parametricDomain3Du: { min: raw`-\frac{b - a}{2n}`, max: raw`\frac{b - a}{2n}` }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(X(A) + uX'(A), Y(A) + uY'(A), vf_2(X(A), Y(A)))`, color: desmosBlue, parametricDomain3Du: { min: raw`-\frac{b - a}{2n}`, max: raw`\frac{b - a}{2n}` }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },

				// Top
				{ latex: raw`(s(t).x, s(t).y, f_1(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, f_2(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Rectangle bottoms
				{ latex: raw`(X(A) + tX'(A), Y(A) + tY'(A), 0)`, color: desmosRed, parametricDomain: { min: raw`-\frac{b - a}{2n}`, max: raw`\frac{b - a}{2n}` }, secret: false },
				{ latex: raw`(X(A) + tX'(A), Y(A) + tY'(A), 0)`, color: desmosBlue, parametricDomain: { min: raw`-\frac{b - a}{2n}`, max: raw`\frac{b - a}{2n}` }, secret: false },

				// Rectangle tops
				{ latex: raw`(X(A) + tX'(A), Y(A) + tY'(A), f_1(X(A), Y(A)))`, color: desmosRed, parametricDomain: { min: raw`-\frac{b - a}{2n}`, max: raw`\frac{b - a}{2n}` }, secret: false },
				{ latex: raw`(X(A) + tX'(A), Y(A) + tY'(A), f_2(X(A), Y(A)))`, color: desmosBlue, parametricDomain: { min: raw`-\frac{b - a}{2n}`, max: raw`\frac{b - a}{2n}` }, secret: false },

				// Rectangle left sides
				{ latex: raw`(X(A) + (-\frac{b - a}{2n})X'(A), Y(A) + (-\frac{b - a}{2n})Y'(A), tf_1(X(A), Y(A)))`, color: desmosRed, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(X(A) + (-\frac{b - a}{2n})X'(A), Y(A) + (-\frac{b - a}{2n})Y'(A), tf_2(X(A), Y(A)))`, color: desmosBlue, parametricDomain: { min: 0, max: 1 }, secret: true },

				// Rectangle right sides
				{ latex: raw`(X(A) + (\frac{b - a}{2n})X'(A), Y(A) + (\frac{b - a}{2n})Y'(A), tf_1(X(A), Y(A)))`, color: desmosRed, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(X(A) + (\frac{b - a}{2n})X'(A), Y(A) + (\frac{b - a}{2n})Y'(A), tf_2(X(A), Y(A)))`, color: desmosBlue, parametricDomain: { min: 0, max: 1 }, secret: true },
			]
		},

		piecewiseSmoothCurve:
		{
			use3d: true,

			options: { showPlane3D: false, translucentSurfaces: true },

			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },
			
			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{4}(x^2 + 2y^2) - \frac{5}{4}`, color: desmosGray, hidden: true },
				{ latex: raw`f_1(x, y) = f(x, y)\{ f(x, y) \geq 0 \}`, hidden: true, secret: true },
				{ latex: raw`f_2(x, y) = f(x, y)\{ f(x, y) \leq 0 \}`, hidden: true, secret: true },

				{ latex: raw`s_x(t) = \left\{ 0 \leq t \leq \frac{1}{2}: 0, \frac{1}{2} t \leq 1: 2\cos(3\pi (t - \frac{1}{2})) \right\}`, hidden: true },
				{ latex: raw`s_y(t) = \left\{ 0 \leq t \leq \frac{1}{2}: -4t, \frac{1}{2} t \leq 1: 2\sin(3\pi (t - \frac{1}{2})) \right\}`, hidden: true },

				{ latex: raw`s(t) = (s_x(t), s_y(t))`, hidden: true },

				...getDesmosSlider({
					expression: "a = 0",
					min: -5,
					max: "2\\pi",
					secret: true,
				}),
				...getDesmosSlider({
					expression: "b = 1",
					min: "a",
					max: "5",
					secret: true,
				}),

				// We use these to not draw the side boundaries if they overlap.
				{ latex: raw`c = a \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },
				{ latex: raw`d = b \{ \left|s(b) - s(a)\right| > 0 \}`, hidden: true, secret: true },

				// Fills
				{ latex: raw`(s(u).x, s(u).y, vf_1(s(u).x, s(u).y))`, color: desmosRed, parametricDomain3Du: { min: "a", max: "b" }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(s(u).x, s(u).y, vf_2(s(u).x, s(u).y))`, color: desmosBlue, parametricDomain3Du: { min: "a", max: "b" }, parametricDomain3Dv: { min: 0, max: 1 }, secret: true },

				// Top
				{ latex: raw`(s(t).x, s(t).y, f_1(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, f_2(s(t).x, s(t).y))`, color: desmosPurple, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Bottom
				{ latex: raw`(s(t).x, s(t).y, 0f_1(s(t).x, s(t).y))`, color: desmosRed, parametricDomain: { min: "a", max: "b" }, secret: true },
				{ latex: raw`(s(t).x, s(t).y, 0f_2(s(t).x, s(t).y))`, color: desmosBlue, parametricDomain: { min: "a", max: "b" }, secret: true },

				// Side boundaries
				{ latex: raw`(s([c,d]).x, s([c,d]).y, tf_1(s([c,d]).x, s([c,d]).y))`, color: desmosRed, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`(s([c,d]).x, s([c,d]).y, tf_2(s([c,d]).x, s([c,d]).y))`, color: desmosBlue, parametricDomain: { min: 0, max: 1 }, secret: true },
			]
		},

		pathDependence:
		{
			use3d: true,

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -0.5, ymax: 2.5, zmin: -0.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`(1, 1, 0), (0, 1, 1)`, color: desmosPurple },

				{ latex: raw`(\cos(t), 1, \sin(t))`, color: desmosBlue, points: false, lines: true, secret: true, parametricDomain: { min: 0, max: "\\pi/2" } },
				{ latex: raw`(1, 1, 0), (0, 1, 0), (0, 1, 1)`, color: desmosRed, points: false, lines: true, secret: true },
			]
		},

		swimmingInCurrent:
		{
			alwaysDark: true,
			highContrast: true,
			
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

			options: {
				showResetButtonOnGraphpaper: false,
				expressions: false,
			},
			
			expressions:
			[
				{ latex: raw`(1, -2), (1, 2)`, color: desmosBlack, points: false, lines: true, lineWidth: 5 },

				...getDesmosPoint({
					point: ["1", "b"],
					color: desmosPurple,
					dragMode: "Y",
					size: 12,
				}),

				...getDesmosSlider({
					expression: "b = 1",
					min: -2,
					max: 2,
					secret: false,
				}),

				...getDesmosVector({
					from: ["1", "b"],
					to: ["1 - \\frac{b}{2}", "b - \\frac{1}{2}"],
					color: desmosPurple,
					arrowSize: "0.1",
					lineWidth: 5
				}),
			]
		},
	});

	

	createEmphemeralApplet($("#swimmingInCurrent-canvas"), (canvas) =>
	{
		const applet = new VectorField({
			canvas,
			useFullscreenButton: false,
			useResetButton: false,
			transparency: true,
			onDrawFrame
		});

		applet.allowFullscreenWithKeyboard = false;

		applet.loadPromise.then(() =>
		{
			applet.run({
				resolution: 500,
				maxParticles: 5000,
				generatingCode: "(-y * 0.5, -x * 0.5)",
				dt: .003,
				worldWidth: 6,
				hue: 0.6,
				brightness: 0.8,
				darkenWhenSlow: true,
			});
		});

		function onDrawFrame()
		{
			const bounds = getDesmosBounds(desmosGraphs.swimmingInCurrent);

			applet.wilson.resizeWorld({
				minX: bounds.xmin,
				maxX: bounds.xmax,
				minY: bounds.ymin,
				maxY: bounds.ymax,
			});
		}

		return applet;
	});
}