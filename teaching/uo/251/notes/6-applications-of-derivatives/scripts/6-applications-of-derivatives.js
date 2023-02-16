!function()
{
	Page.Load.get_desmos_data = () =>
	{
		const data =
		{
			"derivative-interpretation":
			{
				bounds: {left: -5, right: 5, bottom: -5, top: 5},
				
				expressions:
				[
					{latex: String.raw`g(t) = \frac{1}{8} t^3 - \frac{1}{2} t`, color: DESMOS_PURPLE},
					{latex: String.raw`l(x) = g(a) + g'(a)(x - a)`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`a = 0`, sliderBounds: {min: -5, max: 5}},
					{latex: String.raw`(a, g(a))`, secret: true, color: DESMOS_BLUE},
					{latex: String.raw`(a + 1, g(a + 1)), (a + 1, l(a + 1))`, color: DESMOS_RED, secret: true, lines: true, lineStyle: "DOTTED"},
				]
			},
		};
		
		return data;
	}
	
	Page.Load.create_desmos_graphs();
	
	Page.show();
}()