import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(({ purple, blue }) =>
	{
		const data =
		{
			"antiderivative":
			{
				bounds: {left: -3, right: 3, bottom: -1, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{x^3}{3} + C`, color: purple},
					{latex: String.raw`f'(x)`, color: blue},
					{latex: String.raw`C = 2`}
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}