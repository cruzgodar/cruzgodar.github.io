import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(({ purple, blue, red }) =>
	{
		const data =
		{
			"sin-and-cos":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = \sin(x)`, color: purple},
					{latex: String.raw`f'(x)`, color: blue, secret: true},
					{latex: String.raw`a = 0`},
					{latex: String.raw`(a, f(a))`, secret: true, color: purple},
					{latex: String.raw`(a, f'(a))`, color: blue, secret: true, showLabel: true},
					{latex: String.raw`y = f(a) + f'(a)(x - a)`, color: red, secret: true}
				]
			},
			
			
			
			"exp-derivative":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -.5, top: 4.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = e^x`, color: purple},
					{latex: String.raw`a = 0`},
					{latex: String.raw`(a, f(a))`, secret: true, color: purple, showLabel: true},
					{latex: String.raw`y = f(a) + f'(a)(x - a)`, color: blue, secret: true}
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}