import { hsvToHex } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs,
	getColored3DCurve,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		parametricCurveShaping:
		{
			use3d: true,

			options: { showPlane3D: false },

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				{ latex: raw`l(t) = (\cos(2t), \sin(2t), t)`, hidden: true },
				...getColored3DCurve({
					pathFunction: (t) => [t, 0, 0],
					pathFunctionDesmos: raw`(1 - s) (1, 0, 0)t + s l(6(t-0.5))`,
					minT: 0,
					maxT: 1,
					numSlices: 100,
					colorFunction: ([x]) =>
					{
						return hsvToHex(1 - 0.5 * x, 1, 1);
					}
				}),

				...getDesmosSlider({
					expression: "s = 0",
					min: 0,
					max: 1,
					secret: false
				}),
			]
		},
	});
}