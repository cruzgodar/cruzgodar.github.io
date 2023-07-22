export function load()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"circle":
			{
				bounds: {left: -2, right: 2, bottom: -2, top: 2},
				
				expressions:
				[
					{latex: String.raw`x^2+y^2 = 1`, color: DESMOS_PURPLE},
					{latex: String.raw`a = .5`, sliderBounds: {min: -1, max: 1}},
					{latex: String.raw`f(x) = \sqrt{1 - x^2}`, hidden: true, secret: true},
					{latex: String.raw`(a, f(a))`, secret: true, color: DESMOS_BLUE},
					{latex: String.raw`(a, -f(a))`, secret: true, color: DESMOS_BLUE},
					{latex: String.raw`y = f(a) + f'(a)(x - a)`, color: DESMOS_RED, secret: true},
					{latex: String.raw`y = -f(a) + -f'(a)(x - a)`, color: DESMOS_RED, secret: true}
				]
			},
			
			
			
			"braids":
			{
				bounds: {left: -3.5*Math.PI, right: 3.5*Math.PI, bottom: -3.5*Math.PI, top: 3.5*Math.PI},
				
				expressions:
				[
					{latex: String.raw`\cos(\sin(y)) = \cos(x)`, color: DESMOS_PURPLE}
				]
			},
			
			
			
			"sin-thing":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`x\sin(xy) = y`, color: DESMOS_PURPLE}
				]
			},
		};
		
		return data;
	}
	
	Page.Load.createDesmosGraphs();
	
	Page.show();
}