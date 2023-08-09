import { showPage } from "/scripts/src/load-page.mjs"
import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs"

export function load()
{
	setGetDesmosData((purple, blue, red, green, black) =>
	{
		const data =
		{
			"extrema":
			{
				bounds: {left: -3.5, right: 3.5, bottom: -3.5, top: 3.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^5 - 3x^3 + x \{-1.5 \leq x \leq 1.5\}`, color: purple, secret: true},
					{latex: String.raw`(-3, 0), (-2, 2), (-1.5, f(-1.5))`, secret: true, points: false, lines: true, color: purple},
					{latex: String.raw`(-3, 0), (-1.5, f(-1.5)), (-.345, f(-.345)), (1.297, f(1.297))`, secret: true, color: blue},
					{latex: String.raw`(-2, 2), (-1.297, f(-1.297)), (.345, f(.345)), (1.5, f(1.5))`, secret: true, color: red},
				]
			},
			
			
			
			"saddle-point":
			{
				bounds: {left: -3, right: 3, bottom: -3, top: 3},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3`, color: purple},
					{latex: String.raw`(0, 0)`, color: blue},
				]
			},
			
			
			
			"critical-points":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -15, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^5 - 3x^3 + x \left\{-2 \leq x \leq 1.5\right\}`, color: purple},
				]
			},
			
			
			
			"concavity":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -2.5, top: 2.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^5 - 3x^3 + x`, color: purple, hidden: true, secret: true},
					{latex: String.raw`f(x)`, color: purple},
					{latex: String.raw`f''(x)`, color: green, hidden: true},
					
					{latex: String.raw`y \geq f(x) \{-.949 \leq x \leq 0, .949 \leq x\}`, color: red, secret: true},
					{latex: String.raw`y \leq f(x) \{x \leq -.949, 0 \leq x \leq .949\}`, color: blue, secret: true},
				]
			},
			
			
			
			"first-derivative-test":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -2.5, top: 2.5},
				
				expressions:
				[
					{latex: String.raw`g(t) = t^6 - t^4`, color: purple},
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}