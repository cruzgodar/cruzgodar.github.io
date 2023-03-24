!async function()
{
	Page.Load.get_desmos_data = () =>
	{
		const data =
		{
			"direction-field":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x, y) = \frac{1}{30}xy`},
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
					{latex: String.raw`f(x, y) = \frac{1}{20}(x^2 - 1)\sin(y)`},
					{latex: String.raw`n = 10`, sliderBounds: {min: 1, max: 20, step: 1}},
					{latex: String.raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true},
					{latex: String.raw`A = [-n, -n + 1, ..., n]`, secret: true},
					{latex: String.raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true},
					{latex: String.raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true},
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: DESMOS_PURPLE, secret: true},
				]
			},
			
			
			
			"de-solution":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x, y) = xy`},
					{latex: String.raw`c = .1`, sliderBounds: {min: -1, max: 1}},
					{latex: String.raw`y = ce^{x^2}`, color: DESMOS_BLUE},
					{latex: String.raw`n = 10`, sliderBounds: {min: 1, max: 20, step: 1}},
					{latex: String.raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true},
					{latex: String.raw`A = [-n, -n + 1, ..., n]`, secret: true},
					{latex: String.raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true},
					{latex: String.raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true},
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: DESMOS_PURPLE, secret: true},
				]
			},
			
			
			
			"direction-field-3":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x, y) = \frac{1}{20}(x - 3)(y^2 - 4)`},
					{latex: String.raw`n = 10`, sliderBounds: {min: 1, max: 20, step: 1}},
					{latex: String.raw`I = [0, 1, ..., (2n + 1)^2 - 1]`, secret: true},
					{latex: String.raw`A = [-n, -n + 1, ..., n]`, secret: true},
					{latex: String.raw`X = A[\mod(I, 2n + 1) + 1]`, secret: true},
					{latex: String.raw`Y = X[\floor(I / (2n + 1)) + 1]`, secret: true},
					{latex: String.raw`f(X, Y)(x - X) + Y \{\left|x - X\right| \leq \frac{.3}{\sqrt{1 + f(X, Y)^2}}\}`, color: DESMOS_PURPLE, secret: true},
				]
			},
			
			
			
			"direction-field-4":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x, y) = \frac{\sin(y)}{x^2 + 1}`},
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
	
	const output_canvas = Page.element.querySelector("#output-canvas");
	
	let shown_vector_field = false;
	
	function on_scroll()
	{
		if (!shown_vector_field && output_canvas.getBoundingClientRect().top < window.innerHeight)
		{
			shown_vector_field = true;
			
			const applet = new VectorField(output_canvas);
			
			applet.load_promise.then(() => applet.run("(1, sin(y) / (x*x + 1.0))", 500, 5000, .0075, 0, 0, 1.3219));
		}
	}
	
	window.addEventListener("scroll", on_scroll);
	Page.temporary_handlers["scroll"].push(on_scroll);
}()