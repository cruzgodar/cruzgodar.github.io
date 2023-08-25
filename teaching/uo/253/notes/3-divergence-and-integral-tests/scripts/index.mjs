import { createDesmosGraphs, desmosBlue, desmosPurple, desmosRed, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"riemann-sum":
			{
				bounds: {left: 0, right: 8, bottom: -2.5, top: 5.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \left| \frac{1}{6} x^2 - \frac{1}{40} x^3 + 1 \right|`, color: desmosPurple},
					{latex: String.raw`a = 1`, sliderBounds: {min: 0, max: 8}},
					{latex: String.raw`b = 7`, sliderBounds: {min: 0, max: 8}},
					{latex: String.raw`n = 6`, sliderBounds: {min: 2, max: 100, step: 1}},
					
					{latex: String.raw`s = \frac{b - a}{n}`, secret: true},
					{latex: String.raw`X = [a, a + s, ..., b]`, secret: true},
					{latex: String.raw`L = [a, a + s, ..., b - s]`, secret: true},
					{latex: String.raw`R = [a + s, a + 2s, ..., b]`, secret: true},
					{latex: String.raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosRed, secret: true},
					{latex: String.raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true},
					{latex: String.raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true}
				]
			},
			
			
			
			"riemann-sum-2":
			{
				bounds: {left: -1, right: 9, bottom: -.025, top: .225},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{1}{x + 4}`, color: desmosPurple},
					
					{latex: String.raw`a = 1`, secret: true},
					{latex: String.raw`b = 100`, secret: true},
					{latex: String.raw`s = 1`, secret: true},
					{latex: String.raw`X = [a, a + s, ..., b]`, secret: true},
					{latex: String.raw`L = [a, a + s, ..., b - s]`, secret: true},
					{latex: String.raw`R = [a + s, a + 2s, ..., b]`, secret: true},
					
					{latex: String.raw`0 \leq y \leq f(R - 1) \{ L - 1 \leq x \leq R - 1 \}`, color: desmosBlue, secret: true},
					{latex: String.raw`x = L - 1 \{ 0 \leq y \leq f(R - 1) \}`, color: desmosBlue, secret: true},
					{latex: String.raw`x = R - 1 \{ 0 \leq y \leq f(R - 1) \}`, color: desmosBlue, secret: true},
					
					{latex: String.raw`0 \leq y \leq f(L) \{ L \leq x \leq R \}`, color: desmosRed, secret: true},
					{latex: String.raw`x = L \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true},
					{latex: String.raw`x = R \{ 0 \leq y \leq f(L) \}`, color: desmosRed, secret: true}
				]
			}
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}