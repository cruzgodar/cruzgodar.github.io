!function()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"ftc-part-1":
			{
				bounds: {left: -7, right: 10, bottom: -5, top: 12},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{1}{27}x^3 - \frac{2}{9}x^2 + 2`, color: DESMOS_PURPLE},
					{latex: String.raw`F(x) = \int_0^x f(t) dt`, color: DESMOS_BLUE},
					{latex: String.raw`F(c + 1) - F(c)`},
					
					{latex: String.raw`c = 2`},
					
					{latex: String.raw`x = [c, c + 1] \{0 \leq y \leq f(c)\}`, color: DESMOS_RED, secret: true},
					{latex: String.raw`x = [c, c + 1] \{f(c) \leq y \leq 0\}`, color: DESMOS_RED, secret: true},
					
					{latex: String.raw`0 \leq y \leq f(c) \{c \leq x \leq c + 1\}`, color: DESMOS_RED, secret: true},
					{latex: String.raw`f(c) \leq y \leq 0 \{c \leq x \leq c + 1\}`, color: DESMOS_RED, secret: true}
				]
			},
			
			
			
			"ftc-part-2":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -2.5, top: 2.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = (x+\frac{1}{2})^3 - 2(x+\frac{1}{2})^2 + 1`, color: DESMOS_PURPLE},
					{latex: String.raw`F(x) = \int_0^x f(t) dt`, color: DESMOS_BLUE},
					{latex: String.raw`F(b) - F(a)`},
					
					{latex: String.raw`a = -1.5`, secret: true},
					{latex: String.raw`b = 1.5`, secret: true},
					
					{latex: String.raw`(a, F(a))`, secret: true, color: DESMOS_BLUE},
					{latex: String.raw`(b, F(b))`, secret: true, color: DESMOS_BLUE},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\}`, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\}`, color: DESMOS_PURPLE, secret: true},
					
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: DESMOS_PURPLE, secret: true}
				]
			}
		};
		
		return data;
	};
	
	Page.Load.createDesmosGraphs();
	
	
	
	Page.show();
}()