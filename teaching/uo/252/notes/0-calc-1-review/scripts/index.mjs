export function load()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"test-graph":
			{
				bounds: {left: -1, right: 3, bottom: -1, top: 3},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: DESMOS_PURPLE},
					{latex: String.raw`a = 0`},
					{latex: String.raw`b = 2`},
					
					{latex: String.raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: DESMOS_PURPLE, secret: true}
				]
			},
			
			
			
			"limit-example":
			{
				bounds: {left: -20, right: 20, bottom: -2, top: 2},
				
				expressions:
				[
					{latex: String.raw`f(x) = \frac{\sin(x)}{x}`, color: DESMOS_BLUE},
					{latex: String.raw`(0, 1)`, color: DESMOS_BLUE, pointStyle: "OPEN"},
					{latex: String.raw`(0, -1)`, color: DESMOS_BLUE}
				]
			},
			
			
			
			"continuity-example":
			{
				bounds: {left: -2, right: 7, bottom: -2, top: 3},
				
				expressions:
				[
					{latex: String.raw`f(x) = \left\{0 \leq x \leq 1: 2x, 1 < x < 3: \frac{1}{x} + 1, 3 \leq x: -\frac{2}{3} + \frac{2}{3}x\right\}`, color: DESMOS_PURPLE},
					{latex: String.raw`(0, 0)`, color: DESMOS_PURPLE, secret: true},
					
					{latex: String.raw`g(x) = \left\{ 0 \leq x < 1: x - 1, 1 < x < 3: -\frac{1}{x}, 3 \leq x: -\frac{2}{3} \right\}`, color: DESMOS_BLUE},
					{latex: String.raw`(0, -1), (3, -\frac{2}{3})`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`(1, 0), (1, -1), (3, -\frac{1}{3})`, color: DESMOS_BLUE, pointStyle: "OPEN", secret: true}
				]
			},
			
			
			
			"derivative-example":
			{
				bounds: {left: -2.333, right: 3.667, bottom: -1.667, top: 4.333},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: DESMOS_PURPLE},
					{latex: String.raw`a = .667`, secret: true},
					{latex: String.raw`(a, f(a))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`y - f(a) = f'(a)(x - a)`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`f'(x)`, color: DESMOS_RED, secret: true},
					{latex: String.raw`(a, f'(a))`, color: DESMOS_RED, dragMode: "NONE", showLabel: true, secret: true},
				]
			},
			
			
			
			"second-derivative-test":
			{
				bounds: {left: -2.333, right: 3.667, bottom: -1.667, top: 4.333},
				
				expressions:
				[
					{latex: String.raw`f(x) = x^3 - 2x^2 + 2`, color: DESMOS_PURPLE, secret: true, hidden: true},
					{latex: String.raw`f(x)`, color: DESMOS_PURPLE},
					
					{latex: String.raw`f'(x)`, color: DESMOS_BLUE},
					{latex: String.raw`(0, f(0)), (\frac{4}{3}, f(\frac{4}{3}))`, color: DESMOS_BLUE, secret: true},
					
					{latex: String.raw`f''(x)`, color: DESMOS_RED},
					{latex: String.raw`(\frac{2}{3}, f(\frac{2}{3}))`, color: DESMOS_RED, secret: true},
				]
			}
		};
		
		return data;
	}
	
	Page.Load.createDesmosGraphs();
	
	Page.show();
}