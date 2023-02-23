!function()
{
	let derivatives = [];
	
	for (let i = 0; i <= 10; i++)
	{
		derivatives.push(derivative_string = get_derivative_string(i));
	}
	
	Page.Load.get_desmos_data = () =>
	{
		const data =
		{
			"taylor-series":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = \sin(x)`, color: DESMOS_PURPLE},
					{latex: String.raw`\sum_{n = 0}^N \frac{D[n + 1]}{n!} (x-a)^n`, color: DESMOS_BLUE},
					{latex: String.raw`N = 5`, sliderBounds: {min: 0, max: 10, step: 1}},
					{latex: String.raw`a = 0`},
					
					{latex: String.raw`(a, f(a))`, color: DESMOS_BLUE, pointSize: 50, secret: true},
					{latex: String.raw`D = [${derivatives.join(", ")}]`, secret: true}
				]
			},
			
			
			
			"taylor-series-comparison":
			{
				bounds: {left: -5, right: 15, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = \sin(x)`, color: DESMOS_PURPLE},
					{latex: String.raw`N = 5`, sliderBounds: {min: 0, max: 10, step: 1}},
					{latex: String.raw`F_1(x) = \sum_{n = 0}^N \frac{D(0)[n + 1]}{n!} (x)^n`, color: DESMOS_BLUE},
					{latex: String.raw`F_2(x) = \sum_{n = 0}^N \frac{D(3\pi)[n + 1]}{n!} (x-3\pi)^n`, color: DESMOS_RED},
					{latex: String.raw`f(10)`},
					{latex: String.raw`F_2(10)`},
					{latex: String.raw`F_1(10)`},
					
					{latex: String.raw`D(a) = [${derivatives.join(", ")}]`, hidden: true, secret: true}
				]
			},
			
			
			
			"problematic-taylor-series":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -2.5, top: 2.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \{x = 0: 0, e^{-\frac{1}{x^2}}\}`, color: DESMOS_PURPLE},
					{latex: String.raw`\sum_{n = 0}^N \frac{D[n + 1]}{n!} (x-a)^n`, color: DESMOS_BLUE},
					{latex: String.raw`N = 5`, sliderBounds: {min: 0, max: 10, step: 1}},
					{latex: String.raw`a = 0`},
					
					{latex: String.raw`(a, f(a))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`D = [${derivatives.slice(0, 6).join(", ")}]`, secret: true}
				]
			}
		};
		
		return data;
	};
	
	Page.Load.create_desmos_graphs();
	
	
	
	Page.show();
	
	
	
	function get_derivative_string(n)
	{
		let array = ["f"];
		
		for (let i = 0; i < n; i++)
		{
			array.push("'");
		}
		
		array.push("(a)");
		
		return array.join("");
	}
}()