import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData((purple, blue, red, green, black) =>
	{
		const data =
		{
			"test-graph":
			{
				bounds: {left: -1, right: 3, bottom: -1, top: 3},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: purple},
					{latex: String.raw`a = 0`},
					{latex: String.raw`b = 2`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: purple, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: purple, secret: true}
				]
			},
			
			
			
			"functions":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^2`, color: purple},
					{latex: String.raw`y = x`, color: purple, hidden: true},
					{latex: String.raw`y = x^3`, color: purple, hidden: true},
					{latex: String.raw`y = \sqrt{x}`, color: purple, hidden: true},
					{latex: String.raw`y = x^{\frac{1}{3}}`, color: purple, hidden: true},
					{latex: String.raw`y = \frac{1}{x}`, color: purple, hidden: true},
					{latex: String.raw`y = \frac{1}{x^2}`, color: purple, hidden: true},
					{latex: String.raw`y = e^x`, color: purple, hidden: true},
					{latex: String.raw`y = \ln(x)`, color: purple, hidden: true}
				]
			},
			
			
			
			"trig-review":
			{
				bounds: {left: -1.25, right: 1.25, bottom: -1.25, top: 1.25},
				
				expressions:
				[
					{latex: String.raw`r = 1`, color: black, secret: true},
					{latex: String.raw`(0, 0), (\cos(t), \sin(t))`, color: purple, points: false, lines: true, secret: true},
					
					{latex: String.raw`y = 0\{0 \leq x \leq \cos(t)\}`, color: blue, secret: true},
					{latex: String.raw`y = 0\{\cos(t) \leq x \leq 0\}`, color: blue, secret: true},
					{latex: String.raw`x = \cos(t)\{0 \leq y \leq \sin(t)\}`, color: red, secret: true},
					{latex: String.raw`x = \cos(t)\{\sin(t) \leq y \leq 0\}`, color: red, secret: true},
					
					{latex: String.raw`t = .52359878`, sliderBounds: {min: 0, max: String.raw`2\pi`}},
					
					{latex: String.raw`(\cos(t), \sin(t))`, color: purple, showLabel: true},
				]
			},
			
			
			
			"trig-graphs":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`\sin(x)`, color: red},
					{latex: String.raw`\cos(x)`, color: blue},
					{latex: String.raw`\tan(x)`, color: green, hidden: true},
					{latex: String.raw`\csc(x)`, color: blue, hidden: true},
					{latex: String.raw`\sec(x)`, color: red, hidden: true},
					{latex: String.raw`\cot(x)`, color: green, hidden: true},
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}