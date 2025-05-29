import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

function getDerivativeString(n)
{
	const array = ["f"];

	for (let i = 0; i < n; i++)
	{
		array.push("'");
	}

	array.push("(a)");

	return array.join("");
}



export default function()
{
	const derivatives = [];

	for (let i = 0; i <= 10; i++)
	{
		derivatives.push(getDerivativeString(i));
	}

	setGetDesmosData(() =>
	{
		const data =
		{
			taylorSeries:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x) = \sin(x)`, color: desmosPurple },
					{ latex: raw`\sum_{n = 0}^N \frac{D[n + 1]}{n!} (x-a)^n`, color: desmosBlue },
					{ latex: raw`N = 5`, sliderBounds: { min: 0, max: 10, step: 1 } },
					{ latex: raw`a = 0` },

					{ latex: raw`(a, f(a))`, color: desmosBlue, pointSize: 50, secret: true },
					{ latex: raw`D = [${derivatives.join(", ")}]`, secret: true }
				]
			},



			taylorSeriesComparison:
			{
				bounds: { left: -5, right: 15, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x) = \sin(x)`, color: desmosPurple },
					{ latex: raw`N = 5`, sliderBounds: { min: 0, max: 10, step: 1 } },
					{ latex: raw`F_1(x) = \sum_{n = 0}^N \frac{D(0)[n + 1]}{n!} (x)^n`, color: desmosBlue },
					{ latex: raw`F_2(x) = \sum_{n = 0}^N \frac{D(3\pi)[n + 1]}{n!} (x-3\pi)^n`, color: desmosRed },
					{ latex: raw`f(10)` },
					{ latex: raw`F_2(10)` },
					{ latex: raw`F_1(10)` },

					{ latex: raw`D(a) = [${derivatives.join(", ")}]`, hidden: true, secret: true }
				]
			},



			problematicTaylorSeries:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: raw`f(x) = \{x = 0: 0, e^{-\frac{1}{x^2}}\}`, color: desmosPurple },
					{ latex: raw`\sum_{n = 0}^N \frac{D[n + 1]}{n!} (x-a)^n`, color: desmosBlue },
					{ latex: raw`N = 5`, sliderBounds: { min: 0, max: 10, step: 1 } },
					{ latex: raw`a = 0` },

					{ latex: raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: raw`D = [${derivatives.slice(0, 6).join(", ")}]`, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}