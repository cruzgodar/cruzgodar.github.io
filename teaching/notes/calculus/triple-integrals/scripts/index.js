import {
	createDesmosGraphs,
	desmosColors,
	getColorLatexExpressions,
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
				worldRotation3D: [-0.59, -0.71, -0.38, 0.6, -0.7, 0.38, -0.54, 0, 0.84]
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
		},

		chunkRegion:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.72, -0.66, -0.19, 0.64, -0.75, 0.17, -0.26, 0, 0.97]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -1.25, zmax: 1.25 },

			expressions:
			[
				{ latex: raw`f(x, y, z) = 1.25(z + x - 0.25)`, hidden: true, secret: true },

				{ latex: raw`x^3 - 1 \leq z \leq y - x^3 \{ x \geq 0 \} \{ y \leq 1 \}`, colorLatex: "C" },

				...getColorLatexExpressions()
			]
		},

		parabolaRegion:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.78, -0.54, -0.32, 0.49, -0.84, 0.21, -0.38, 0, 0.92]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -1.25, zmax: 1.25 },

			expressions:
			[
				{ latex: raw`f(x, y, z) = z - 2y`, hidden: true },

				{ latex: raw`x^2 + y \leq z \leq 1 \{y \geq 0\}`, colorLatex: "C" },

				...getColorLatexExpressions()
			]
		},

		slicedCylinder:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.58, -0.81, -0.13, 0.79, -0.59, 0.18, -0.22, 0, 0.98]
			},

			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, zmin: -3.15, zmax: 6.85 },

			expressions:
			[
				{ latex: raw`f(x, y, z) = \frac{1}{4}(z + y)`, hidden: true, secret: true },

				{ latex: raw`x - 1 \leq z \leq 6 - x^2 - y^2 \{ x^2 + y^2 \leq 4 \}`, colorLatex: "C" },

				...getColorLatexExpressions()
			]
		},

		cylindricalCoordinates:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.81, 0.5, -0.29, -0.47, -0.86, -0.17, -0.34, 0, 0.94]
			},

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -2, zmax: 2 },

			expressions:
			[
				...getDesmosSlider({
					expression: "r_0 = 1",
					min: 0,
					max: 2,
					secret: false,
				}),

				...getDesmosSlider({
					expression: "\\theta_0 = 1",
					min: 0,
					max: "2\\pi",
					secret: false,
				}),

				...getDesmosSlider({
					expression: "z_0 = 1",
					min: -2,
					max: 2,
					secret: false,
				}),

				{ latex: raw`(r_0\cos(\theta_0), r_0\sin(\theta_0), z_0)`, color: desmosColors.purple },

				{ latex: raw`(0, 0, 0), (r_0\cos(\theta_0), r_0\sin(\theta_0), 0)`, color: desmosColors.blue, points: false, lines: true, secret: true },

				{ latex: raw`(r_0\cos(\theta_0), r_0\sin(\theta_0), 0), (r_0\cos(\theta_0), r_0\sin(\theta_0), z_0)`, color: desmosColors.red, points: false, lines: true, secret: true },
			]
		},

		cylindricalGraphs:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				translucentSurfaces: true
			},

			bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4, zmin: -4, zmax: 4 },

			expressions:
			[
				{ latex: raw`r = 3`, color: desmosColors.purple, hidden: true },
				{ latex: raw`\arctan(y, x) = \frac{\pi}{4}`, color: desmosColors.blue, hidden: true },
				{ latex: raw`z = 1`, color: desmosColors.red, hidden: true },
			]
		},

		cylindricalIntegral:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.76, -0.62, 0.19, 0.6, -0.78, -0.15, 0.25, 0, 0.97]
			},

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -0.5, zmax: 4.5 },

			expressions:
			[
				{ latex: raw`x^2+y^2 \leq z \leq 2x`, colorLatex: "C" },

				{ latex: raw`f(x, y, z) = x + y - \frac{1}{2}z`, hidden: true },

				...getColorLatexExpressions()
			]
		},

		sphericalCoordinates:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.87, -0.27, -0.41, 0.25, -0.96, 0.12, -0.43, 0, 0.9]
			},

			bounds: { xmin: -2, xmax: 2, ymin: -2, ymax: 2, zmin: -2, zmax: 2 },

			expressions:
			[
				...getDesmosSlider({
					expression: "\\rho_0 = 1",
					min: 0,
					max: 2,
					secret: false,
				}),

				...getDesmosSlider({
					expression: "\\varphi_0 = 1",
					min: 0,
					max: "\\pi",
					secret: false,
				}),

				...getDesmosSlider({
					expression: "\\theta_0 = 2",
					min: 0,
					max: "2\\pi",
					secret: false,
				}),

				{ latex: raw`(\rho_0\sin(\varphi_0)\cos(\theta_0), \rho_0\sin(\varphi_0)\sin(\theta_0), \rho_0\cos(\varphi_0))`, color: desmosColors.orange },

				{ latex: raw`(0, 0, 0), (\rho_0\sin(\varphi_0)\cos(\theta_0), \rho_0\sin(\varphi_0)\sin(\theta_0), \rho_0\cos(\varphi_0))`, color: desmosColors.purple, points: false, lines: true, secret: true },

				{ latex: raw`(0, 0, 0.5\cos(t)) + 0.5\sin(t)(\cos(\theta_0), \sin(\theta_0), 0)`, parametricDomain: { min: 0, max: "\\varphi_0" }, color: desmosColors.blue, secret: true },

				{ latex: raw`0.5(\cos(t), \sin(t), 0)`, parametricDomain: { min: 0, max: "\\theta_0" }, color: desmosColors.red, secret: true },
				{ latex: raw`\frac{0.5}{\sin(\varphi_0)}(\sin(\varphi_0)\cos(\theta_0), \sin(\varphi_0)\sin(\theta_0), \cos(\varphi_0)), \frac{0.5}{\sin(\varphi_0)}(\sin(\varphi_0)\cos(\theta_0), \sin(\varphi_0)\sin(\theta_0), 0)`, color: desmosColors.gray, points: false, lines: true, secret: true },
			]
		},

		sphericalRiemannSum:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				worldRotation3D: [-0.67, 0.71, -0.21, -0.68, -0.7, -0.22, -0.3, 0, 0.95]
			},

			bounds: { xmin: -1.25, xmax: 1.25, ymin: -1.25, ymax: 1.25, zmin: -1.25, zmax: 1.25 },

			expressions:
			[
				{ latex: raw`f(a, b, c) = a \sin(c) \cos(b) - a \sin(c) \sin(b) + 1.5a \cos(c)`, hidden: true, secret: true },

				...getDesmosSlider({
					expression: "n = 5",
					min: 2,
					max: 8,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\rho_{min} = 0.5`,
					min: 0,
					max: 1,
					secret: false
				}),
				...getDesmosSlider({
					expression: raw`\rho_{max} = 1`,
					min: 0,
					max: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\varphi_{min} = 0.8`,
					min: 0,
					max: raw`\pi`,
					secret: false
				}),
				...getDesmosSlider({
					expression: raw`\varphi_{max} = 2.1`,
					min: 0,
					max: raw`\pi`,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\theta_{min} = 1.7`,
					min: 0,
					max: raw`2\pi`,
					secret: false
				}),
				...getDesmosSlider({
					expression: raw`\theta_{max} = 6.1`,
					min: 0,
					max: raw`2\pi`,
					secret: false
				}),

				// Spherical coords from Cartesian
				{ latex: raw`T(x, y) = \mod(\arctan(y, x), 2\pi)`, hidden: true, secret: true },
				{ latex: raw`A(x, y, z) = \arccos(\max(-1, \min(1, \frac{z}{\sqrt{x^2 + y^2 + z^2}})))`, hidden: true, secret: true },

				// Color rounding: ρ midpoints in [ρ_min, ρ_max]
				{ latex: raw`N_{rho}(x) = \rho_{min} + \frac{\rho_{max} - \rho_{min}}{n}(\floor(\frac{n(x - \rho_{min})}{\rho_{max} - \rho_{min}}) + \frac{1}{2})`, hidden: true, secret: false },

				// Color rounding: θ midpoints in [θ_min, θ_max]
				{ latex: raw`N_{theta}(x) = \theta_{min} + \frac{\theta_{max} - \theta_{min}}{n}(\floor(\frac{n(x - \theta_{min})}{\theta_{max} - \theta_{min}}) + \frac{1}{2})`, hidden: true, secret: false },

				// Color rounding: φ midpoints in [φ_min, φ_max]
				{ latex: raw`N_{phi}(x) = \varphi_{min} + \frac{\varphi_{max} - \varphi_{min}}{n}(\floor(\frac{n(x - \varphi_{min})}{\varphi_{max} - \varphi_{min}}) + \frac{1}{2})`, hidden: true, secret: false },

				{ latex: raw`\rho_{min}^2 \leq x^2 + y^2 + z^2 \leq \rho_{max}^2 \{\theta_{min} \leq T(x, y) \leq \theta_{max}\} \{\varphi_{min} \leq A(x, y, z) \leq \varphi_{max}\}`, colorLatex: "C", secret: true },

				{ latex: raw`f_R(x, y, z) = f(N_{rho}(\sqrt{x^2 + y^2 + z^2}), N_{theta}(T(x, y)), N_{phi}(A(x, y, z)))`, hidden: true, secret: true },
				{ latex: raw`P(x, y, z) = e^{-f_R(x, y, z)^2}`, secret: true },
				{ latex: raw`R(x, y, z) = \{ f_R(x, y, z) \geq 0 : 1 - P(x, y, z), f_R(x, y, z) < 0: 0 \}`, secret: true },
				{ latex: raw`B(x, y, z) = \{ f_R(x, y, z) \leq 0 : 1 - P(x, y, z), f_R(x, y, z) > 0: 0 \}`, secret: true },

				{ latex: raw`C = \rgb(204R(x, y, z) + 40B(x, y, z) + 122P(x, y, z), 40R(x, y, z) + 122B(x, y, z) + 40P(x, y, z), 40R(x, y, z) + 204B(x, y, z) + 205P(x, y, z))`, secret: true },
			]
		},

		sphericalRiemannSumChunk:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				showNumbers3D: false,
				worldRotation3D: [-0.7, -0.68, -0.22, 0.65, -0.73, 0.2, -0.3, 0, 0.95]
			},

			bounds: { xmin: -1, xmax: 1, ymin: -1, ymax: 1, zmin: -1, zmax: 1 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`\rho_0 = 0.75`,
					min: 0,
					max: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\varphi_0 = 0.7`,
					min: 0,
					max: raw`\pi`,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\theta_0 = 1.57`,
					min: 0,
					max: raw`2\pi`,
					secret: false
				}),

				{ latex: raw`\rho_1 = \rho_0 + 0.25`, hidden: true, secret: true },
				{ latex: raw`\varphi_1 = \varphi_0 + 0.3`, hidden: true, secret: true },
				{ latex: raw`\theta_1 = \theta_0 + 0.6`, hidden: true, secret: true },

				{ latex: raw`T(x, y) = \mod(\arctan(y, x), 2\pi)`, hidden: true, secret: true },
				{ latex: raw`A(x, y, z) = \arccos(\max(-1, \min(1, \frac{z}{\sqrt{x^2 + y^2 + z^2}})))`, hidden: true, secret: true },

				{ latex: raw`\rho_0^2 \leq x^2 + y^2 + z^2 \leq \rho_1^2 \{\theta_0 \leq T(x, y) \leq \theta_1\} \{\varphi_0 \leq A(x, y, z) \leq \varphi_1\}`, color: desmosColors.gray, secret: true },

				
				{ latex: raw`(t\sin(\varphi_1)\cos(\theta_0), t\sin(\varphi_1)\sin(\theta_0), t\cos(\varphi_1))`, color: desmosColors.purple, parametricDomain: { min: "\\rho_0", max: "\\rho_1" }, secret: true },

				{ latex: raw`(\rho_0\sin(t)\cos(\theta_0), \rho_0\sin(t)\sin(\theta_0), \rho_0\cos(t))`, color: desmosColors.blue, parametricDomain: { min: "\\varphi_0", max: "\\varphi_1" }, secret: true },

				{ latex: raw`(\rho_0\sin(\varphi_1)\cos(t), \rho_0\sin(\varphi_1)\sin(t), \rho_0\cos(\varphi_1))`, color: desmosColors.red, parametricDomain: { min: "\\theta_0", max: "\\theta_1" }, secret: true },



				{ latex: raw`(t\sin([\varphi_0, \varphi_1])\cos([\theta_0, \theta_0]), t\sin([\varphi_0, \varphi_1])\sin([\theta_0, \theta_0]), t\cos([\varphi_0, \varphi_1]))`, color: desmosColors.gray, parametricDomain: { min: "0", max: "\\rho_0" }, secret: true },

				{ latex: raw`(0, 0, \min(0.25, \frac{\rho_0}{2})\cos(t)) + \min(0.25, \frac{\rho_0}{2})\sin(t)(\cos(\theta_0), \sin(\theta_0), 0)`, parametricDomain: { min: "\\varphi_0", max: "\\varphi_1" }, color: desmosColors.blue, secret: true },
			]
		},

		sphericalRiemannSumChunkTheta:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				showNumbers3D: false,
				worldRotation3D: [-0.7, -0.68, -0.22, 0.65, -0.73, 0.2, -0.3, 0, 0.95]
			},

			bounds: { xmin: -1, xmax: 1, ymin: -1, ymax: 1, zmin: -1, zmax: 1 },

			expressions:
			[
				...getDesmosSlider({
					expression: raw`\rho_0 = 0.75`,
					min: 0,
					max: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\varphi_0 = 0.7`,
					min: 0,
					max: raw`\pi`,
					secret: false
				}),

				...getDesmosSlider({
					expression: raw`\theta_0 = 1.57`,
					min: 0,
					max: raw`2\pi`,
					secret: false
				}),

				{ latex: raw`\rho_1 = \rho_0 + 0.25`, hidden: true, secret: true },
				{ latex: raw`\varphi_1 = \varphi_0 + 0.3`, hidden: true, secret: true },
				{ latex: raw`\theta_1 = \theta_0 + 0.6`, hidden: true, secret: true },

				{ latex: raw`T(x, y) = \mod(\arctan(y, x), 2\pi)`, hidden: true, secret: true },
				{ latex: raw`A(x, y, z) = \arccos(\max(-1, \min(1, \frac{z}{\sqrt{x^2 + y^2 + z^2}})))`, hidden: true, secret: true },

				{ latex: raw`\rho_0^2 \leq x^2 + y^2 + z^2 \leq \rho_1^2 \{\theta_0 \leq T(x, y) \leq \theta_1\} \{\varphi_0 \leq A(x, y, z) \leq \varphi_1\}`, color: desmosColors.gray, secret: true },

				
				{ latex: raw`(t\sin(\varphi_1)\cos(\theta_0), t\sin(\varphi_1)\sin(\theta_0), t\cos(\varphi_1))`, color: desmosColors.purple, parametricDomain: { min: "\\rho_0", max: "\\rho_1" }, secret: true },

				{ latex: raw`(\rho_0\sin(t)\cos(\theta_0), \rho_0\sin(t)\sin(\theta_0), \rho_0\cos(t))`, color: desmosColors.blue, parametricDomain: { min: "\\varphi_0", max: "\\varphi_1" }, secret: true },

				{ latex: raw`(\rho_0\sin(\varphi_1)\cos(t), \rho_0\sin(\varphi_1)\sin(t), \rho_0\cos(\varphi_1))`, color: desmosColors.red, parametricDomain: { min: "\\theta_0", max: "\\theta_1" }, secret: true },



				{ latex: raw`(t\sin([\varphi_1, \varphi_1])\cos([\theta_0, \theta_1]), t\sin([\varphi_1, \varphi_1])\sin([\theta_0, \theta_1]), t\cos([\varphi_1, \varphi_1]))`, color: desmosColors.gray, parametricDomain: { min: "0", max: "\\rho_0" }, secret: true },

				{ latex: raw`(\rho_0\sin([\varphi_1, \varphi_1])\cos([\theta_0, \theta_1]), \rho_0\sin([\varphi_1, \varphi_1])\sin([\theta_0, \theta_1]), t\rho_0\cos([\varphi_1, \varphi_1]))`, color: desmosColors.gray, parametricDomain: { min: "0", max: "1" }, secret: true },

				{ latex: raw`(t\sin([\varphi_1, \varphi_1])\cos([\theta_0, \theta_1]), t\sin([\varphi_1, \varphi_1])\sin([\theta_0, \theta_1]), 0)`, color: desmosColors.orange, parametricDomain: { min: "0", max: "\\rho_0" }, secret: true },

				{ latex: raw`([\min(0.25, \frac{1}{2}\rho_0\sin(\varphi_1)), \rho_0\sin(\varphi_1)]\cos(t), [\min(0.25, \frac{1}{2}\rho_0\sin(\varphi_1)), \rho_0\sin(\varphi_1)]\sin(t), 0)`, parametricDomain: { min: "\\theta_0", max: "\\theta_1" }, color: desmosColors.red, secret: true },

				{ latex: raw`(\rho_0\cos(t), \rho_0\sin(t), 0)`, parametricDomain: { min: "\\theta_0", max: "\\theta_1" }, color: desmosColors.purple, secret: true },
			]
		},

		sphericalGraphs:
		{
			use3d: true,

			options: {
				showPlane3D: false,
				translucentSurfaces: true
			},

			bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4, zmin: -4, zmax: 4 },

			expressions:
			[
				{ latex: raw`\rho = 3`, color: desmosColors.purple, hidden: true },
				{ latex: raw`\arccos(\max(-1, \min(1, \frac{z}{\sqrt{x^2 + y^2 + z^2}}))) = \frac{\pi}{3}`, color: desmosColors.blue, hidden: true },
				{ latex: raw`\arctan(y, x) = \frac{\pi}{4}`, color: desmosColors.red, hidden: true },
			]
		},
	});
}