import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { createEmphemeralApplet } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		directionField:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{30}xy` },
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
				{ latex: raw`f(x, y) = \frac{1}{20}(x^2 - 1)\sin(y)` },
				{ latex: raw`n = 10`, sliderBounds: { min: 1, max: 20, step: 1 } },
				{ latex: raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true },
				{ latex: raw`A = [-n, -n + 1, ..., n]`, secret: true },
				{ latex: raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true },
				{ latex: raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true },
				{ latex: raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true },
			]
		},



		deSolution:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x, y) = xy` },
				{ latex: raw`c = .1`, sliderBounds: { min: -1, max: 1 } },
				{ latex: raw`y = ce^{x^2}`, color: desmosBlue },
				{ latex: raw`n = 10`, sliderBounds: { min: 1, max: 20, step: 1 } },
				{ latex: raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true },
				{ latex: raw`A = [-n, -n + 1, ..., n]`, secret: true },
				{ latex: raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true },
				{ latex: raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true },
				{ latex: raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true },
			]
		},



		directionField3:
		{
			bounds: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{20}(x - 3)(y^2 - 4)` },
				{ latex: raw`n = 10`, sliderBounds: { min: 1, max: 20, step: 1 } },
				{ latex: raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true },
				{ latex: raw`A = [-n, -n + 1, ..., n]`, secret: true },
				{ latex: raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true },
				{ latex: raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true },
				{ latex: raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true },
			]
		},



		directionField4:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{\sin(y)}{x^2 + 1}` },
				{ latex: raw`n = 10`, sliderBounds: { min: 1, max: 20, step: 1 } },
				{ latex: raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true },
				{ latex: raw`A = [-n, -n + 1, ..., n]`, secret: true },
				{ latex: raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true },
				{ latex: raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true },
				{ latex: raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true },
			]
		},
	});



	createEmphemeralApplet($("#vector-field-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: "(1.0, sin(y) / (x*x + 1.0))",
				worldWidth: 8
			});
		});

		return applet;
	});
}