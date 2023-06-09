!function()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"geometric-integral":
			{
				bounds: {left: -2, right: 4, bottom: -2, top: 4},
				
				expressions:
				[
					{latex: String.raw`f(x) = \left|x\right|`, color: DESMOS_PURPLE},
					{latex: String.raw`a = -1`},
					{latex: String.raw`b = 3`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: DESMOS_PURPLE, secret: true}
				]
			},
			
			
			
			"geometric-integral-2":
			{
				bounds: {left: -1, right: 4, bottom: -2, top: 8},
				
				expressions:
				[
					{latex: String.raw`f(x) = 2x`, color: DESMOS_PURPLE},
					{latex: String.raw`a = 1`},
					{latex: String.raw`b = 3`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`y = 2 \{1 \leq x \leq 3\}`, color: DESMOS_PURPLE, secret: true}
				]
			},
			
			
			
			"integral-from-limit-def":
			{
				bounds: {left: -.25, right: 2.25, bottom: -.25, top: 4.25},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^2`, color: DESMOS_PURPLE},
					{latex: String.raw`a = 0`, hidden: true},
					{latex: String.raw`b = 2`, hidden: true},
					{latex: String.raw`n = 6`, sliderBounds: {min: 1, max: 200, step: 1}},
					
					{latex: String.raw`s = \frac{b - a}{n}`, secret: true},
					{latex: String.raw`X = [a, a + s, ..., b]`, secret: true},
					{latex: String.raw`L = [a, a + s, ..., b - s]`, secret: true},
					{latex: String.raw`R = [a + s, a + 2s, ..., b]`, secret: true},
					{latex: String.raw`0 \leq y \leq f(R) \{ L \leq x \leq R \}`, color: DESMOS_RED, secret: true},
					{latex: String.raw`x = L \{ 0 \leq y \leq f(R) \}`, color: DESMOS_RED, secret: true},
					{latex: String.raw`x = R \{ 0 \leq y \leq f(R) \}`, color: DESMOS_RED, secret: true}
				]
			},
			
			
			
			"geometric-integral-3":
			{
				bounds: {left: -1, right: 7, bottom: -2.5, top: 5.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = \sqrt{9 - (x - 3)^2}`, color: DESMOS_PURPLE},
					{latex: String.raw`a = 3`},
					{latex: String.raw`b = 6`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: DESMOS_PURPLE, secret: true},
				]
			},
			
			
			
			"signed-area":
			{
				bounds: {left: -3, right: 3, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3`, color: DESMOS_PURPLE},
					{latex: String.raw`a = -2`},
					{latex: String.raw`b = 2`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: DESMOS_RED, secret: true},
					{latex: String.raw`x = [a, b] \{f(x) \leq y \leq 0\} `, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: DESMOS_RED, secret: true},
					{latex: String.raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: DESMOS_BLUE, secret: true}
				]
			}
		};
		
		return data;
	};
	
	Page.Load.createDesmosGraphs();
	
	
	
	Page.show();
}()