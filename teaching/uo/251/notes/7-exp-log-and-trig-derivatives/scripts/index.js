!function()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"sin-and-cos":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x) = \sin(x)`, color: DESMOS_PURPLE},
					{latex: String.raw`f'(x)`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`a = 0`},
					{latex: String.raw`(a, f(a))`, secret: true, color: DESMOS_PURPLE},
					{latex: String.raw`(a, f'(a))`, color: DESMOS_BLUE, secret: true, showLabel: true},
					{latex: String.raw`y = f(a) + f'(a)(x - a)`, color: DESMOS_RED, secret: true}
				]
			},
			
			
			
			"exp-derivative":
			{
				bounds: {left: -2.5, right: 2.5, bottom: -.5, top: 4.5},
				
				expressions:
				[
					{latex: String.raw`f(x) = e^x`, color: DESMOS_PURPLE},
					{latex: String.raw`a = 0`},
					{latex: String.raw`(a, f(a))`, secret: true, color: DESMOS_PURPLE, showLabel: true},
					{latex: String.raw`y = f(a) + f'(a)(x - a)`, color: DESMOS_BLUE, secret: true}
				]
			},
		};
		
		return data;
	}
	
	Page.Load.createDesmosGraphs();
	
	Page.show();
}()