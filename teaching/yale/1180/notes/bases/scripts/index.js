import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	getDesmosPoint,
	getDesmosSlider,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		coordinateSystems:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`a = -\frac{1}{3}c + \frac{2}{3}d`, secret: true },
				{ latex: raw`b = \frac{1}{3}c + \frac{1}{3}d`, secret: true },

				{ latex: raw`A = [ 0, ..., \floor(\abs(a))\sign(a) ]`, secret: true },

				...getDesmosSlider({
					expression: raw`c = 3`,
					min: -5,
					max: 5,
					secret: false,
				}),

				{ latex: raw`B = [ 0, ..., \floor(\abs(b))\sign(b) ]`, secret: true },
				
				...getDesmosSlider({
					expression: raw`d = 2`,
					min: -5,
					max: 5,
					secret: false,
				}),

				...getDesmosPoint({
					point: ["c", "d"],
					color: desmosColors.black,
					dragMode: desmosDragModes.XY,
					secret: false,
				}),

				...(Array(5).fill().map((_, i) => getDesmosVector({
					from: [`-A[${i + 1}]`, `A[${i + 1}]`],
					to: [`-A[${i + 2}]`, `A[${i + 2}]`],
					color: desmosColors.red,
					secret: true
				})).flat()),

				...(Array(5).fill().map((_, i) => getDesmosVector({
					from: [`-a + 2B[${i + 1}]`, `a + B[${i + 1}]`],
					to: [`-a + 2B[${i + 2}]`, `a + B[${i + 2}]`],
					color: desmosColors.blue,
					secret: true
				})).flat()),

				...getDesmosVector({
					from: [raw`-\floor(\abs(a))\sign(a)`, raw`\floor(\abs(a))\sign(a)`],
					to: [raw`-(a + 0.00001\sign(a))`, raw`(a + 0.00001\sign(a))`],
					color: desmosColors.red,
				}),

				...getDesmosVector({
					from: [raw`-a + 2\floor(\abs(b))\sign(b)`, raw`a + \floor(\abs(b))\sign(b)`],
					to: [raw`-a + 2(b + 0.00001\sign(b))`, raw`a + (b + 0.00001\sign(b))`],
					color: desmosColors.blue,
				}),

				...getDesmosVector({
					from: ["0", "0"],
					to: ["c", "d"],
					color: desmosColors.purple,
				}),
			]
		}
	});
}