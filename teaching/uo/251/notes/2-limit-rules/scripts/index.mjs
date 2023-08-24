import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(({ purple, blue, red }) =>
	{
		const data =
		{
			"limit-example":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`\frac{x^2 - 1}{x - 1}`, color: purple},
					{latex: String.raw`(1, 2)`, color: purple, pointStyle: "OPEN"},
				]
			},
			
			
			
			"limit-example-2":
			{
				bounds: {left: 0, right: 8, bottom: -3, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(t) = \sqrt{t - 2}`, color: purple},
				]
			},
			
			
			
			"squeeze-theorem":
			{
				bounds: {left: -25*Math.PI / 2, right: 25*Math.PI / 2, bottom: -25*Math.PI / 2, top: 25*Math.PI / 2},
				
				expressions:
				[
					{latex: String.raw`f(x) = -\left|x\right|`, color: blue},
					{latex: String.raw`g(x) = x\sin(x)`, color: purple},
					{latex: String.raw`h(x) = \left|x\right|`, color: red},
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}