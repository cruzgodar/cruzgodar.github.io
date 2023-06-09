!function()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"newtons-method":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^2 - 2`, color: DESMOS_PURPLE},
					{latex: String.raw`x0 = .5`},
					{latex: String.raw`(x0, f(x0))`, secret: true},
					
					{latex: String.raw`x1 = x0 - \frac{f(x0)}{f'(x0)}`, secret: true},
					{latex: String.raw`y = f(x0) + f'(x0)(x - x0) \{x0 \leq x \leq x1\}`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`y = f(x0) + f'(x0)(x - x0) \{x1 \leq x \leq x0\}`, color: DESMOS_BLUE, secret: true},
					
					{latex: String.raw`x = x1\{0 \leq y \leq f(x1)\}`, color: DESMOS_RED, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x = x1\{f(x1) \leq y \leq 0\}`, color: DESMOS_RED, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x2 = x1 - \frac{f(x1)}{f'(x1)}`, secret: true},
					{latex: String.raw`y = f(x1) + f'(x1)(x - x1) \{x1 \leq x \leq x2\}`, color: DESMOS_RED, secret: true},
					{latex: String.raw`y = f(x1) + f'(x1)(x - x1) \{x2 \leq x \leq x1\}`, color: DESMOS_RED, secret: true},
					
					{latex: String.raw`x = x2\{0 \leq y \leq f(x2)\}`, color: DESMOS_GREEN, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x = x2\{f(x2) \leq y \leq 0\}`, color: DESMOS_GREEN, lineStyle: "DASHED", secret: true},
					{latex: String.raw`x3 = x2 - \frac{f(x2)}{f'(x2)}`, secret: true},
					{latex: String.raw`y = f(x2) + f'(x2)(x - x2) \{x2 \leq x \leq x3\}`, color: DESMOS_GREEN, secret: true},
					{latex: String.raw`y = f(x2) + f'(x2)(x - x2) \{x3 \leq x \leq x2\}`, color: DESMOS_GREEN, secret: true},
					
					{latex: String.raw`(x3, 0)`, color: DESMOS_GREEN, showLabel: true, secret: true},
				]
			},
		};
		
		return data;
	}
	
	Page.Load.createDesmosGraphs();
	
	Page.show();
}()