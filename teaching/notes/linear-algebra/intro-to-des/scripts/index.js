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
			vectorField:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x_1, x_2) = [ x_1 + 3x_2, 4x_1 + 2x_2 ]` },

					{ latex: raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true },

					{ latex: raw`(3c_1 e^{5t} - c_2 e^{-t}, 4c_1 e^{5t} + c_2 e^{-t})`, color: desmosBlue, parametricDomain: { min: -1000, max: 1000 } },
					{ latex: raw`c_1 = 1`, sliderBounds: { min: -5, max: 5 } },
					{ latex: raw`c_2 = 1`, sliderBounds: { min: -5, max: 5 } },

					{ latex: raw`z = -2.86`, secret: true },
					{ latex: raw`k = .33`, secret: true },

					{ latex: raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },

					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, parametricDomain: { min: -100, max: 100 }, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();



	const vectorFieldCanvas = $("#vector-field-canvas");

	const vectorFieldApplet = new VectorFields({ canvas: vectorFieldCanvas });

	vectorFieldApplet.loadPromise.then(() =>
	{
		vectorFieldApplet.run({
			generatingCode: "((x + 3.0 * y) / 8.0, (4.0 * x + 2.0 * y) / 8.0)",
			zoomLevel: 1
		});
		vectorFieldApplet.pauseWhenOffscreen();
	});

	

	const eigenvectorAxesCanvas = $("#eigenvector-axes-canvas");

	const eigenvectorAxesApplet = new VectorFields({
		canvas: eigenvectorAxesCanvas,
		draggable1Location: [-1, -1],
		draggable2Location: [1, 0]
	});

	eigenvectorAxesApplet.loadPromise.then(() =>
	{
		eigenvectorAxesApplet.run({
			generatingCode: "(dot(draggableArg, vec2(x,y)), dot(draggableArg2, vec2(x,y)))",
			zoomLevel: -.75
		});
		eigenvectorAxesApplet.pauseWhenOffscreen();
	});
}