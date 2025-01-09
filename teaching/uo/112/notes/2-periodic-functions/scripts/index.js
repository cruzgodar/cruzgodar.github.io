import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	getDesmosPoint,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			periodicFunction:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				expressions:
				[
					{ latex: String.raw`f(x - a)`, color: desmosBlue },
					{ latex: String.raw`f(x) = 3m(x)^3 - 3m(x)^2 - 1`, secret: true },
					{ latex: String.raw`f(x)`, color: desmosPurple },
					{ latex: String.raw`m(x) = \mod(x + 0.5, 2) - 0.5`, hidden: true, secret: true },
					...getDesmosSlider({
						expression: "a = 0",
						min: -5,
						max: 5,
						secret: false
					}),
					...getDesmosPoint({
						point: ["a", "f(0)"],
						color: desmosBlue,
						dragMode: "X",
					})
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}