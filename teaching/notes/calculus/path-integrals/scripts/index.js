import {
	createDesmosGraphs,
	desmosBlack,
	getDesmosPoint,
	getDesmosVector
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		conservativeVectorField3:
		{
			alwaysDark: true,
			
			bounds: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },

			options: { showResetButtonOnGraphpaper: false },
			
			expressions:
			[
				{ latex: raw`xy = c`, secret: true, color: desmosBlack },
				{ latex: raw`c = [-20, -19, ..., 20]`, hidden: true, secret: true },

				...getDesmosPoint({
					point: ["1", "1"],
					color: desmosBlack,
					dragMode: "NONE",
					size: 12,
				}),

				...getDesmosVector({
					from: ["1", "1"],
					to: ["1.35", "1.35"],
					color: desmosBlack,
					arrowSize: "0.1",
				}),

				...getDesmosVector({
					from: ["1", "1"],
					to: ["0.65", "0.65"],
					color: desmosBlack,
					arrowSize: "0.1",
				}),
			]
		},
	});
}