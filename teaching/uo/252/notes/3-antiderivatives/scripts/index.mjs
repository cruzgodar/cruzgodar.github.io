import { createDesmosGraphs, desmosBlue, desmosPurple, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"antiderivative":
			{
				bounds: { left: -3, right: 3, bottom: -1, top: 5 },
				
				expressions:
				[
					{ latex: String.raw`f(x) = \frac{x^3}{3} + C`, color: desmosPurple },
					{ latex: String.raw`f'(x)`, color: desmosBlue },
					{ latex: String.raw`C = 2` }
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}