import { VectorField } from "/applets/vector-fields/scripts/class.js";
import { createEmphemeralApplet } from "/scripts/applets/applet.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosSlider
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	createDesmosGraphs({
		vectorField:
		{
			bounds: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 },

			expressions:
			[
				{ latex: raw`f_1(x, y) = -ay`, hidden: true },
				{ latex: raw`f_2(x, y) = x - by`, hidden: true },

				{ latex: raw`(a, b)`, color: desmosRed },

				{ latex: raw`a = 2`, secret: true },
				{ latex: raw`b = 3`, secret: true },

				{ latex: raw`c = \sqrt{b^2 - 4a}`, secret: true },
				{ latex: raw`d = \sqrt{-(b^2 - 4a)}`, secret: true },
				{ latex: raw`y - 2 = \frac{2}{b - c}(x - (b - c))`, color: desmosBlue, secret: true },
				{ latex: raw`y - 2 = \frac{2}{b + c}(x - (b + c))`, color: desmosBlue, secret: true },

				{ latex: raw`I = [0, ..., 24]`, secret: true },
				{ latex: raw`C = [-2, -1, 0, 1, 2]`, secret: true },
				{ latex: raw`C_1 = C[\floor(I / 5) + 1]`, secret: true },
				{ latex: raw`C_2 = C[\mod(I, 5) + 1]`, secret: true },
				{ latex: raw`l_1 = \frac{1}{2}(-b - c) \{c \geq 0\}`, secret: true },
				{ latex: raw`l_2 = \frac{1}{2}(-b + c) \{c \geq 0\}`, secret: true },
				{ latex: raw`v_1 = [\frac{1}{2}(b - c), 1] \{c \geq 0\}`, secret: true },
				{ latex: raw`v_2 = [\frac{1}{2}(b + c), 1] \{c \geq 0\}`, secret: true },


				{ latex: raw`(C_1 e^{l_1 t}v_1[1] + C_2 e^{l_2 t}v_2[1], C_1 e^{l_1 t}v_1[2] + C_2 e^{l_2 t}v_2[2])`, color: desmosBlue, parametricDomain: { min: -10, max: 10 }, secret: true },

				{ latex: raw`(e^{l_1 t}v_1[1], e^{l_1 t}v_1[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(e^{l_2 t}v_2[1], e^{l_2 t}v_2[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{l_1 t}v_1[1], -e^{l_1 t}v_1[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{l_2 t}v_2[1], -e^{l_2 t}v_2[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },

				{ latex: raw`(C_1 e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)) + C_2 e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), C_1 e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt) + C_2e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlue, parametricDomain: { min: -10, max: 10 }, secret: true },

				{ latex: raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },

				{ latex: raw`A = [(i, j) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(f_1(i, j), f_2(i, j)) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`A + \frac{ts}{25}B`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`S = [\arctan(f_2(i, j), f_1(i, j)) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`M = [\left|(f_2(i, j), f_1(i, j))\right| \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`L = \frac{M}{50}`, hidden: true, secret: true },

				{ latex: raw`T_1 = -(.35\cos(S + 0.5), .35\sin(S + 0.5))`, hidden: true, secret: true },
				{ latex: raw`T_2 = -(.35\cos(S - 0.5), .35\sin(S - 0.5))`, hidden: true, secret: true },
				
				{ latex: raw`A + \frac{s}{25}B + tsL(T_1)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`A + \frac{s}{25}B + tsL(T_2)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				...getDesmosSlider({
					expression: "n = 12",
					min: 1,
					max: 20,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 0.75",
					min: 0.5,
					max: 2,
					secret: false
				}),
			]
		},



		vectorField2:
		{
			bounds: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 },

			expressions:
			[
				{ latex: raw`f_1(x, y) = -ay`, hidden: true },
				{ latex: raw`f_2(x, y) = x - by`, hidden: true },

				{ latex: raw`a = -3`, secret: true },
				{ latex: raw`b = -2`, secret: true },

				{ latex: raw`c = \sqrt{b^2 - 4a}`, secret: true },
				{ latex: raw`d = \sqrt{-(b^2 - 4a)}`, secret: true },
				{ latex: raw`y - 2 = \frac{2}{b - c}(x - (b - c))`, color: desmosBlue, secret: true },
				{ latex: raw`y - 2 = \frac{2}{b + c}(x - (b + c))`, color: desmosBlue, secret: true },

				{ latex: raw`I = [0, ..., 24]`, secret: true },
				{ latex: raw`C = [-2, -1, 0, 1, 2]`, secret: true },
				{ latex: raw`C_1 = C[\floor(I / 5) + 1]`, secret: true },
				{ latex: raw`C_2 = C[\mod(I, 5) + 1]`, secret: true },
				{ latex: raw`l_1 = \frac{1}{2}(-b - c) \{c \geq 0\}`, secret: true },
				{ latex: raw`l_2 = \frac{1}{2}(-b + c) \{c \geq 0\}`, secret: true },
				{ latex: raw`v_1 = [\frac{1}{2}(b - c), 1] \{c \geq 0\}`, secret: true },
				{ latex: raw`v_2 = [\frac{1}{2}(b + c), 1] \{c \geq 0\}`, secret: true },


				{ latex: raw`(C_1 e^{l_1 t}v_1[1] + C_2 e^{l_2 t}v_2[1], C_1 e^{l_1 t}v_1[2] + C_2 e^{l_2 t}v_2[2])`, color: desmosBlue, parametricDomain: { min: -10, max: 10 }, secret: true },

				{ latex: raw`(e^{l_1 t}v_1[1], e^{l_1 t}v_1[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(e^{l_2 t}v_2[1], e^{l_2 t}v_2[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{l_1 t}v_1[1], -e^{l_1 t}v_1[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{l_2 t}v_2[1], -e^{l_2 t}v_2[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },

				{ latex: raw`(C_1 e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)) + C_2 e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), C_1 e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt) + C_2e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlue, parametricDomain: { min: -10, max: 10 }, secret: true },

				{ latex: raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },

				{ latex: raw`A = [(i, j) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(f_1(i, j), f_2(i, j)) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`A + \frac{ts}{25}B`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`S = [\arctan(f_2(i, j), f_1(i, j)) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`M = [\left|(f_2(i, j), f_1(i, j))\right| \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`L = \frac{M}{50}`, hidden: true, secret: true },

				{ latex: raw`T_1 = -(.35\cos(S + 0.5), .35\sin(S + 0.5))`, hidden: true, secret: true },
				{ latex: raw`T_2 = -(.35\cos(S - 0.5), .35\sin(S - 0.5))`, hidden: true, secret: true },
				
				{ latex: raw`A + \frac{s}{25}B + tsL(T_1)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`A + \frac{s}{25}B + tsL(T_2)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				...getDesmosSlider({
					expression: "n = 12",
					min: 1,
					max: 20,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 0.75",
					min: 0.5,
					max: 2,
					secret: false
				}),
			]
		},



		vectorField3:
		{
			bounds: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 },

			expressions:
			[
				{ latex: raw`f_1(x, y) = -ay`, hidden: true },
				{ latex: raw`f_2(x, y) = x - by`, hidden: true },

				{ latex: raw`a = 4`, secret: true },
				{ latex: raw`b = 5`, secret: true },

				{ latex: raw`c = \sqrt{b^2 - 4a}`, secret: true },
				{ latex: raw`d = \sqrt{-(b^2 - 4a)}`, secret: true },
				{ latex: raw`y - 2 = \frac{2}{b - c}(x - (b - c))`, color: desmosBlue, secret: true },
				{ latex: raw`y - 2 = \frac{2}{b + c}(x - (b + c))`, color: desmosBlue, secret: true },

				{ latex: raw`I = [0, ..., 24]`, secret: true },
				{ latex: raw`C = [-2, -1, 0, 1, 2]`, secret: true },
				{ latex: raw`C_1 = C[\floor(I / 5) + 1]`, secret: true },
				{ latex: raw`C_2 = C[\mod(I, 5) + 1]`, secret: true },
				{ latex: raw`l_1 = \frac{1}{2}(-b - c) \{c \geq 0\}`, secret: true },
				{ latex: raw`l_2 = \frac{1}{2}(-b + c) \{c \geq 0\}`, secret: true },
				{ latex: raw`v_1 = [\frac{1}{2}(b - c), 1] \{c \geq 0\}`, secret: true },
				{ latex: raw`v_2 = [\frac{1}{2}(b + c), 1] \{c \geq 0\}`, secret: true },


				{ latex: raw`(C_1 e^{l_1 t}v_1[1] + C_2 e^{l_2 t}v_2[1], C_1 e^{l_1 t}v_1[2] + C_2 e^{l_2 t}v_2[2])`, color: desmosBlue, parametricDomain: { min: -10, max: 10 }, secret: true },

				{ latex: raw`(e^{l_1 t}v_1[1], e^{l_1 t}v_1[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(e^{l_2 t}v_2[1], e^{l_2 t}v_2[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{l_1 t}v_1[1], -e^{l_1 t}v_1[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{l_2 t}v_2[1], -e^{l_2 t}v_2[2])`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },

				{ latex: raw`(C_1 e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)) + C_2 e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), C_1 e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt) + C_2e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlue, parametricDomain: { min: -10, max: 10 }, secret: true },

				{ latex: raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },
				{ latex: raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: desmosBlack, parametricDomain: { min: -100, max: 100 }, secret: true },

				{ latex: raw`A = [(i, j) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(f_1(i, j), f_2(i, j)) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`A + \frac{ts}{25}B`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`S = [\arctan(f_2(i, j), f_1(i, j)) \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`M = [\left|(f_2(i, j), f_1(i, j))\right| \for i = [-n, -n+1, ..., n], j = [-n, -n+1, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`L = \frac{M}{50}`, hidden: true, secret: true },

				{ latex: raw`T_1 = -(.35\cos(S + 0.5), .35\sin(S + 0.5))`, hidden: true, secret: true },
				{ latex: raw`T_2 = -(.35\cos(S - 0.5), .35\sin(S - 0.5))`, hidden: true, secret: true },
				
				{ latex: raw`A + \frac{s}{25}B + tsL(T_1)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`A + \frac{s}{25}B + tsL(T_2)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				...getDesmosSlider({
					expression: "n = 12",
					min: 1,
					max: 20,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 0.75",
					min: 0.5,
					max: 2,
					secret: false
				}),
			]
		},

		autonomousSystem:
		{
			bounds: { xmin: -4, xmax: 4, ymin: -4, ymax: 4 },
			
			expressions:
			[
				{ latex: raw`f_1(x, y) = y^2`, hidden: true },
				{ latex: raw`f_2(x, y) = 1 - x^2`, hidden: true },

				...getDesmosSlider({
					expression: "c = 0",
					min: -100,
					max: 100,
					secret: false
				}),

				{ latex: raw`y^3 + x^3 - 3x = c`, color: desmosBlue },

				...getDesmosSlider({
					expression: "n = 12",
					min: 1,
					max: 20,
					step: 1,
					secret: false
				}),

				...getDesmosSlider({
					expression: "s = 0.75",
					min: 0.5,
					max: 2,
					secret: false
				}),

				{ latex: raw`A = [(a, b) \for a = [-n, -n+0.5, ..., n], b = [-n, -n+0.5, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`B = [(f_1(a, b), f_2(a, b)) \for a = [-n, -n+0.5, ..., n], b = [-n, -n+0.5, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`A + \frac{ts}{25}B`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },

				{ latex: raw`S = [\arctan(f_2(a, b), f_1(a, b)) \for a = [-n, -n+0.5, ..., n], b = [-n, -n+0.5, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`M = [\left|(f_2(a, b), f_1(a, b))\right| \for a = [-n, -n+0.5, ..., n], b = [-n, -n+0.5, ..., n]]`, hidden: true, secret: true },
				{ latex: raw`L = \frac{M}{50}`, hidden: true, secret: true },

				{ latex: raw`T_1 = -(.35\cos(S + 0.5), .35\sin(S + 0.5))`, hidden: true, secret: true },
				{ latex: raw`T_2 = -(.35\cos(S - 0.5), .35\sin(S - 0.5))`, hidden: true, secret: true },
				
				{ latex: raw`A + \frac{s}{25}B + tsL(T_1)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },
				{ latex: raw`A + \frac{s}{25}B + tsL(T_2)`, color: desmosPurple, lineOpacity: 0.5, parametricDomain: { min: 0, max: 1 }, secret: true },
			]
		},
	});


	
	createEmphemeralApplet($("#vector-field-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: "((x - 1.0) * (x + 1.0), (y + 1.0) * (y - 1.0))",
				dt: .002,
				worldWidth: 3
			});
		});

		return applet;
	});



	createEmphemeralApplet($("#autonomous-system-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: "(y*y, 1.0 - x*x)",
				dt: .002,
				worldWidth: 4
			});
		});

		return applet;
	});



	createEmphemeralApplet($("#pendulum-canvas"), (canvas) =>
	{
		const applet = new VectorField({ canvas });

		applet.loadPromise.then(() =>
		{
			applet.run({
				generatingCode: "(y, -.5*y - sin(x))",
				dt: .002,
				worldWidth: 12
			});
		});

		return applet;
	});
}