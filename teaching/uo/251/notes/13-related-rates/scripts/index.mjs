export function load()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"related-rates":
			{
				bounds: {left: -10, right: 110, bottom: -10, top: 110},
				
				expressions:
				[
					{latex: String.raw`(0, 0), (10t, 100), (10t, 0), (0, 0)`, color: DESMOS_PURPLE, lines: true},
					{latex: String.raw`t = 10`},
				]
			},
		};
		
		return data;
	}
	
	Page.Load.createDesmosGraphs();
	
	Page.show();
}