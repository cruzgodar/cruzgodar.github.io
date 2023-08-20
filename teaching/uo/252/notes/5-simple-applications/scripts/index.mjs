import { showPage } from "/scripts/src/load-page.mjs";
import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";

export function load()
{
	setGetDesmosData((purple, blue, red, green, black) =>
	{
		const data =
		{
			"displacement":
			{
				bounds: {left: -1, right: 4, bottom: -7, top: 8},
				
				expressions:
				[
					{latex: String.raw`v(t) = 3t - 5 \left\{0 \leq t \leq 3\right\}`, color: purple},
					{latex: String.raw`s(t) = \int_0^t v(x) dx`, color: blue},
					{latex: String.raw`v_{pos}(t) = \left|v(t)\right|`, color: red},
					{latex: String.raw`s_{tot}(t) = \int_0^t v_{pos}(x) dx`, color: green}
				]
			},
			
			
			
			"even-and-odd-functions":
			{
				bounds: {left: -5, right: 5, bottom: -2.5, top: 2.5},
				
				expressions:
				[
					{latex: String.raw`x^4 - x^2`, color: purple},
					{latex: String.raw`\sin(x)`, color: blue}
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}