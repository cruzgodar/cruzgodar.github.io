import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGreen,
	desmosPurple,
	desmosRed,
	getDesmosPoint,
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
			testGraph:
			{
				bounds: { left: -1, right: 3, bottom: -1, top: 3 },

				expressions:
				[
					{ latex: raw`f(x) = x^3 - 2x^2 + 2`, color: desmosPurple },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 2` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},

			powerFunctions:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x`, color: desmosPurple },
					{ latex: raw`f(x) = x^2`, color: desmosBlue },
					{ latex: raw`f(x) = x^3`, color: desmosRed },
					{ latex: raw`f(x) = x^a`, color: desmosGreen },
					{ latex: raw`a = 4`, sliderBounds: { min: 4, max: 10, step: 1 } },
				]
			},

			negativePowerFunctions:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x^{-1}`, color: desmosPurple },
					{ latex: raw`f(x) = x^{-2}`, color: desmosBlue },
					{ latex: raw`f(x) = x^{-a}`, color: desmosRed },
					{ latex: raw`a = 3`, sliderBounds: { min: 3, max: 10, step: 1 } },
				]
			},

			fractionalPowerFunctions:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x^{1/2}`, color: desmosPurple },
					{ latex: raw`f(x) = x^{1/3}`, color: desmosBlue },
					{ latex: raw`f(x) = x^{1/a}`, color: desmosRed },
					...getDesmosSlider({
						expression: "a = 4",
						min: 4,
						max: 10,
						step: 1,
						secret: false
					}),
				]
			},

			inverses:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x^3`, color: desmosPurple },
					{ latex: raw`f(x) = x^{1/3}`, color: desmosBlue },
					{ latex: raw`y = x`, color: desmosBlack, secret: true, lineStyle: "DASHED" },
				]
			},

			exponentials:
			{
				bounds: { left: -3, right: 3, bottom: -1, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = e^x`, color: desmosPurple },
				]
			},

			verticalShift:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`g(x) = f(x) + b`, color: desmosBlue },
					...getDesmosSlider({
						expression: "b = 1",
						min: -5,
						max: 5,
						secret: false
					}),
					...getDesmosPoint({
						point: ["0", "b"],
						color: desmosRed,
						dragMode: "Y",
					}),
				]
			},

			verticalStretch:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`g(x) = af(x)`, color: desmosBlue },
					...getDesmosSlider({
						expression: "a = 2",
						min: -5,
						max: 5,
						secret: false
					}),
					...getDesmosPoint({
						point: ["1", "a"],
						color: desmosRed,
						dragMode: "Y",
					}),
				]
			},

			combinedTransformations:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`f(x) = e^x`, color: desmosPurple },
					...getDesmosPoint({
						point: ["0", "f(0)"],
						color: desmosPurple,
						dragMode: "",
					}),
					...getDesmosPoint({
						point: ["1", "f(1)"],
						color: desmosPurple,
						dragMode: "",
					}),
					{ latex: raw`g(x) = \frac{1}{5}f(x)`, color: desmosBlue },
					...getDesmosPoint({
						point: ["0", "g(0)"],
						color: desmosBlue,
						dragMode: "",
					}),
					...getDesmosPoint({
						point: ["1", "g(1)"],
						color: desmosBlue,
						dragMode: "",
					}),
					{ latex: raw`h(x) = g(x) - 2`, color: desmosRed },
					...getDesmosPoint({
						point: ["0", "h(0)"],
						color: desmosRed,
						dragMode: "",
					}),
					...getDesmosPoint({
						point: ["1", "h(1)"],
						color: desmosRed,
						dragMode: "",
					}),
				]
			},

			intuitiveHorizontalTransformations:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`x = y^3`, color: desmosPurple },
					{ latex: raw`x = cy^3 + d`, color: desmosBlue },
					...getDesmosSlider({
						expression: "c = 2",
						min: -5,
						max: 5,
						secret: false
					}),
					...getDesmosSlider({
						expression: "d = 1",
						min: -5,
						max: 5,
						secret: false
					}),
				]
			},

			identifyFormulaFromGraph: {
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x) = \ln(x - 2)`, secret: true, hidden: true },
					{ latex: raw`f(x)`, color: desmosPurple },

					{ latex: raw`g(x) = \ln(\frac{1}{3}(x + 1))`, secret: true, hidden: true },
					{ latex: raw`g(x)`, color: desmosBlue, hidden: true },

					{ latex: raw`h(x) = 2\ln(-2x)`, secret: true, hidden: true },
					{ latex: raw`h(x)`, color: desmosRed, hidden: true },

					{ latex: raw`l(x) = -2\ln(-\frac{1}{2}(x + 1)) + 1`, secret: true, hidden: true },
					{ latex: raw`l(x)`, color: desmosGreen, hidden: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}