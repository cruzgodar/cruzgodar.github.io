import { showPage } from "/scripts/src/load-page.mjs"
import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs"

import { NewtonsMethod } from "/applets/newtons-method/scripts/class.mjs"

export function load()
{
	setGetDesmosData((purple, blue, red, green, black) =>
	{
		const data =
		{
			"newtons-method":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^2 - 2`, color: purple},
					{latex: String.raw`x_0 = .5`},
					{latex: String.raw`(x_0, f(x_0))`, secret: true},
					
					{latex: String.raw`x_1 = x_0 - \frac{f(x_0)}{f'(x_0)}`, secret: true},
					{latex: String.raw`y = f(x_0) + f'(x_0)(x - x_0) \{x_0 \leq x \leq x_1\}`, color: blue, secret: true},
					{latex: String.raw`y = f(x_0) + f'(x_0)(x - x_0) \{x_1 \leq x \leq x_0\}`, color: blue, secret: true},
					
					{latex: String.raw`x = x_1\{0 \leq y \leq f(x_1)\}`, color: red, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x = x_1\{f(x_1) \leq y \leq 0\}`, color: red, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x_2 = x_1 - \frac{f(x_1)}{f'(x_1)}`, secret: true},
					{latex: String.raw`y = f(x_1) + f'(x_1)(x - x_1) \{x_1 \leq x \leq x_2\}`, color: red, secret: true},
					{latex: String.raw`y = f(x_1) + f'(x_1)(x - x_1) \{x_2 \leq x \leq x_1\}`, color: red, secret: true},
					
					{latex: String.raw`x = x_2\{0 \leq y \leq f(x_2)\}`, color: green, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x = x_2\{f(x_2) \leq y \leq 0\}`, color: green, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x_3 = x_2 - \frac{f(x_2)}{f'(x_2)}`, secret: true},
					{latex: String.raw`y = f(x_2) + f'(x_2)(x - x2) \{x_2 \leq x \leq x_3\}`, color: green, secret: true},
					{latex: String.raw`y = f(x_2) + f'(x_2)(x - x_2) \{x_3 \leq x \leq x_2\}`, color: green, secret: true},
					
					{latex: String.raw`(x_3, 0)`, color: green, showLabel: true, secret: true},
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	
	
	const outputCanvas = $("#newtons-method-canvas");
	
	const applet = new NewtonsMethod(outputCanvas);
	
	applet.loadPromise.then(() =>
	{
		applet.pauseWhenOffscreen();
	});
	
	
	
	showPage();
}