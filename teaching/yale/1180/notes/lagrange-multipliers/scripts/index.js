import {
	createDesmosGraphs,
	desmosBlue,
	desmosBlue3d,
	desmosOrange3d,
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
			levelCurves:
			{
				bounds: { xmin: -5, xmax: 25, ymin: -5, ymax: 25 },

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

				bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -0.5, zmax: 4 },

				expressions:
				[
					{ latex: raw`f(x, y) = 2x^2+\sqrt{3}xy+3y^2 `, color: desmosPurple3d },

					{ latex: raw`2x^2+\sqrt{3}xy+3y^2\left\{ x^2 + y^2 = 1\right\}`, color: desmosBlue3d },

					{ latex: raw`(\frac{1}{2}, \frac{\sqrt{3}}{2}, f(\frac{1}{2}, \frac{\sqrt{3}}{2}) ), (-\frac{1}{2}, -\frac{\sqrt{3}}{2}, f(-\frac{1}{2}, -\frac{\sqrt{3}}{2}) )`, color: desmosOrange3d },

					{ latex: raw`(-\frac{\sqrt{3}}{2}, \frac{1}{2}, f(-\frac{\sqrt{3}}{2}, \frac{1}{2}) ), (\frac{\sqrt{3}}{2}, -\frac{1}{2}, f(\frac{\sqrt{3}}{2}, -\frac{1}{2}) )`, color: desmosRed3d },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}