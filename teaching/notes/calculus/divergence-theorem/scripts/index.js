import {
	createDesmosGraphs,
	desmosColors
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		iceCreamCone:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.72, -0.67, -0.17, 0.65, -0.75, 0.16, -0.23, 0, 0.97]
			},

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`0 \leq \sqrt{x^2 + y^2 + z^2} \leq 2\{y \geq 0\}\{\arccos(\max(-1, \min(1, \frac{z}{\sqrt{x^2 + y^2 + z^2}}))) \leq \frac{\pi}{6}\}`, color: desmosColors.purple },
			]
		}
	});
}