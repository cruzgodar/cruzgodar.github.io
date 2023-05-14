!async function()
{
	Page.Load.get_desmos_data = () =>
	{
		const data =
		{
			"direction-field":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(t, y) = \frac{\sin(y)}{t^2 + 1}`},
					{latex: String.raw`y(t) = 2\arccot(e^{c - \arctan(t)})`, color: DESMOS_BLUE},
					{latex: String.raw`c = 0`, sliderBounds: {min: -5, max: 5}},
					{latex: String.raw`n = 10`, sliderBounds: {min: 1, max: 20, step: 1}},
					{latex: String.raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true},
					{latex: String.raw`A = [-n, -n + 1, ..., n]`, secret: true},
					{latex: String.raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true},
					{latex: String.raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true},
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: DESMOS_PURPLE, secret: true},
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
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: DESMOS_PURPLE, secret: true},
				]
			},
		};
		
		return data;
	};
	
	Page.Load.create_desmos_graphs();
	
	
	
	Page.show();
	
	await Site.load_applet("vector-fields");
	
	const output_canvas = Page.element.querySelector("#vector-field-canvas");
	
	const applet = new VectorField(output_canvas);
	
	applet.load_promise.then(() =>
	{
		applet.run("(1.0, sin(y) / (x*x + 1.0))", 500, 5000, .0075, 0, 0, 1.3219);
		applet.pause();
	});
	
	Site.pause_applet_when_offscreen(applet);
}()