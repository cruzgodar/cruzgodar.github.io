import { VectorFields } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			directionField:
			{
				bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

				expressions:
				[
					{ latex: raw`f(t, y) = \frac{\sin(y)}{t^2 + 1}` },
					{ latex: raw`y(t) = 2\arccot(e^{c - \arctan(t)})`, color: desmosBlue },
					{ latex: raw`c = 0`, sliderBounds: { min: -5, max: 5 } },
					{ latex: raw`n = 10`, sliderBounds: { min: 1, max: 20, step: 1 } },
					{ latex: raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true },
					{ latex: raw`A = [-n, -n + 1, ..., n]`, secret: true },
					{ latex: raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true },
					{ latex: raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true },
					{ latex: raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true },
				]
			},

			directionField2:
			{
				bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

				expressions:
				[
					{ latex: raw`f(t, y) = \frac{1}{50}(y^2 - 4)\left|y - 4\right|(t - 3)` },
					{ latex: raw`n = 10`, sliderBounds: { min: 1, max: 20, step: 1 } },
					{ latex: raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true },
					{ latex: raw`A = [-n, -n + 1, ..., n]`, secret: true },
					{ latex: raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true },
					{ latex: raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true },
					{ latex: raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();



	const outputCanvas = $("#vector-field-canvas");

	const applet = new VectorFields({ canvas: outputCanvas });

	applet.loadPromise.then(() =>
	{
		applet.run({
			generatingCode: "(1.0, sin(y) / (x*x + 1.0))",
			worldWidth: 8
		});
		applet.pauseWhenOffscreen();
	});
}