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
			circle:
			{
				bounds: { left: -2, right: 2, bottom: -2, top: 2 },

				expressions:
				[
					{ latex: raw`x^2+y^2 = 1`, color: desmosPurple },
					{ latex: raw`a = .5`, sliderBounds: { min: -1, max: 1 } },
					{ latex: raw`f(x) = \sqrt{1 - x^2}`, hidden: true, secret: true },
					{ latex: raw`(a, f(a))`, secret: true, color: desmosBlue },
					{ latex: raw`(a, -f(a))`, secret: true, color: desmosBlue },
					{ latex: raw`y = f(a) + f'(a)(x - a)`, color: desmosRed, secret: true },
					{ latex: raw`y = -f(a) + -f'(a)(x - a)`, color: desmosRed, secret: true }
				]
			},



			braids:
			{
				bounds: {
					left: -3.5 * Math.PI,
					right: 3.5 * Math.PI,
					bottom: -3.5 * Math.PI,
					top: 3.5 * Math.PI
				},

				expressions:
				[
					{ latex: raw`\cos(\sin(y)) = \cos(x)`, color: desmosPurple }
				]
			},



			sinThing:
			{
				bounds: { left: -40, right: 40, bottom: -40, top: 40 },

				expressions:
				[
					{ latex: raw`x\sin(y) = y`, color: desmosPurple }
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}