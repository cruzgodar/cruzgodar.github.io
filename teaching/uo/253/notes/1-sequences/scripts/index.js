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
					{latex: String.raw`N = 5`, sliderBounds: {min: 0, max: 10, step: 1}},
					{latex: String.raw`a = 0`},
					
					{latex: String.raw`(a, f(a))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`D = [${derivatives.join(", ")}]`, secret: true},
					{latex: String.raw`\sum_{n = 0}^N \frac{D[n + 1]}{n!} (x-a)^n`, color: DESMOS_BLUE, secret: true}
				]
			},
			
			
			
			"epsilon-definition-of-convergence":
			{
				bounds: {left: -1, right: 13, bottom: -.5, top: 2.5},
				
				expressions:
				[
					{latex: String.raw`\varepsilon = .75`, sliderBounds: {min: .001, max: .999}},
					{latex: String.raw`N`},
					
					{latex: String.raw`n = [1, ..., 12]`, secret: true},
					{latex: String.raw`a(x) = 1 + (-\frac{1}{2})^x`, hidden: true, secret: true},
					{latex: String.raw`(n, a(n))`, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`y = 1 \{x \geq 1\}`, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`\left| y - 1 \right| < \varepsilon \{ x \geq N \}`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`x = N \{ \left| y - 1 \right| < \varepsilon \}`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`N = \ceil(-\log_2( \varepsilon ))`, secret: true}
				]
			},
			
			
			
			"squeeze-theorem":
			{
				bounds: {left: -1, right: 101, bottom: -1.5, top: 1.5},
				
				expressions:
				[
					{latex: String.raw`a(n) = -\frac{1}{n}`, hidden: true},
					{latex: String.raw`b(n) = \frac{\cos(n)}{n}`, hidden: true},
					{latex: String.raw`c(n) = \frac{1}{n}`, hidden: true},
					
					{latex: String.raw`N = [1, ..., 100]`, secret: true},
					{latex: String.raw`(N, a(N))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`(N, c(N))`, color: DESMOS_RED, secret: true},
					{latex: String.raw`(N, b(N))`, color: DESMOS_PURPLE, secret: true}
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