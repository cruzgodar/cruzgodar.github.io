import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			limitExample:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: raw`\frac{x^2 - 1}{x - 1}`, color: desmosPurple },
					{ latex: raw`(1, 2)`, color: desmosPurple, pointStyle: "OPEN" },
				]
			},



			limitExample2:
			{
				bounds: { left: 0, right: 8, bottom: -3, top: 5 },

				expressions:
				[
					{ latex: raw`f(t) = \sqrt{t - 2}`, color: desmosPurple },
				]
			},



			squeezeTheorem:
			{
				bounds: {
					left: -25 * Math.PI / 2,
					right: 25 * Math.PI / 2,
					bottom: -25 * Math.PI / 2,
					top: 25 * Math.PI / 2
				},

				expressions:
				[
					{ latex: raw`f(x) = -\left|x\right|`, color: desmosBlue },
					{ latex: raw`g(x) = x\sin(x)`, color: desmosPurple },
					{ latex: raw`h(x) = \left|x\right|`, color: desmosRed },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}