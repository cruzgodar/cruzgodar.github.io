import { showPage } from "../../../../../../scripts/src/loadPage.js";
import { VectorFields } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosPurple,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			vectorField:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: String.raw`f(x_1, x_2) = [ x_1 + x_2, -2x_1 + 3x_2 ]` },

					{ latex: String.raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true },

					{ latex: String.raw`z = -2.86`, secret: true },
					{ latex: String.raw`k = .33`, secret: true },

					{ latex: String.raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: String.raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: String.raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: String.raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: String.raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: String.raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: String.raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: String.raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: String.raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },

					{ latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
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
			generatingCode: "(.23 * (x + y), .23 * (-2.0 * x + 3.0 * y))",
		});
		applet.pauseWhenOffscreen();
	});



	showPage();
}