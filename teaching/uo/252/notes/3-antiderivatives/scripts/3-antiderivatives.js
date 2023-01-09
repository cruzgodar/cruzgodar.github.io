!function()
{
	let data =
	{
		"antiderivative":
		{
			bounds: {left: -3, right: 3, bottom: -1, top: 5},
			
			expressions:
			[
				{latex: String.raw`f(x) = \frac{x^3}{3} + C`, color: DESMOS_PURPLE},
				{latex: String.raw`f'(x)`, color: DESMOS_BLUE},
				{latex: String.raw`C = 2`}
			]
		}
	};
	
	Page.Load.create_desmos_graphs(data);
	
	
	
	Page.show();
}()