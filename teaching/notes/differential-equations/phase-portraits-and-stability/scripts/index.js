import { showPage } from "../../../../../../scripts/src/loadPage.js";
import { VectorFields } from "/applets/vector-fields/scripts/class.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { $, raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			vectorField:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x_1, x_2) = [ -ax_2, x_1 - bx_2 ]` },

					{ latex: raw`(a, b)`, color: desmosRed },

					{ latex: raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true },

					{ latex: raw`z = -2.86`, secret: true },
					{ latex: raw`k = .33`, secret: true },

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

					{ latex: raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },

					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
				]
			},



			vectorField2:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x_1, x_2) = [ -ax_2, x_1 - bx_2 ]`, secret: true },

					{ latex: raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true },

					{ latex: raw`z = -2.86`, secret: true },
					{ latex: raw`k = .33`, secret: true },

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

					{ latex: raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },

					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
				]
			},



			vectorField3:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x_1, x_2) = [ -ax_2, x_1 - bx_2 ]`, secret: true },

					{ latex: raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true },

					{ latex: raw`z = -2.86`, secret: true },
					{ latex: raw`k = .33`, secret: true },

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

					{ latex: raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },

					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
				]
			},



			autonomousSystem:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				expressions:
				[
					{ latex: raw`f(x_1, x_2) = [x_2^2, 1 - x_1^2]` },

					{ latex: raw`F(x_1, x_2) = \frac{1}{10} f(x_1, x_2)`, secret: true },

					{ latex: raw`z = -2.86`, secret: true },
					{ latex: raw`k = .33`, secret: true },

					{ latex: raw`y^3 + x^3 - 3x = c`, color: desmosBlue },
					{ latex: raw`c = 0`, sliderBounds: { min: -100, max: 100 } },

					{ latex: raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true },
					{ latex: raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true },
					{ latex: raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true },
					{ latex: raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },
					{ latex: raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true },

					{ latex: raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },

					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
					{ latex: raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: desmosPurple, lineOpacity: .25, parametricDomain: { min: -100, max: 100 }, secret: true },
				]
			},
		};

		return data;
	});

	createDesmosGraphs();



	const outputCanvas = $("#vector-field-canvas");

	const applet = new VectorFields({ canvas: outputCanvas });

	applet.loadPromise.then(() =>
	{
		applet.run({
			generatingCode: "((x - 1.0) * (x + 1.0), (y + 1.0) * (y - 1.0))",
			dt: .002,
			worldWidth: 3
		});
		applet.pauseWhenOffscreen();
	});



	const outputCanvas2 = $("#autonomous-system-canvas");

	const applet2 = new VectorFields({ canvas: outputCanvas2 });

	applet2.loadPromise.then(() =>
	{
		applet2.run({
			generatingCode: "(y*y, 1.0 - x*x)",
			dt: .002,
			worldWidth: 4
		});
		applet2.pauseWhenOffscreen();
	});



	const outputCanvas3 = $("#pendulum-canvas");

	const applet3 = new VectorFields({ canvas: outputCanvas3 });

	applet3.loadPromise.then(() =>
	{
		applet3.run({
			generatingCode: "(y, -.5*y - sin(x))",
			dt: .002,
			worldWidth: 12
		});
		applet3.pauseWhenOffscreen();
	});



	showPage();
}