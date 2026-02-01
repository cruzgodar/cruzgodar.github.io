import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { createEmphemeralApplet } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs,
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
				{ latex: raw`f_1(x, y) = x + y`, hidden: true },
				{ latex: raw`f_2(x, y) = -2x + 3y`, hidden: true },

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
	});



	createEmphemeralApplet($("#vector-field-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: "(.23 * (x + y), .23 * (-2.0 * x + 3.0 * y))",
				worldWidth: 5
			});
		});

		return applet;
	});
}