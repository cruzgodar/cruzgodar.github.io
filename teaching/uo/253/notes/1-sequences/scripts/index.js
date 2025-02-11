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
					{ latex: raw`N = 5`, sliderBounds: { min: 0, max: 10, step: 1 } },
					{ latex: raw`a = 0` },

					{ latex: raw`(a, f(a))`, color: desmosBlue, secret: true },
					{ latex: raw`D = [${derivatives.join(", ")}]`, secret: true },
					{ latex: raw`\sum_{n = 0}^N \frac{D[n + 1]}{n!} (x-a)^n`, color: desmosBlue, secret: true }
				]
			},



			epsilonDefinitionOfConvergence:
			{
				bounds: { left: -1, right: 13, bottom: -.5, top: 2.5 },

				expressions:
				[
					{ latex: raw`\varepsilon = .75`, sliderBounds: { min: .001, max: .999 } },
					{ latex: raw`N` },

					{ latex: raw`n = [1, ..., 12]`, secret: true },
					{ latex: raw`a(x) = 1 + (-\frac{1}{2})^x`, hidden: true, secret: true },
					{ latex: raw`(n, a(n))`, color: desmosPurple, secret: true },
					{ latex: raw`y = 1 \{x \geq 1\}`, color: desmosPurple, secret: true },
					{ latex: raw`\left| y - 1 \right| < \varepsilon \{ x \geq N \}`, color: desmosBlue, secret: true },
					{ latex: raw`x = N \{ \left| y - 1 \right| < \varepsilon \}`, color: desmosBlue, secret: true },
					{ latex: raw`N = \ceil(-\log_2( \varepsilon ))`, secret: true }
				]
			},



			squeezeTheorem:
			{
				bounds: { left: -1, right: 101, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: raw`a(n) = -\frac{1}{n}`, hidden: true },
					{ latex: raw`b(n) = \frac{\cos(n)}{n}`, hidden: true },
					{ latex: raw`c(n) = \frac{1}{n}`, hidden: true },

					{ latex: raw`N = [1, ..., 100]`, secret: true },
					{ latex: raw`(N, a(N))`, color: desmosBlue, secret: true },
					{ latex: raw`(N, c(N))`, color: desmosRed, secret: true },
					{ latex: raw`(N, b(N))`, color: desmosPurple, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();



	showPage();
}