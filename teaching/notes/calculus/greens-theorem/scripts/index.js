import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosSlider,
	getDesmosVector
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

		negativeBoundaryCurve:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25, zmin: -3, zmax: 3 },
			
			expressions:
			[
				{ latex: raw`f(x) = \sqrt{x}`, hidden: true, secret: true },

				{ latex: raw`y = \sqrt{x}\{ 0 \leq x \leq 1 \}`, color: desmosPurple },
				{ latex: raw`y = 0\{ 0 \leq x \leq 1 \}`, color: desmosBlue },
				{ latex: raw`x = 1\{ 0 \leq y \leq 1 \}`, color: desmosRed },

				...getDesmosVector({
					from: ["0.4", "f(0.4)"],
					to: ["0.4 + 0.001", "f(0.4) + 0.001f'(0.4)"],
					color: desmosPurple,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["0.5", "0"],
					to: ["0.5 - 0.001", "0"],
					color: desmosBlue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["1", "0.5"],
					to: ["1", "0.5 - 0.001"],
					color: desmosRed,
					arrowSize: "0.05",
				}),
			]
		},

		positiveBoundaryCurve:
		{
			bounds: { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25, zmin: -3, zmax: 3 },
			
			expressions:
			[
				{ latex: raw`f(x) = \sqrt{x}`, hidden: true, secret: true },

				{ latex: raw`y = \sqrt{x}\{ 0 \leq x \leq 1 \}`, color: desmosPurple },
				{ latex: raw`y = 0\{ 0 \leq x \leq 1 \}`, color: desmosBlue },
				{ latex: raw`x = 1\{ 0 \leq y \leq 1 \}`, color: desmosRed },

				...getDesmosVector({
					from: ["0.4", "f(0.4)"],
					to: ["0.4 - 0.001", "f(0.4) - 0.001f'(0.4)"],
					color: desmosPurple,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["0.5", "0"],
					to: ["0.5 + 0.001", "0"],
					color: desmosBlue,
					arrowSize: "0.05",
				}),

				...getDesmosVector({
					from: ["1", "0.5"],
					to: ["1", "0.5 + 0.001"],
					color: desmosRed,
					arrowSize: "0.05",
				}),
			]
		},
	});
}