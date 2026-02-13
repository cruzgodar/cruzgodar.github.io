import {
	createDesmosGraphs,
	desmosBlack,
	desmosPurple,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		slicingAndBoundaries:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25, zmin: -3, zmax: 3 },
			
			expressions:
			[
				{ latex: raw`y = \sqrt{x}\{ 0 \leq x \leq 1 \}`, color: desmosBlack },
				{ latex: raw`y = 0\{ 0 \leq x \leq 1 \}`, color: desmosBlack },
				{ latex: raw`x = 1\{ 0 \leq y \leq 1 \}`, color: desmosBlack },

				...getDesmosSlider({
					expression: raw`x_0 = 0.75`,
					min: 0,
					max: 1,
					secret: false
				}),

				{ latex: raw`x = x_0\{ 0 \leq y \leq \sqrt{x_0} \}`, color: desmosPurple },
			]
		},
	});
}