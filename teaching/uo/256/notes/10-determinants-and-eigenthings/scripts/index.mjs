export function load()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"eigenvectors":
			{
				bounds: {left: -5, right: 15, bottom: -5, top: 15},
				
				expressions:
				[
					{latex: String.raw`v_1 = (1, 2)`, color: DESMOS_PURPLE},
					{latex: String.raw`v_2 = (4, 0)`, color: DESMOS_PURPLE},
					
					{latex: String.raw`\lambda_1 = 3`},
					{latex: String.raw`\lambda_2 = 2`},
					
					{latex: String.raw`\lambda_1\lambda_2`},
					
					{latex: String.raw`(0, 0), v_1, v_1 + v_2`, points: false, lines: true, color: DESMOS_PURPLE, secret: true},
					{latex: String.raw`(0, 0), v_2, v_1 + v_2`, points: false, lines: true, color: DESMOS_PURPLE, secret: true},
					
					{latex: String.raw`(0, 0), \lambda_1 v_1, \lambda_1 v_1 + \lambda_2 v_2`, points: false, lines: true, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`(0, 0), \lambda_2 v_2, \lambda_1 v_1 + \lambda_2 v_2`, points: false, lines: true, color: DESMOS_BLUE, secret: true},
					
					{latex: String.raw`\frac{v_1}{2}`, label: String.raw`v₁`, showLabel: true, labelOrientation: Desmos.LabelOrientations.RIGHT, color: DESMOS_PURPLE, hidden: true, secret: true},
					{latex: String.raw`\frac{v_2}{2}`, label: String.raw`v₂`, showLabel: true, labelOrientation: Desmos.LabelOrientations.BELOW, color: DESMOS_PURPLE, hidden: true, secret: true},
					
					{latex: String.raw`\frac{\lambda_1 v_1}{1.5}`, label: String.raw` λ₁v₁`, showLabel: true, labelOrientation: Desmos.LabelOrientations.RIGHT, color: DESMOS_BLUE, hidden: true, secret: true},
					{latex: String.raw`\frac{\lambda_2 v_2}{1.5}`, label: String.raw`λ₂v₂`, showLabel: true, labelOrientation: Desmos.LabelOrientations.BELOW, color: DESMOS_BLUE, hidden: true, secret: true},
				]
			},
		};
		
		return data;
	};
	
	Page.Load.createDesmosGraphs();
	
	Page.show();
}