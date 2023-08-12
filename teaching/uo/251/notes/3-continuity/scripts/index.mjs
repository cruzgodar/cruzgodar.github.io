import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData((purple, blue, red, green, black) =>
	{
		const data =
		{
			"continuity-example":
			{
				bounds: {left: -6, right: 6, bottom: -6, top: 6},
				
				expressions:
				[
					{latex: String.raw`f(x) = \{x \leq -3: x, -3 \leq x \leq 3: \frac{1}{27} x^3, 3 \leq x: \frac{1}{(4 - x)^2}\}`, color: purple, hidden: true, secret: true},
					{latex: String.raw`f(x)`, color: purple},
					{latex: String.raw`(-3, -3), (0, 0)`, color: purple, pointStyle: "OPEN"},
					{latex: String.raw`(-3, -1), (0, 1)`, color: purple},
				]
			},
			
			
			
			"continuity-limit":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`\frac{\cos(x^2) - x}{2 - \tan(x)}`, color: purple},
				]
			},
			
			
			
			"ivt-example":
			{
				bounds: {left: -1, right: 4, bottom: -1, top: 4},
				
				expressions:
				[
					{latex: String.raw`(1, 2), (3, 1)`, color: black},
					
					{latex: String.raw`f(x) = \frac{2}{x^{\frac{\ln(2)}{\ln(3)}}}`, color: purple},
					{latex: String.raw`g(x) = \frac{1}{2}\sin(\frac{\pi}{2}x) + \frac{3}{2}`, color: blue},
					{latex: String.raw`h(x) = \frac{3}{2}x^2 - \frac{13}{2}x + 7`, color: red},
				]
			},
			
			
			
			"ivt-example-2":
			{
				bounds: {left: -15, right: 15, bottom: -15, top: 15},
				
				expressions:
				[
					{latex: String.raw`f(x) = x - \cos(x)`, color: purple},
					
					{latex: String.raw`(0, f(0)), (\frac{\pi}{2}, f(\frac{\pi}{2}))`, color: blue},
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}