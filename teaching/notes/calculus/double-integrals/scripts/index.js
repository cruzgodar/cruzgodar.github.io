import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosBlue3d,
	desmosGray3d,
	desmosGreen3d,
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
						min: -2,
						max: 2,
						secret: false,
					}),

					{ latex: raw`0 \leq z \leq f(x, y) \left\{ x = x_0 \right\} \left\{ c \leq y \leq d \right\}`, color: desmosRed3d },
					{ latex: raw`f(x, y) \leq z \leq 0 \left\{ x = x_0 \right\} \left\{ c \leq y \leq d \right\}`, color: desmosBlue3d },
					{ latex: raw`( t, -2, \int_c^d f(t, y) dy )`, color: desmosGray3d, parametricDomain: { min: "a", max: "b" } },
					{ latex: raw`( x_0, -2, \int_c^d f(x_0, y) dy )`, color: desmosGreen3d, secret: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}