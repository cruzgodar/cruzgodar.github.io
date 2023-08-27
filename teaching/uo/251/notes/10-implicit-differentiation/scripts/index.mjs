import { createDesmosGraphs, desmosBlue, desmosPurple, desmosRed, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"circle":
			{
				bounds: { left: -2, right: 2, bottom: -2, top: 2 },
				
				expressions:
				[
					{ latex: String.raw`x^2+y^2 = 1`, color: desmosPurple },
					{ latex: String.raw`a = .5`, sliderBounds: { min: -1, max: 1 } },
					{ latex: String.raw`f(x) = \sqrt{1 - x^2}`, hidden: true, secret: true },
					{ latex: String.raw`(a, f(a))`, secret: true, color: desmosBlue },
					{ latex: String.raw`(a, -f(a))`, secret: true, color: desmosBlue },
					{ latex: String.raw`y = f(a) + f'(a)(x - a)`, color: desmosRed, secret: true },
					{ latex: String.raw`y = -f(a) + -f'(a)(x - a)`, color: desmosRed, secret: true }
				]
			},
			
			
			
			"braids":
			{
				bounds: { left: -3.5*Math.PI, right: 3.5*Math.PI, bottom: -3.5*Math.PI, top: 3.5*Math.PI },
				
				expressions:
				[
					{ latex: String.raw`\cos(\sin(y)) = \cos(x)`, color: desmosPurple }
				]
			},
			
			
			
			"sin-thing":
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },
				
				expressions:
				[
					{ latex: String.raw`x\sin(xy) = y`, color: desmosPurple }
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}