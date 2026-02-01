import { VectorField } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosGray,
	desmosPurple,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		vectorField:
		{
			bounds: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 },
			
			expressions:
			[
				{ latex: raw`f_1(x, y) = x + 3y`, hidden: true },
				{ latex: raw`f_2(x, y) = 4x + 2y`, hidden: true },

				...getDesmosSlider({
					expression: "n = 12",
					min: 1,
					max: 20,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 1",
					min: 0.5,
					max: 2,
					secret: false
				}),

				{ latex: raw`A = [(a, b) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(f_1(a, b), f_2(a, b)) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`A + \frac{ts}{25}B`, color: desmosPurple, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`S = [\arctan(f_2(a, b), f_1(a, b)) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`M = [\left|(f_2(a, b), f_1(a, b))\right| \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`L = \frac{M}{50}`, hidden: true, secret: true },

				{ latex: raw`T_1 = -(.35\cos(S + 0.5), .35\sin(S + 0.5))`, hidden: true, secret: true },
				{ latex: raw`T_2 = -(.35\cos(S - 0.5), .35\sin(S - 0.5))`, hidden: true, secret: true },
				
				{ latex: raw`A + \frac{s}{25}B + tsL(T_1)`, color: desmosPurple, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`A + \frac{s}{25}B + tsL(T_2)`, color: desmosPurple, parametricDomain: { min: 0, max: 1 }, secret: true },
			]
		},

		vectorField3d:
		{
			use3d: true,

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },
			
			expressions:
			[
				{ latex: raw`f_1(x, y, z) = x + 3y`, hidden: true },
				{ latex: raw`f_2(x, y, z) = y^2 + z`, hidden: true },
				{ latex: raw`f_3(x, y, z) = x + z^2`, hidden: true },

				...getDesmosSlider({
					expression: "n = 2",
					min: 1,
					max: 5,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 1.5",
					min: 0.5,
					max: 2,
					secret: false
				}),

				{ latex: raw`A = [(a, b, c) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n], c = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(f_1(a, b, c), f_2(a, b, c), f_3(a, b, c)) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n], c = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`\vector(A, A + \frac{s}{25}B)`, color: desmosPurple, secret: true },
			]
		},

		conservativeVectorField1:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },
			
			expressions:
			[
				{ latex: raw`g(x, y) = \frac{x^2}{2} - \frac{y^2}{2}`, color: desmosGray },
				{ latex: raw`g_x(x, y) = \frac{d}{dx}(g(x, y))`, hidden: true },
				{ latex: raw`g_y(x, y) = \frac{d}{dy}(g(x, y))`, hidden: true },

				...getDesmosSlider({
					expression: "n = 2",
					min: 1,
					max: 5,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 1",
					min: 0.5,
					max: 2,
					secret: false
				}),

				{ latex: raw`A = [(a, b, g(a, b)) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(g_x(a, b), g_y(a, b), g_x(a, b)^2 + g_y(a, b)^2) \for a = [-n, -n+1, ..., n], b = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`\vector(A, A + \frac{s}{10}B)`, color: desmosPurple, secret: true },
			]
		},

		conservativeVectorField2:
		{
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },
			
			expressions:
			[
				{ latex: raw`\frac{x^2}{2} - \frac{y^2}{2} = c`, secret: true },
				{ latex: raw`c = [-5, -4, ..., 5]`, hidden: true, secret: true },
			]
		},
	});



	const vectorFieldCanvas = $("#vectorField-canvas");

	const applet = new VectorField({ canvas: vectorFieldCanvas });

	applet.loadPromise.then(() =>
	{
		applet.run({
			generatingCode: "((x + 3.0 * y) / 8.0, (4.0 * x + 2.0 * y) / 8.0)",
			worldWidth: 5
		});
		applet.pauseWhenOffscreen();
	});



	const vectorFieldCanvas2 = $("#vectorField2-canvas");

	const applet2 = new VectorField({ canvas: vectorFieldCanvas2 });

	applet2.loadPromise.then(() =>
	{
		applet2.run({
			generatingCode: "(x, -y)",
			dt: .002,
			worldWidth: 3
		});
		applet2.pauseWhenOffscreen();
	});



	const vectorFieldCanvas3 = $("#vectorField3-canvas");

	const applet3 = new VectorField({ canvas: vectorFieldCanvas3 });

	applet3.loadPromise.then(() =>
	{
		applet3.run({
			generatingCode: "(-y, x)",
			dt: .002,
			worldWidth: 3
		});
		applet3.pauseWhenOffscreen();
	});



	const vectorFieldCanvas4 = $("#conservativeVectorField2-canvas");

	const applet4 = new VectorField({ canvas: vectorFieldCanvas4, transparency: true });

	applet4.loadPromise.then(() =>
	{
		applet4.run({
			generatingCode: "(x, -y)",
			dt: .002,
			worldWidth: 3
		});
		applet4.pauseWhenOffscreen();
	});
}