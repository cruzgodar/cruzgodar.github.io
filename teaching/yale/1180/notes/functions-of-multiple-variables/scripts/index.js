import {
	createDesmosGraphs,
	desmosBlue,
	desmosBlue3d,
	desmosPurple,
	desmosPurple3d,
	desmosRed3d,
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
			intersectingRegion:
			{
				bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5 },

				expressions:
				[
					{ latex: raw`y \geq \left|x\right|\left\{ x^2 + y^2 \leq 1 \right\}`, color: desmosPurple, secret: true },

					{ latex: raw`x^2 + y^2 = 1 \left\{ y \geq \left|x\right| \right\}`, color: desmosPurple, secret: true },
				]
			},

			wireframe:
			{
				use3d: true,

				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -5, zmax: 5 },

				expressions:
				[
					{ latex: raw`(t, 0, \sqrt{4 - t^2})`, parametricDomain: { min: -2, max: 2 }, color: desmosPurple3d, secret: true },

					{ latex: raw`(0, t, \sqrt{4 - t^2})`, parametricDomain: { min: -2, max: 2 }, color: desmosPurple3d, secret: true },

					{ latex: raw`(2\cos(t), 2\sin(t), 0)`, parametricDomain: { min: 0, max: 2 * Math.PI }, color: desmosPurple3d, secret: true },

					{ latex: raw`f(x, y) = \sqrt{4 - x^2 - y^2}`, color: desmosBlue3d, hidden: true },
				]
			},

			wireframe2:
			{
				use3d: true,

				bounds: { xmin: -2, xmax: 15, ymin: -2, ymax: 15, zmin: -20, zmax: 40 },

				expressions:
				[
					{ latex: raw`(t, 0, 21-(t-1)^2)`, parametricDomain: { min: 0, max: 10 }, color: desmosPurple3d, secret: true },

					{ latex: raw`(0, t, 24-(t-2)^2)`, parametricDomain: { min: 0, max: 10 }, color: desmosPurple3d, secret: true },

					{ latex: raw`(x-1)^2+(y-2)^2=25 \left\{ x \geq 0 \right\}\left\{ y \geq 0 \right\}`, parametricDomain: { min: 0, max: 2 * Math.PI }, color: desmosPurple3d, secret: true },

					{ latex: raw`f(x, y) = 25-(x-1)^2-(y-2)^2\left\{ x \geq 0 \right\}\left\{ y \geq 0 \right\}`, color: desmosBlue3d, hidden: true },

					{ latex: raw`(1, 2, 25)`, color: desmosRed3d, hidden: true },
				]
			},

			levelCurves:
			{
				bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 = c`, color: desmosBlue },

					{ latex: raw`c = [ 0, 1, ..., 10 ]`, },

					{ latex: raw`(0, 0)`, color: desmosBlue, secret: true },
				]
			},

			levelCurves3d:
			{
				use3d: true,

				bounds: { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5, zmin: -2, zmax: 12 },

				expressions:
				[
					{ latex: raw`z = x^2 + y^2 \left\{ z \leq 10 \right\}`, color: desmosPurple3d },

					{ latex: raw`x^2 + y^2 = c \left\{ z = c \right\}`, color: desmosBlue3d },

					{ latex: raw`c = [ 0, 1, ..., 10 ]`, },

					{ latex: raw`(0, 0, 0)`, color: desmosBlue3d, secret: true },
				]
			},

			levelCurves2:
			{
				bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4 },

				expressions:
				[
					{ latex: raw`x^2 - y^2 = c`, color: desmosBlue, secret: true },

					...getDesmosSlider({
						expression: raw`c = 0`,
						min: -4,
						max: 4,
						step: 1,
						secret: false,
					}),
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}