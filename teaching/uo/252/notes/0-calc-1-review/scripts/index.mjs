import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(({ purple, blue, red }) =>
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
			
			
			
			"limit-example":
			{
				bounds: {left: -20, right: 20, bottom: -2, top: 2},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{\sin(x)}{x}`, color: blue},
					{latex: String.raw`(0, 1)`, color: blue, pointStyle: "OPEN"},
					{latex: String.raw`(0, -1)`, color: blue}
				]
			},
			
			
			
			"continuity-example":
			{
				bounds: {left: -2, right: 7, bottom: -2, top: 3},
				
				expressions:
				[
					{latex: String.raw`f(x) = \left\{0 \leq x \leq 1: 2x, 1 < x < 3: \frac{1}{x} + 1, 3 \leq x: -\frac{2}{3} + \frac{2}{3}x\right\}`, color: purple},
					{latex: String.raw`(0, 0)`, color: purple, secret: true},
					
					{latex: String.raw`g(x) = \left\{ 0 \leq x < 1: x - 1, 1 < x < 3: -\frac{1}{x}, 3 \leq x: -\frac{2}{3} \right\}`, color: blue},
					{latex: String.raw`(0, -1), (3, -\frac{2}{3})`, color: blue, secret: true},
					{latex: String.raw`(1, 0), (1, -1), (3, -\frac{1}{3})`, color: blue, pointStyle: "OPEN", secret: true}
				]
			},
			
			
			
			"derivative-example":
			{
				bounds: {left: -2.333, right: 3.667, bottom: -1.667, top: 4.333},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: purple},
					{latex: String.raw`a = .667`, secret: true},
					{latex: String.raw`(a, f(a))`, color: blue, secret: true},
					{latex: String.raw`y - f(a) = f'(a)(x - a)`, color: blue, secret: true},
					{latex: String.raw`f'(x)`, color: red, secret: true},
					{latex: String.raw`(a, f'(a))`, color: red, dragMode: "NONE", showLabel: true, secret: true},
				]
			},
			
			
			
			"second-derivative-test":
			{
				bounds: {left: -2.333, right: 3.667, bottom: -1.667, top: 4.333},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: purple, secret: true, hidden: true},
					{latex: String.raw`f(x)`, color: purple},
					
					{latex: String.raw`f'(x)`, color: blue},
					{latex: String.raw`(0, f(0)), (\frac{4}{3}, f(\frac{4}{3}))`, color: blue, secret: true},
					
					{latex: String.raw`f''(x)`, color: red},
					{latex: String.raw`(\frac{2}{3}, f(\frac{2}{3}))`, color: red, secret: true},
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}