import { showPage } from "/scripts/src/load-page.mjs"
import { createDesmosGraphs, setGetDesmosData } from "/scripts/src/desmos.mjs"

export function load()
{
	setGetDesmosData((purple, blue, red, green, black) =>
	{
		const data =
		{
			"line-arc-length":
			{
				bounds: {left: -2, right: 4, bottom: 0, top: 6},
				
				expressions:
				[
					{latex: String.raw`f(x) = 2x + 1 \left\{a \leq x \leq b\right\}`, color: purple},
					{latex: String.raw`a = 0`},
					{latex: String.raw`b = 2`},
					
					{latex: String.raw`x = b\{f(a) \leq y \leq f(b)\}`, color: black, lineStyle: "DASHED", secret: true},
					{latex: String.raw`y = f(a)\{a \leq x \leq b\}`, color: black, lineStyle: "DASHED", secret: true},
				]
			},
			
			
			
			"arc-length-approximation":
			{
				bounds: {left: -25, right: 25, bottom: -2, top: 2},
				
				expressions:
				[
					{latex: String.raw`f(x) = \{x=0: 1, \frac{\sin(x)}{x}\}`, color: purple},
					{latex: String.raw`a = -14`, sliderBounds: {min: -20, max: 20}},
					{latex: String.raw`b = 14`, sliderBounds: {min: -20, max: 20}},
					{latex: String.raw`n = 4`, sliderBounds: {min: 1, max: 20, step: 1}},
					
					{latex: String.raw`(a, f(a))`, color: blue, secret: true},
					{latex: String.raw`(b, f(b))`, color: blue, secret: true},
					{latex: String.raw`s = \frac{b - a}{n}`, secret: true},
					{latex: String.raw`A = [a, a + s, ..., b - s]`, secret: true},
					{latex: String.raw`B = [a + s, a + 2s, ..., b]`, secret: true},
					{latex: String.raw`M = \frac{f(B) - f(A)}{s}`, secret: true},
					{latex: String.raw`y = f(A) + M(x - A) \{A \leq x \leq B\}`, color: blue, secret: true},
				]
			},
			
			
			
			"surface-area":
			{
				bounds: {left: -10, right: 10, bottom: -10, top: 10},
				
				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},
				
				expressions:
				[
					{latex: String.raw`f(x) = \sin(x) + 2`, hidden: true},
					{latex: String.raw`g(x) = 0`, hidden: true},
					{latex: String.raw`a = 0`},
					{latex: String.raw`b = 10`},
					{latex: String.raw`n = 1`, sliderBounds: {min: 0, max: 1}},
					{latex: String.raw`x_0 = .5`, sliderBounds: {min: 0, max: 1}},
					
					{latex: String.raw`(-\alpha, \beta)`, secret: true, color: black},
					{latex: String.raw`\alpha = .6`, secret: true, sliderBounds: {min: -Math.PI / 3, max: Math.PI / 3}},
					{latex: String.raw`\beta = -.38`, secret: true, sliderBounds: {min: -Math.PI / 3, max: Math.PI / 3}},
					{latex: String.raw`N = 300`, secret: true},
					{latex: String.raw`n_{rot} = \ceil(n(N + 1))`, secret: true},
					
					{latex: String.raw`x_x = \cos(\alpha)`, secret: true},
					{latex: String.raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true},
					{latex: String.raw`y_x = 0`, secret: true},
					{latex: String.raw`y_y = \cos(\beta)`, secret: true},
					{latex: String.raw`z_x = -\sin(\alpha)`, secret: true},
					{latex: String.raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true},
					
					{latex: String.raw`l = 10`, secret: true},
					{latex: String.raw`(l x_x t, l x_y t)`, secret: true, color: black, parametricDomain: {min: 0, max: 1}},
					{latex: String.raw`(l y_x t, l y_y t)`, secret: true, color: black, parametricDomain: {min: 0, max: 1}},
					{latex: String.raw`(l z_x t, l z_y t)`, secret: true, color: black, parametricDomain: {min: 0, max: 1}},
					{latex: String.raw`(-l x_x t, -l x_y t)`, secret: true, color: black, parametricDomain: {min: 0, max: 1}, lineStyle: "DASHED"},
					{latex: String.raw`(-l y_x t, -l y_y t)`, secret: true, color: black, parametricDomain: {min: 0, max: 1}, lineStyle: "DASHED"},
					{latex: String.raw`(-l z_x t, -l z_y t)`, secret: true, color: black, parametricDomain: {min: 0, max: 1}, lineStyle: "DASHED"},
					
					{latex: String.raw`(x_S(t), y_S(t))`, secret: true, color: blue, parametricDomain: {min: 0, max: 500}},
					{latex: String.raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true},
					{latex: String.raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true},
					{latex: String.raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true},
					{latex: String.raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true},
					{latex: String.raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true},
					{latex: String.raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true},
					{latex: String.raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true},
					
					{latex: String.raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: {min: 0, max: 1}, color: purple},
					{latex: String.raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: {min: 0, max: 500}, color: purple},
					{latex: String.raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: {min: 0, max: 500}, color: purple},
					{latex: String.raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: {min: 0, max: 500}, color: purple},
					{latex: String.raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: {min: 0, max: 500}, color: purple},
					{latex: String.raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true},
					{latex: String.raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true},
					{latex: String.raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true},
					{latex: String.raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true},
					{latex: String.raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true},
					{latex: String.raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true},
					{latex: String.raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true},
					{latex: String.raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true},
					{latex: String.raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true},
					{latex: String.raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true},
					{latex: String.raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true},
					{latex: String.raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true},
					
					{latex: String.raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true},
					{latex: String.raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true},
					{latex: String.raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: {min: 0, max: 1}, color: purple},
					
					{latex: String.raw`m = .01`, secret: true, hidden: true},
					{latex: String.raw`s = \mod(t, 1)(m)`, secret: true, hidden: true},
					{latex: String.raw`((1 - m + s)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (m - s)x_S(\floor(t) + 1 - \frac{1}{4}x_0), (1 - m + s)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (m - s)y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: {min: 0, max: 500}, color: red},
					{latex: String.raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: {min: .25, max: .5}, color: purple}
				]
			},
		};
		
		return data;
	});
	
	createDesmosGraphs();
	
	showPage();
}