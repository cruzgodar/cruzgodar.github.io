import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	setGetDesmosData
} from "/scripts/src/desmos.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			eigenvectors:
			{
				bounds: { left: -5, right: 15, bottom: -5, top: 15 },

				expressions:
				[
					{ latex: String.raw`v_1 = (1, 2)`, color: desmosPurple },
					{ latex: String.raw`v_2 = (4, 0)`, color: desmosPurple },

					{ latex: String.raw`\lambda_1 = 3` },
					{ latex: String.raw`\lambda_2 = 2` },

					{ latex: String.raw`\lambda_1\lambda_2` },

					{ latex: String.raw`(0, 0), v_1, v_1 + v_2`, points: false, lines: true, color: desmosPurple, secret: true },
					{ latex: String.raw`(0, 0), v_2, v_1 + v_2`, points: false, lines: true, color: desmosPurple, secret: true },

					{ latex: String.raw`(0, 0), \lambda_1 v_1, \lambda_1 v_1 + \lambda_2 v_2`, points: false, lines: true, color: desmosBlue, secret: true },
					{ latex: String.raw`(0, 0), \lambda_2 v_2, \lambda_1 v_1 + \lambda_2 v_2`, points: false, lines: true, color: desmosBlue, secret: true },

					{ latex: String.raw`\frac{v_1}{2}`, label: String.raw`v₁`, showLabel: true, labelOrientation: "right", color: desmosPurple, hidden: true, secret: true },
					{ latex: String.raw`\frac{v_2}{2}`, label: String.raw`v₂`, showLabel: true, labelOrientation: "below", color: desmosPurple, hidden: true, secret: true },

					{ latex: String.raw`\frac{\lambda_1 v_1}{1.5}`, label: String.raw` λ₁v₁`, showLabel: true, labelOrientation: "right", color: desmosBlue, hidden: true, secret: true },
					{ latex: String.raw`\frac{\lambda_2 v_2}{1.5}`, label: String.raw`λ₂v₂`, showLabel: true, labelOrientation: "below", color: desmosBlue, hidden: true, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}