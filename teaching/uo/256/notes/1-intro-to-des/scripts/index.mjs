import { VectorField } from "/applets/vector-fields/scripts/class.mjs";
import { createDesmosGraphs, desmosBlue, desmosPurple, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			"direction-field":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(t, y) = \frac{\sin(y)}{t^2 + 1}`},
					{latex: String.raw`y(t) = 2\arccot(e^{c - \arctan(t)})`, color: desmosBlue},
					{latex: String.raw`c = 0`, sliderBounds: {min: -5, max: 5}},
					{latex: String.raw`n = 10`, sliderBounds: {min: 1, max: 20, step: 1}},
					{latex: String.raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true},
					{latex: String.raw`A = [-n, -n + 1, ..., n]`, secret: true},
					{latex: String.raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true},
					{latex: String.raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true},
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true},
				]
			},
			
			"direction-field-2":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(t, y) = \frac{1}{50}(y^2 - 4)\left|y - 4\right|(t - 3)`},
					{latex: String.raw`n = 10`, sliderBounds: {min: 1, max: 20, step: 1}},
					{latex: String.raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true},
					{latex: String.raw`A = [-n, -n + 1, ..., n]`, secret: true},
					{latex: String.raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true},
					{latex: String.raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true},
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: desmosPurple, secret: true},
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	
	
	const outputCanvas = $("#vector-field-canvas");
	
	const applet = new VectorField(outputCanvas);
	
	applet.loadPromise.then(() =>
	{
		applet.run("(1.0, sin(y) / (x*x + 1.0))", 500, 10000, .0075, 100, 0, 0, 1.3219);
		applet.pauseWhenOffscreen();
	});
	
	
	
	showPage();
}