import { VectorField } from "/applets/vector-fields/scripts/class.mjs"

export function load()
{
	Page.Load.getDesmosData = () =>
	{
		const data =
		{
			"vector-field":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x_1, x_2) = [ -ax_2, x_1 - bx_2 ]`},
					
					{latex: String.raw`(a, b)`, color: DESMOS_RED},
					
					{latex: String.raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true},
					
					{latex: String.raw`z = -2.86`, secret: true},
					{latex: String.raw`k = .33`, secret: true},
					
					{latex: String.raw`a = 2`, secret: true},
					{latex: String.raw`b = 3`, secret: true},
					
					{latex: String.raw`c = \sqrt{b^2 - 4a}`, secret: true},
					{latex: String.raw`d = \sqrt{-(b^2 - 4a)}`, secret: true},
					{latex: String.raw`y - 2 = \frac{2}{b - c}(x - (b - c))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`y - 2 = \frac{2}{b + c}(x - (b + c))`, color: DESMOS_BLUE, secret: true},
					
					{latex: String.raw`I = [0, ..., 24]`, secret: true},
					{latex: String.raw`C = [-2, -1, 0, 1, 2]`, secret: true},
					{latex: String.raw`C_1 = C[\floor(I / 5) + 1]`, secret: true},
					{latex: String.raw`C_2 = C[\mod(I, 5) + 1]`, secret: true},
					{latex: String.raw`l_1 = \frac{1}{2}(-b - c) \{c \geq 0\}`, secret: true},
					{latex: String.raw`l_2 = \frac{1}{2}(-b + c) \{c \geq 0\}`, secret: true},
					{latex: String.raw`v_1 = [\frac{1}{2}(b - c), 1] \{c \geq 0\}`, secret: true},
					{latex: String.raw`v_2 = [\frac{1}{2}(b + c), 1] \{c \geq 0\}`, secret: true},
					
					
					{latex: String.raw`(C_1 e^{l_1 t}v_1[1] + C_2 e^{l_2 t}v_2[1], C_1 e^{l_1 t}v_1[2] + C_2 e^{l_2 t}v_2[2])`, color: DESMOS_BLUE, parametricDomain: {min: -10, max: 10}, secret: true},
					
					{latex: String.raw`(e^{l_1 t}v_1[1], e^{l_1 t}v_1[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(e^{l_2 t}v_2[1], e^{l_2 t}v_2[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{l_1 t}v_1[1], -e^{l_1 t}v_1[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{l_2 t}v_2[1], -e^{l_2 t}v_2[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`(C_1 e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)) + C_2 e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), C_1 e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt) + C_2e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: DESMOS_BLUE, parametricDomain: {min: -10, max: 10}, secret: true},
					
					{latex: String.raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}b\cos(\frac{1}{2} dt) - \frac{1}{2} d \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2}bt}\cos(\frac{1}{2}dt)`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{-\frac{1}{2}bt} (\frac{1}{2}d\cos(\frac{1}{2} dt) + \frac{1}{2}b \sin(\frac{1}{2}dt)), -e^{-\frac{1}{2} bt} \sin(\frac{1}{2}dt))`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true},
					{latex: String.raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					{latex: String.raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
				]
			},
			
			
			
			"vector-field-2":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x_1, x_2) = [ -ax_2, x_1 - bx_2 ]`, secret: true},
					
					{latex: String.raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true},
					
					{latex: String.raw`z = -2.86`, secret: true},
					{latex: String.raw`k = .33`, secret: true},
					
					{latex: String.raw`a = -3`, secret: true},
					{latex: String.raw`b = -2`, secret: true},
					
					{latex: String.raw`c = \sqrt{b^2 - 4a}`, secret: true},
					{latex: String.raw`d = \sqrt{-(b^2 - 4a)}`, secret: true},
					{latex: String.raw`y - 2 = \frac{2}{b - c}(x - (b - c))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`y - 2 = \frac{2}{b + c}(x - (b + c))`, color: DESMOS_BLUE, secret: true},
					
					{latex: String.raw`I = [0, ..., 24]`, secret: true},
					{latex: String.raw`C = [-2, -1, 0, 1, 2]`, secret: true},
					{latex: String.raw`C_1 = C[\floor(I / 5) + 1]`, secret: true},
					{latex: String.raw`C_2 = C[\mod(I, 5) + 1]`, secret: true},
					{latex: String.raw`l_1 = \frac{1}{2}(-b - c) \{c \geq 0\}`, secret: true},
					{latex: String.raw`l_2 = \frac{1}{2}(-b + c) \{c \geq 0\}`, secret: true},
					{latex: String.raw`v_1 = [\frac{1}{2}(b - c), 1] \{c \geq 0\}`, secret: true},
					{latex: String.raw`v_2 = [\frac{1}{2}(b + c), 1] \{c \geq 0\}`, secret: true},
					
					
					{latex: String.raw`(C_1 e^{l_1 t}v_1[1] + C_2 e^{l_2 t}v_2[1], C_1 e^{l_1 t}v_1[2] + C_2 e^{l_2 t}v_2[2])`, color: DESMOS_BLUE, parametricDomain: {min: -10, max: 10}, secret: true},
					
					{latex: String.raw`(e^{l_1 t}v_1[1], e^{l_1 t}v_1[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(e^{l_2 t}v_2[1], e^{l_2 t}v_2[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{l_1 t}v_1[1], -e^{l_1 t}v_1[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{l_2 t}v_2[1], -e^{l_2 t}v_2[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true},
					{latex: String.raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					{latex: String.raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
				]
			},
			
			
			
			"vector-field-3":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x_1, x_2) = [ -ax_2, x_1 - bx_2 ]`, secret: true},
					
					{latex: String.raw`F(x_1, x_2) = \frac{1}{2.5} f(x_1, x_2)`, secret: true},
					
					{latex: String.raw`z = -2.86`, secret: true},
					{latex: String.raw`k = .33`, secret: true},
					
					{latex: String.raw`a = 4`, secret: true},
					{latex: String.raw`b = 5`, secret: true},
					
					{latex: String.raw`c = \sqrt{b^2 - 4a}`, secret: true},
					{latex: String.raw`d = \sqrt{-(b^2 - 4a)}`, secret: true},
					{latex: String.raw`y - 2 = \frac{2}{b - c}(x - (b - c))`, color: DESMOS_BLUE, secret: true},
					{latex: String.raw`y - 2 = \frac{2}{b + c}(x - (b + c))`, color: DESMOS_BLUE, secret: true},
					
					{latex: String.raw`I = [0, ..., 24]`, secret: true},
					{latex: String.raw`C = [-2, -1, 0, 1, 2]`, secret: true},
					{latex: String.raw`C_1 = C[\floor(I / 5) + 1]`, secret: true},
					{latex: String.raw`C_2 = C[\mod(I, 5) + 1]`, secret: true},
					{latex: String.raw`l_1 = \frac{1}{2}(-b - c) \{c \geq 0\}`, secret: true},
					{latex: String.raw`l_2 = \frac{1}{2}(-b + c) \{c \geq 0\}`, secret: true},
					{latex: String.raw`v_1 = [\frac{1}{2}(b - c), 1] \{c \geq 0\}`, secret: true},
					{latex: String.raw`v_2 = [\frac{1}{2}(b + c), 1] \{c \geq 0\}`, secret: true},
					
					
					{latex: String.raw`(C_1 e^{l_1 t}v_1[1] + C_2 e^{l_2 t}v_2[1], C_1 e^{l_1 t}v_1[2] + C_2 e^{l_2 t}v_2[2])`, color: DESMOS_BLUE, parametricDomain: {min: -10, max: 10}, secret: true},
					
					{latex: String.raw`(e^{l_1 t}v_1[1], e^{l_1 t}v_1[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(e^{l_2 t}v_2[1], e^{l_2 t}v_2[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{l_1 t}v_1[1], -e^{l_1 t}v_1[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(-e^{l_2 t}v_2[1], -e^{l_2 t}v_2[2])`, color: DESMOS_BLACK, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true},
					{latex: String.raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					{latex: String.raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
				]
			},
			
			
			
			"autonomous-system":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				expressions:
				[
					{latex: String.raw`f(x_1, x_2) = [x_2^2, 1 - x_1^2]`},
					
					{latex: String.raw`F(x_1, x_2) = \frac{1}{10} f(x_1, x_2)`, secret: true},
					
					{latex: String.raw`z = -2.86`, secret: true},
					{latex: String.raw`k = .33`, secret: true},
					
					{latex: String.raw`y^3 + x^3 - 3x = c`, color: DESMOS_BLUE},
					{latex: String.raw`c = 0`, sliderBounds: {min: -100, max: 100}},
					
					{latex: String.raw`A(t) = \floor(t) - 10\floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`B(t) = \floor(\frac{t}{10})`, hidden: true, secret: true},
					{latex: String.raw`M(x, y) = \frac{1}{\sqrt{(F(x, y)[1])^2 + (F(x, y)[2])^2}}`, hidden: true, secret: true},
					{latex: String.raw`R_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) - F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`L_1(x, y) = M(x, y)(F(x, y)[1]\cos(z) + F(x, y)[2]\sin(z))`, hidden: true, secret: true},
					{latex: String.raw`R_2(x, y) = M(x, y)(F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					{latex: String.raw`L_2(x, y) = M(x, y)(-F(x, y)[1]\sin(z) + F(x, y)[2]\cos(z))`, hidden: true, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1(t - \floor(t))F(A(t) - 10, B(t))[1], B(t) + .1(t - \floor(t))F(A(t) - 10, B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1(t - \floor(t))F(A(t), B(t))[1], B(t) + .1(t - \floor(t))F(A(t), B(t))[2])`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))R_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))R_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))R_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))R_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) - 10 + .1F(A(t) - 10, B(t))[1] + k(t - \floor(t))L_1(A(t) - 10, B(t)), B(t) + .1F(A(t) - 10, B(t))[2] + k(t - \floor(t))L_2(A(t) - 10, B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
					{latex: String.raw`(A(t) + .1F(A(t), B(t))[1] + k(t - \floor(t))L_1(A(t), B(t)), B(t) + .1F(A(t), B(t))[2] + k(t - \floor(t))L_2(A(t), B(t)))`, color: DESMOS_PURPLE, lineOpacity: .25, parametricDomain: {min: -100, max: 100}, secret: true},
				]
			},
		};
		
		return data;
	};
	
	Page.Load.createDesmosGraphs();
	
	
	
	const outputCanvas = $("#vector-field-canvas");
	
	const applet = new VectorField(outputCanvas);
	
	applet.loadPromise.then(() =>
	{
		applet.run("((x - 1.0) * (x + 1.0), (y + 1.0) * (y - 1.0))", 500, 10000, .0035, 100, 0, 0, -.15);
		applet.pauseWhenOffscreen();
	});
	
	
	
	const outputCanvas2 = $("#autonomous-system-canvas");
	
	const applet2 = new VectorField(outputCanvas2);
	
	applet2.loadPromise.then(() =>
	{
		applet2.run("(y*y, 1.0 - x*x)", 500, 10000, .0035, 100, 0, 0, 0);
		applet2.pauseWhenOffscreen();
	});
	
	
	
	const outputCanvas3 = $("#pendulum-canvas");
	
	const applet3 = new VectorField(outputCanvas3);
	
	applet3.loadPromise.then(() =>
	{
		applet3.run("(y, -.5*y - sin(x))", 500, 10000, .0035, 100, 0, 0, 2);
		applet3.pauseWhenOffscreen();
	});
	
	
	
	Page.show();
}