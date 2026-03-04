import {
	createDesmosGraphs, desmosColors
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		eigenvectors:
		{
			bounds: { xmin: -5, xmax: 15, ymin: -5, ymax: 15 },

			expressions:
			[
				{ latex: raw`v_1 = (1, 2)`, color: desmosColors.purple },
				{ latex: raw`v_2 = (4, 0)`, color: desmosColors.purple },

				{ latex: raw`\lambda_1 = 3` },
				{ latex: raw`\lambda_2 = 2` },

				{ latex: raw`\lambda_1\lambda_2` },

				{ latex: raw`(0, 0), v_1, v_1 + v_2`, points: false, lines: true, color: desmosColors.purple, secret: true },
				{ latex: raw`(0, 0), v_2, v_1 + v_2`, points: false, lines: true, color: desmosColors.purple, secret: true },

				{ latex: raw`(0, 0), \lambda_1 v_1, \lambda_1 v_1 + \lambda_2 v_2`, points: false, lines: true, color: desmosColors.blue, secret: true },
				{ latex: raw`(0, 0), \lambda_2 v_2, \lambda_1 v_1 + \lambda_2 v_2`, points: false, lines: true, color: desmosColors.blue, secret: true },

				{ latex: raw`\frac{v_1}{2}`, label: raw`v₁`, showLabel: true, labelOrientation: "right", color: desmosColors.purple, hidden: true, secret: true },
				{ latex: raw`\frac{v_2}{2}`, label: raw`v₂`, showLabel: true, labelOrientation: "below", color: desmosColors.purple, hidden: true, secret: true },

				{ latex: raw`\frac{\lambda_1 v_1}{1.5}`, label: raw` λ₁v₁`, showLabel: true, labelOrientation: "right", color: desmosColors.blue, hidden: true, secret: true },
				{ latex: raw`\frac{\lambda_2 v_2}{1.5}`, label: raw`λ₂v₂`, showLabel: true, labelOrientation: "below", color: desmosColors.blue, hidden: true, secret: true },
			]
		},
	});
}