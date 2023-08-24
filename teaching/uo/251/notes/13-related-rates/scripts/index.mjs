import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(({ purple }) =>
	{
		const data =
		{
			"related-rates":
			{
				bounds: {left: -10, right: 110, bottom: -10, top: 110},
				
				expressions:
				[
					{latex: String.raw`(0, 0), (10t, 100), (10t, 0), (0, 0)`, color: purple, lines: true},
					{latex: String.raw`t = 10`},
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}