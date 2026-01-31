import { VectorField } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosPurple,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			vectorField:
			{
				bounds: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 },
				
				expressions:
				[
					{ latex: raw`f(x, y) = [ x + 3y, 4x + 2y ]` },

					{ latex: raw`F(x, y) = \frac{1}{2.5} f(x, y)`, secret: true },

					{ latex: raw`z = -2.86`, secret: true },
					{ latex: raw`k = .33`, secret: true },
					{ latex: raw`n = 10`, secret: true },

					...getDesmosSlider({
						expression: "s = 1",
						min: 0.5,
						max: 2,
						secret: false
					}),

					{ latex: raw`A(t) = \floor(t) - n\floor(\frac{t}{n})`, hidden: true, secret: true },
					{ latex: raw`B(t) = \floor(\frac{t}{n})`, hidden: true, secret: true },
					{ latex: raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: raw`(A(t) - n + s/10(t - \floor(t))F(A(t) - n, B(t))[1], B(t) + s/10(t - \floor(t))F(A(t) - n, B(t))[2])`, color: desmosPurple, parametricDomain: { min: "-n^2", max: "n^2" }, secret: true },
					{ latex: raw`(A(t) + s/10(t - \floor(t))F(A(t), B(t))[1], B(t) + s/10(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, parametricDomain: { min: "-n^2", max: "n^2" }, secret: true },

					{ latex: raw`(A(t) - n + s/10F(A(t) - n, B(t))[1] + k(t - \floor(t))R_1(A(t) - n, B(t)), B(t) + s/10F(A(t) - n, B(t))[2] + k(t - \floor(t))R_2(A(t) - n, B(t)))`, color: desmosPurple, parametricDomain: { min: "-n^2", max: "n^2" }, secret: true },
					{ latex: raw`(A(t) + s/10F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + s/10F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, parametricDomain: { min: "-n^2", max: "n^2" }, secret: true },
					{ latex: raw`(A(t) - n + s/10F(A(t) - n, B(t))[1] + k(t - \floor(t))L_1(A(t) - n, B(t)), B(t) + s/10F(A(t) - n, B(t))[2] + k(t - \floor(t))L_2(A(t) - n, B(t)))`, color: desmosPurple, parametricDomain: { min: "-n^2", max: "n^2" }, secret: true },
					{ latex: raw`(A(t) + s/10F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + s/10F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, parametricDomain: { min: "-n^2", max: "n^2" }, secret: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();



	const outputCanvas = $("#vectorField-canvas");

	const applet = new VectorField({ canvas: outputCanvas });

	applet.loadPromise.then(() =>
	{
		applet.run({
			generatingCode: "((x + 3.0 * y) / 8.0, (4.0 * x + 2.0 * y) / 8.0)",
		});
		applet.pauseWhenOffscreen();
	});
}