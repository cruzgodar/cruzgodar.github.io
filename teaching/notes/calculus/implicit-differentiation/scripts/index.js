import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
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
			circle:
			{
				bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2 },

				expressions:
				[
					{ latex: raw`x^2+y^2 = 1`, color: desmosPurple },
					{ latex: raw`a = .5`, sliderBounds: { min: -1, max: 1 } },
					{ latex: raw`f(x) = \sqrt{1 - x^2}`, hidden: true, secret: true },
					{ latex: raw`(a, f(a))`, secret: true, color: desmosBlue },
					{ latex: raw`(a, -f(a))`, secret: true, color: desmosBlue },
					{ latex: raw`y = f(a) + f'(a)(x - a)`, color: desmosRed, secret: true },
					{ latex: raw`y = -f(a) + -f'(a)(x - a)`, color: desmosRed, secret: true },
					{ latex: raw`x = 1 \{ a = 1 \}`, color: desmosRed, secret: true },
					{ latex: raw`x = -1 \{ a = -1 \}`, color: desmosRed, secret: true },
				]
			},

			ellipse:
			{
				bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

				expressions:
				[
					{ latex: raw`x^2 - xy + y^2 = 3`, color: desmosPurple },
					{ latex: raw`a = .5`, sliderBounds: { min: -2, max: 2 } },
					{ latex: raw`f_1(x) = \frac{1}{2}(x + \sqrt{3}\sqrt{4 - x^2})`, hidden: true, secret: true },
					{ latex: raw`f_2(x) = \frac{1}{2}(x - \sqrt{3}\sqrt{4 - x^2})`, hidden: true, secret: true },
					{ latex: raw`(a, f_1(a))`, secret: true, color: desmosBlue },
					{ latex: raw`(a, f_2(a))`, secret: true, color: desmosBlue },
					{ latex: raw`y = f_1(a) + f_1'(a)(x - a)`, color: desmosRed, secret: true },
					{ latex: raw`y = f_2(a) + f_2'(a)(x - a)`, color: desmosRed, secret: true },
					{ latex: raw`x = 2 \{ a = 2 \}`, color: desmosRed, secret: true },
					{ latex: raw`x = -2 \{ a = -2 \}`, color: desmosRed, secret: true },
				]
			},

			braids:
			{
				bounds: {
					xmin: -3.5 * Math.PI,
					xmax: 3.5 * Math.PI,
					ymin: -3.5 * Math.PI,
					ymax: 3.5 * Math.PI
				},

				expressions:
				[
					{ latex: raw`\cos(\sin(y)) = \cos(x)`, color: desmosPurple }
				]
			},

			sinThing:
			{
				bounds: { xmin: -40, xmax: 40, ymin: -40, ymax: 40 },

				expressions:
				[
					{ latex: raw`x\sin(y) = y`, color: desmosPurple }
				]
			},

			implicitLogEquation:
			{
				bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2 },

				expressions:
				[
					{ latex: raw`\ln(x^2 + y^2) + 2^x - y^3 = c`, color: desmosPurple },

					...getDesmosSlider({
						expression: raw`c = 0`,
						min: -5,
						max: 5,
						secret: false,
					}),
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}