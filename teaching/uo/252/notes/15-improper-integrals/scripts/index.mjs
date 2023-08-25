import { createDesmosGraphs, desmosPurple, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"improper-integral":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{1}{x^2}`, color: desmosPurple},
					{latex: String.raw`a = 1`},
					{latex: String.raw`b = \infty`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true},
					{latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
					{latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
				]
			},
			
			
			
			"improper-integral-2":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{1}{x}`, color: desmosPurple},
					{latex: String.raw`a = -\infty`},
					{latex: String.raw`b = -1`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true},
					{latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
					{latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
				]
			},
			
			
			
			"improper-integral-3":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{1}{\sqrt{4 - x}}`, color: desmosPurple},
					{latex: String.raw`a = 0`},
					{latex: String.raw`b = 4`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true},
					{latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
					{latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
				]
			},
			
			
			
			"improper-integral-4":
			{
				bounds: {left: -4, right: 4, bottom: -4, top: 4},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{1}{x^3}`, color: desmosPurple},
					{latex: String.raw`a = -1`},
					{latex: String.raw`b = 1`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: desmosPurple, secret: true},
					{latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: desmosPurple, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
					{latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosPurple, secret: true},
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}