import {
    createDesmosGraphs,
    desmosBlue,
    desmosPurple,
    setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			secantLines:
			{
				bounds: { xmin: -2.5, xmax: 2.5, ymin: -1.5, ymax: 3.5 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`a = 1` },
					{ latex: raw`h = .1`, sliderBounds: { min: 0, max: 10 } },
					{ latex: raw`m = \frac{f(a + h) - f(a)}{h}`, secret: true },
					{ latex: raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: raw`(a + h, f(a + h))`, color: desmosBlue, secret: true },
					{ latex: raw`y - f(a) = m(x - a)`, color: desmosBlue, secret: true },
				]
			},



			tangentLines:
			{
				bounds: { xmin: -2.5, xmax: 2.5, ymin: -1.5, ymax: 3.5 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`a = 1` },
					{ latex: raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: raw`y - f(a) = f'(a)(x - a)`, color: desmosBlue, secret: true },
				]
			},



			derivativeExample:
			{
				bounds: { xmin: -2.5, xmax: 2.5, ymin: -1.5, ymax: 3.5 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`f'(x)`, color: desmosBlue },
				]
			},



			derivativeExample2:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`f(x) = \sin(x) + 1 - .1x^2`, color: desmosPurple },
					{ latex: raw`f'(x)`, color: desmosBlue, hidden: true },
				]
			},



			derivativeExample3:
			{
				bounds: { xmin: -1.5, xmax: 3, ymin: -2, ymax: 2.5 },

				expressions:
				[
					{ latex: raw`f(x) = x^3 + 1 - 2x^2`, color: desmosPurple },
				]
			},



			derivativeExample4:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`f(x) = \left|x\right|`, color: desmosPurple },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();
}