import { createDesmosGraphs, desmosBlue, desmosPurple, desmosRed, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"limit-example":
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },
				
				expressions:
				[
					{ latex: String.raw`\frac{x^2 - 1}{x - 1}`, color: desmosPurple },
					{ latex: String.raw`(1, 2)`, color: desmosPurple, pointStyle: "OPEN" },
				]
			},
			
			
			
			"limit-example-2":
			{
				bounds: { left: 0, right: 8, bottom: -3, top: 5 },
				
				expressions:
				[
					{ latex: String.raw`f(t) = \sqrt{t - 2}`, color: desmosPurple },
				]
			},
			
			
			
			"squeeze-theorem":
			{
				bounds: { left: -25*Math.PI / 2, right: 25*Math.PI / 2, bottom: -25*Math.PI / 2, top: 25*Math.PI / 2 },
				
				expressions:
				[
					{ latex: String.raw`f(x) = -\left|x\right|`, color: desmosBlue },
					{ latex: String.raw`g(x) = x\sin(x)`, color: desmosPurple },
					{ latex: String.raw`h(x) = \left|x\right|`, color: desmosRed },
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}