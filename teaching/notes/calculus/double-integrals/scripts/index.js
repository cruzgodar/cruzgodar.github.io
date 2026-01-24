import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosBlue3d,
	desmosGray3d,
	desmosOrange3d,
	desmosPurple,
	desmosPurple3d,
	desmosRed,
	desmosRed3d,
	getDesmosPoint,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			riemannSum:
			{
				bounds: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 },

				expressions:
				[
					{ latex: raw`f(x) = 1 + \frac{1}{4}(\sin(x) + \cos(2x)) - \frac{(x+2)^3}{150} - \frac{x^2}{10}`, color: desmosPurple },
					{ latex: raw`a = -5`, sliderBounds: { min: -10, max: "b" } },
					{ latex: raw`b = 5`, sliderBounds: { min: -10, max: 10 } },
					{ latex: raw`n = 10`, sliderBounds: { min: 2, max: 100, step: 1 } },

					...getDesmosPoint({
						point: ["a", "f(a)"],
						color: desmosBlack,
						dragMode: "X",
						secret: false,
					}),
					...getDesmosPoint({
						point: ["b", "f(b)"],
						color: desmosBlack,
						dragMode: "X",
						secret: false,
					}),
					
					{ latex: raw`\sum_{i = 1}^n s f(L[i])` },
					{ latex: raw`\sum_{i = 1}^n s f(R[i])` },
					
					{ latex: raw`s = \frac{b - a}{n}`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
					{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },

					{ latex: raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosRed, secret: true },
					{ latex: raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true },
					{ latex: raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true },

					{ latex: raw`f(L) \leq y \leq 0 \{ L \leq x \leq R \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = L \{ f(L) \leq y \leq 0 \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = R \{ f(L) \leq y \leq 0 \}`, color: desmosBlue, secret: true }
				]
			},

			cartesianProductRectangle:
			{
				bounds: { xmin: -1, xmax: 6, ymin: -1, ymax: 6 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`a = 1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`b = 2`,
						min: "a",
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`c = 3`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`d = 4`,
						min: "c",
						max: 5,
						secret: false,
					}),

					{ latex: raw`a \leq x \leq b`, color: desmosBlue, fillOpacity: 0.2, },
					{ latex: raw`a \leq x \leq b \{ c \leq y \leq d \}`, color: desmosPurple },
					{ latex: raw`c \leq y \leq d`, color: desmosRed, fillOpacity: 0.2, },
					{ latex: raw`c \leq y \leq d \{ a \leq x \leq b \}`, color: desmosPurple },

					...getDesmosPoint({
						point: ["a", "c"],
						color: desmosBlack,
						dragMode: "XY",
						secret: false,
					}),
					...getDesmosPoint({
						point: ["b", "d"],
						color: desmosBlack,
						dragMode: "XY",
						secret: false,
					}),
				]
			},

			riemannSum3d:
			{
				use3d: true,
				
				bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3, zmin: -3, zmax: 3 },

				options: {
					translucentSurfaces: true,
					showPlane3D: false,
				},

				expressions:
				[
					{ latex: raw`f(x, y) = \sin(x) + \cos(y) + \frac{(x + y)^3}{100}`, color: desmosPurple3d },

					...getDesmosSlider({
						expression: raw`m = 3`,
						min: 1,
						max: 15,
						step: 1,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`n = 4`,
						min: 1,
						max: 15,
						step: 1,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`a = -1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`b = 2`,
						min: "a",
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`c = -2`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`d = 2`,
						min: "c",
						max: 5,
						secret: false,
					}),

					// bounding rectangle
					{ latex: raw`(t, [c, d], 0)`, color: desmosGray3d, parametricDomain: { min: "a", max: "b" }, secret: true },
					{ latex: raw`([a, b], t, 0)`, color: desmosGray3d, parametricDomain: { min: "c", max: "d" }, secret: true },

					{ latex: raw`s_x = \frac{b - a}{m}`, secret: true },
					{ latex: raw`s_y = \frac{d - c}{n}`, secret: true },

					{ latex: raw`X = [a, a + s_x, ..., b]`, secret: true },
					{ latex: raw`Y = [c, c + s_y, ..., d]`, secret: true },

					{ latex: raw`L_x = [a, a + s_x, ..., b - s_x]`, secret: true },
					{ latex: raw`R_x = [a + s_x, a + 2s_x, ..., b]`, secret: true },
					{ latex: raw`L_y = [c, c + s_y, ..., d - s_y]`, secret: true },
					{ latex: raw`R_y = [c + s_y, c + 2s_y, ..., d]`, secret: true },

					{ latex: raw`M_x = [a + \frac{s_x}{2}, a + \frac{3s_x}{2}, ..., b - \frac{s_x}{2}]`, secret: true },
					{ latex: raw`M_y = [c + \frac{s_y}{2}, c + \frac{3s_y}{2}, ..., d - \frac{s_y}{2}]`, secret: true },

					// construct a 1D array of length m*n that contains all the points in M_x x M_y

					{ latex: raw`L = [0, 1, ... mn - 1]`, secret: true },
					{ latex: raw`I = \floor(\frac{L}{n}) + 1`, secret: true },
					{ latex: raw`J = \mod(L, n) + 1`, secret: true },

					{ latex: raw`0 \leq z \leq f(M_x[I], M_y[J]) \{ L_x[I] \leq x \leq R_x[I] \} \{ L_y[J] \leq y \leq R_y[J] \}`, color: desmosRed3d, secret: true },
					{ latex: raw`f(M_x[I], M_y[J]) \leq z \leq 0 \{ L_x[I] \leq x \leq R_x[I] \} \{ L_y[J] \leq y \leq R_y[J] \}`, color: desmosBlue3d, secret: true },
				]
			},

			areaCrosssections:
			{
				use3d: true,
				
				bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -3, zmax: 10 },

				options: {
					translucentSurfaces: true,
					showPlane3D: false,
				},

				expressions:
				[
					{ latex: raw`f(x, y) = x^2 + xy + xy^2 - 1 \left\{ a \leq x \leq b \right\} \left\{ c \leq y \leq d \right\}`, color: desmosPurple3d },

					...getDesmosSlider({
						expression: raw`a = -2`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`b = 2`,
						min: "a",
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`c = -1`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`d = 1`,
						min: "c",
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_0 = 1`,
						min: "a",
						max: "b",
						secret: false,
					}),

					{ latex: raw`0 \leq z \leq f(x, y) \left\{ x = x_0 \right\} \left\{ c \leq y \leq d \right\}`, color: desmosRed3d },
					{ latex: raw`f(x, y) \leq z \leq 0 \left\{ x = x_0 \right\} \left\{ c \leq y \leq d \right\}`, color: desmosBlue3d },

					// Red and blue regions bottom boundary
					{ latex: raw`(x_0, t, 0) \left\{ f(x_0, t) \geq 0 \right\}`, color: desmosRed3d, parametricDomain: { min: "c", max: "d" }, secret: true },
					{ latex: raw`(x_0, t, 0) \left\{ f(x_0, t) \leq 0 \right\}`, color: desmosBlue3d, parametricDomain: { min: "c", max: "d" }, secret: true },

					// Red and blue regions side boundary
					{ latex: raw`(x_0, c, t)`, color: desmosRed3d, parametricDomain: { min: "0", max: "f(x_0, c)" }, secret: true },
					{ latex: raw`(x_0, c, t)`, color: desmosBlue3d, parametricDomain: { min: "f(x_0, c)", max: "0" }, secret: true },

					{ latex: raw`(x_0, d, t)`, color: desmosRed3d, parametricDomain: { min: "0", max: "f(x_0, d)" }, secret: true },
					{ latex: raw`(x_0, d, t)`, color: desmosBlue3d, parametricDomain: { min: "f(x_0, d)", max: "0" }, secret: true },

					{ latex: raw`(x_0, t, f(x_0, t)) \left\{ f(x_0, t) \geq 0 \right\}`, color: desmosRed3d, parametricDomain: { min: "c", max: "d" }, secret: true },
					{ latex: raw`(x_0, t, f(x_0, t)) \left\{ f(x_0, t) \leq 0 \right\}`, color: desmosBlue3d, parametricDomain: { min: "c", max: "d" }, secret: true },

					{ latex: raw`( t, -2, \int_c^d f(t, y) dy )`, color: desmosGray3d, parametricDomain: { min: "a", max: "b" } },
					{ latex: raw`( x_0, -2, \int_c^d f(x_0, y) dy )`, color: desmosOrange3d, secret: true },
				]
			},

			regions2d:
			{
				bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`a = -2`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`b = 2`,
						min: "a",
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`x_0 = 1`,
						min: "a",
						max: "b",
						secret: false,
					}),

					{ latex: raw`c(x) = -1`, hidden: true },
					{ latex: raw`d(x) = 1`, hidden: true },

					{ latex: raw`c(x) < y < d(x) \left\{ a < x < b \right\}`, color: desmosBlack, fillOpacity: 0.15, },
					{ latex: raw`d(x) < y < c(x) \left\{ a < x < b \right\}`, color: desmosBlack, fillOpacity: 0.15, },

					{ latex: raw`x = [a, b] \left\{ c([a, b]) \leq y \leq d([a, b]) \right\}`, color: desmosBlue, lineWidth: 5, secret: true },
					{ latex: raw`x = [a, b] \left\{ d([a, b]) \leq y \leq c([a, b]) \right\}`, color: desmosBlue, lineWidth: 5, secret: true },

					{ latex: raw`y = [c(x), d(x)] \left\{ a \leq x \leq b \right\}`, color: desmosRed, lineWidth: 5, secret: true },

					{ latex: raw`x = x_0 \left\{ c(x_0) \leq y \leq d(x_0) \right\}`, color: desmosPurple, lineWidth: 5, secret: true },
					{ latex: raw`x = x_0 \left\{ d(x_0) \leq y \leq c(x_0) \right\}`, color: desmosPurple, lineWidth: 5, secret: true },
				]
			},

			regions2d2:
			{
				bounds: { xmin: -5, xmax: 1, ymin: -3, ymax: 3 },

				expressions:
				[
					...getDesmosSlider({
						expression: raw`c = -5`,
						min: -5,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`d = 5`,
						min: "c",
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`y_0 = 0.5`,
						min: "c",
						max: "d",
						secret: false,
					}),

					{ latex: raw`a(y) = y^4 - 4`, hidden: true },
					{ latex: raw`b(y) = -3y^2`, hidden: true },

					{ latex: raw`a(y) < x < b(y) \left\{ -1 < y < 1 \right\}`, color: desmosBlack, fillOpacity: 0.15, },
					{ latex: raw`b(y) < x < a(y) \left\{ -1 < y < 1 \right\}`, color: desmosBlack, fillOpacity: 0.15, },

					{ latex: raw`y = [c, d] \left\{ a([c, d]) \leq x \leq b([c, d]) \right\}`, color: desmosBlue, secret: true },
					{ latex: raw`y = [c, d] \left\{ b([c, d]) \leq x \leq a([c, d]) \right\}`, color: desmosBlue, secret: true },

					{ latex: raw`x = [a(y), b(y)] \left\{ c \leq y \leq d \right\}`, color: desmosRed, secret: true },

					{ latex: raw`y = y_0 \left\{ a(y_0) \leq x \leq b(y_0) \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`y = y_0 \left\{ b(y_0) \leq x \leq a(y_0) \right\}`, color: desmosPurple, secret: true },
				]
			},

			polarCoordinates:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				options: {
					polarMode: true,
				},

				expressions:
				[
					...getDesmosSlider({
						expression: raw`r_0 = 2`,
						min: 0,
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`\theta_0 = 1`,
						min: 0,
						max: "2\\pi",
						secret: false,
					}),

					{ latex: raw`(0, 0), (r_0 \cos(\theta_0), r_0 \sin(\theta_0))`, color: desmosBlue, points: false, lines: true, secret:true },

					{ latex: raw`r = 0.25 \{ 0 \leq \theta \leq \theta_0 \}`, color: desmosBlue, secret: true },

					{ latex: raw`(r_0 \cos(\theta_0), r_0 \sin(\theta_0))`, color: desmosPurple, dragMode: "NONE" },
				]
			},

			polarRectangle:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				options: {
					polarMode: true,
				},

				expressions:
				[
					...getDesmosSlider({
						expression: raw`m = 3`,
						min: 1,
						max: 15,
						step: 1,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`n = 4`,
						min: 1,
						max: 15,
						step: 1,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`a = 1`,
						min: 0,
						max: "2\\pi",
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`b = 2.5`,
						min: "a",
						max: "2\\pi",
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`c = 1`,
						min: 0,
						max: 5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: raw`d = 3`,
						min: "c",
						max: 5,
						secret: false,
					}),

					...getDesmosSlider({
						expression: raw`\theta_0 = 1.5`,
						min: "a",
						max: "b",
						secret: false,
					}),

					{ latex: raw`T(x, y) = \mod(\arctan(y, x) + 2\pi, 2\pi)`, hidden: true, secret: true },

					{ latex: raw`\sqrt{x^2 + y^2} < d \{ a \leq T(x, y) \leq b \} \{ c < \sqrt{x^2 + y^2} \}`, color: desmosBlack, fillOpacity: 0.15, secret: true },

					{ latex: raw`[a, b] = T(x, y) \left\{ c \leq \sqrt{x^2+y^2} \leq d \right\}`, color: desmosBlue, lineWidth: 5, secret: true },

					{ latex: raw`\sqrt{x^2+y^2} = [c, d] \left\{ a \leq T(x, y) \leq b \right\}`, color: desmosRed, lineWidth: 5, secret: true },

					{ latex: raw`\theta_0 = T(x, y) \left\{ c \leq \sqrt{x^2+y^2} \leq d \right\}`, color: desmosPurple, lineWidth: 5, secret: true },

					{ latex: raw`[a, a + \frac{b - a}{m}, ..., b] = T(x, y) \left\{ c \leq \sqrt{x^2+y^2} \leq d \right\}`, color: desmosBlue, lineWidth: 5, secret: true },

					{ latex: raw`\sqrt{x^2+y^2} = [c, + \frac{d - c}{n}, ..., d] \left\{ a \leq T(x, y) \leq b \right\}`, color: desmosRed, lineWidth: 5, secret: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}