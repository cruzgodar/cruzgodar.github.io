import {
	createDesmosGraphs,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		voxels:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.61, -0.72, -0.33, 0.63, -0.7, 0.34, -0.48, 0, 0.88]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -1.25, zmax: 1.25 },

			expressions:
			[
				{ latex: raw`f(x, y, z) = \frac{1}{1.5} x + y + z`, hidden: true },

				...getDesmosSlider({
					expression: "n = 8",
					min: 4,
					max: 16,
					step: 1,
					secret: false
				}),

				{ latex: raw`X = [(i, j) \for i = [-1 + \frac{1}{n}, -1 + \frac{3}{n}, ..., 1 - \frac{1}{n}], j = [-1 + \frac{1}{n}, -1 + \frac{3}{n}, ..., 1 - \frac{1}{n}]]`, hidden: true, secret: true },

				// Cube rounding
				{ latex: raw`N(x) = \frac{2}{n}(\round(\frac{n}{2}x + \frac{\mod(n, 2)}{2}) - \frac{\mod(n, 2)}{2})`, hidden: true, secret: true },

				// Function color rounding
				{ latex: raw`N_f(x) = \frac{2}{n}(\round(\frac{n}{2}x + \frac{1 - \mod(n, 2)}{2}) - \frac{1 - \mod(n, 2)}{2})`, hidden: true, secret: true },

				{ latex: raw`\left|z\right| \leq N(\sqrt{1 - X.x^2 - X.y^2}) \{X.x - \frac{1}{n} \leq x \leq X.x + \frac{1}{n}\} \{X.y - \frac{1}{n} \leq y \leq X.y + \frac{1}{n}\} \{ \left|X\right| < 1 \}`, colorLatex: "C", secret: true },
				
				// the purple, red, and blue amounts
				{ latex: raw`f_R(x, y, z) = f(N_f(x), N_f(y), N_f(z))`, hidden: true, secret: true },
				{ latex: raw`P(x, y, z) = e^{-f_R(x, y, z)^2}`, secret: true },
				{ latex: raw`R(x, y, z) = \{ f_R(x, y, z) \geq 0 : 1 - P(x, y, z), f_R(x, y, z) < 0: 0 \}`, secret: true },
				{ latex: raw`B(x, y, z) = \{ f_R(x, y, z) \leq 0 : 1 - P(x, y, z), f_R(x, y, z) > 0: 0 \}`, secret: true },

				{ latex: raw`C = \rgb(204R(x, y, z) + 40B(x, y, z) + 122P(x, y, z), 40R(x, y, z) + 122B(x, y, z) + 40P(x, y, z), 40R(x, y, z) + 204B(x, y, z) + 205P(x, y, z))`, secret: true },
			]
		}
	});
}