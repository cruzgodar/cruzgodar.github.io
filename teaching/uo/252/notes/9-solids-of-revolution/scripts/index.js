import { showPage } from "../../../../../../scripts/src/loadPage.js";
import {
	createDesmosGraphs,
	desmosBlack,
	desmosBlue,
	desmosGreen,
	desmosPurple,
	desmosRed,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			diskMethodXAxis:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = \sin(x) + 2`, hidden: true },
					{ latex: raw`g(x) = 0`, hidden: true },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 10` },
					{ latex: raw`n = .75`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`x_x = \cos(\alpha)`, secret: true },
					{ latex: raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`y_x = 0`, secret: true },
					{ latex: raw`y_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 10`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
				]
			},



			diskMethodXAxis2:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = \frac{3}{x}`, hidden: true },
					{ latex: raw`g(x) = 0`, hidden: true },
					{ latex: raw`a = 1` },
					{ latex: raw`b = 5` },
					{ latex: raw`n = 1`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`x_x = \cos(\alpha)`, secret: true },
					{ latex: raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`y_x = 0`, secret: true },
					{ latex: raw`y_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 10`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			diskMethodYAxis:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = x^{\frac{1}{3}}`, hidden: true },
					{ latex: raw`g(x) = 0`, hidden: true },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 2^{\frac{1}{3}}` },
					{ latex: raw`n = .75`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`y_x = \cos(\alpha)`, secret: true },
					{ latex: raw`y_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`x_x = 0`, secret: true },
					{ latex: raw`x_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 2.5`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			diskMethodXAxis3:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = \sqrt{x}`, hidden: true },
					{ latex: raw`g(x) = x`, hidden: true },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 1` },
					{ latex: raw`n = 1`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`x_x = \cos(\alpha)`, secret: true },
					{ latex: raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`y_x = 0`, secret: true },
					{ latex: raw`y_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 2.5`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			diskMethodYAxis2:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = x^{\frac{1}{3}}`, hidden: true },
					{ latex: raw`g(x) = 0`, hidden: true },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 2^{\frac{1}{3}}` },
					{ latex: raw`n = .75`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`y_x = \cos(\alpha)`, secret: true },
					{ latex: raw`y_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`x_x = 0`, secret: true },
					{ latex: raw`x_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 2.5`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			shellMethodYAxis:
			{
				bounds: { left: -3.5, right: 3.5, bottom: -3.5, top: 3.5 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = 2`, hidden: true },
					{ latex: raw`g(x) = x^3`, hidden: true },
					{ latex: raw`a = 0` },
					{ latex: raw`b = 2^{\frac{1}{3}}` },
					{ latex: raw`n = .75`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`x_x = \cos(\alpha)`, secret: true },
					{ latex: raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`y_x = 0`, secret: true },
					{ latex: raw`y_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 3.5`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = \cos(\frac{2\pi}{N} \floor(t)) x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) x_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			shellMethodYAxis2:
			{
				bounds: { left: -5, right: 5, bottom: -5, top: 5 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = \frac{1}{x}`, hidden: true },
					{ latex: raw`g(x) = 0`, hidden: true },
					{ latex: raw`a = 1` },
					{ latex: raw`b = 3` },
					{ latex: raw`n = .75`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`x_x = \cos(\alpha)`, secret: true },
					{ latex: raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`y_x = 0`, secret: true },
					{ latex: raw`y_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 5`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = \cos(\frac{2\pi}{N} \floor(t)) x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) x_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			diskMethodXAxis4:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = \ln(x)`, hidden: true },
					{ latex: raw`g(x) = 1`, hidden: true },
					{ latex: raw`a = e` },
					{ latex: raw`b = e^2` },
					{ latex: raw`n = 1`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`x_x = \cos(\alpha)`, secret: true },
					{ latex: raw`x_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`y_x = 0`, secret: true },
					{ latex: raw`y_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 10`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = \cos(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = \cos(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)y_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			shellMethodXAxis:
			{
				bounds: { left: -10, right: 10, bottom: -10, top: 10 },

				options:
				{
					showGrid: false,
					showXAxis: false,
					showYAxis: false,
					lockViewport: true
				},

				expressions:
				[
					{ latex: raw`f(x) = e^x`, hidden: true },
					{ latex: raw`g(x) = e^2`, hidden: true },
					{ latex: raw`a = 1` },
					{ latex: raw`b = 2` },
					{ latex: raw`n = .75`, sliderBounds: { min: 0, max: 1 } },
					{ latex: raw`x_0 = .5`, sliderBounds: { min: 0, max: 1 } },

					{ latex: raw`(-\alpha, \beta)`, secret: true, color: desmosBlack },
					{ latex: raw`\alpha = .6`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`\beta = -.38`, secret: true, sliderBounds: { min: -Math.PI / 3, max: Math.PI / 3 } },
					{ latex: raw`N = 300`, secret: true },
					{ latex: raw`n_{rot} = \ceil(n(N + 1))`, secret: true },

					{ latex: raw`y_x = \cos(\alpha)`, secret: true },
					{ latex: raw`y_y = \sin(\alpha)\sin(\beta)`, secret: true },
					{ latex: raw`x_x = 0`, secret: true },
					{ latex: raw`x_y = \cos(\beta)`, secret: true },
					{ latex: raw`z_x = -\sin(\alpha)`, secret: true },
					{ latex: raw`z_y = \cos(\alpha)\sin(\beta)`, secret: true },

					{ latex: raw`l = 10`, secret: true },
					{ latex: raw`(l x_x t, l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l y_x t, l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(l z_x t, l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 } },
					{ latex: raw`(-l x_x t, -l x_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l y_x t, -l y_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },
					{ latex: raw`(-l z_x t, -l z_y t)`, secret: true, color: desmosBlack, parametricDomain: { min: 0, max: 1 }, lineStyle: "DASHED" },

					{ latex: raw`(x_S(t), y_S(t))`, secret: true, color: desmosBlue, parametricDomain: { min: 0, max: 500 } },
					{ latex: raw`x_s(t) = \cos(\frac{2\pi}{N} \floor(t)) x_{reg}(\mod(t, 1)) \{ 1 \leq t \leq n_{rot} \}`, hidden: true, secret: true },
					{ latex: raw`y_s(t) = y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`z_s(t) = -\sin(\frac{2\pi}{N} \floor(t)) x_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`x_S(t) = x_x x_s(t) + y_x y_s(t) + z_x z_s(t)`, hidden: true, secret: true },
					{ latex: raw`y_S(t) = x_y x_s(t) + y_y y_s(t) + z_y z_s(t)`, hidden: true, secret: true },
					{ latex: raw`x_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: a, \frac{1}{4} \leq t < \frac{1}{2}: a + 4(t - \frac{1}{4})(b - a), \frac{1}{2} \leq t < \frac{3}{4}: b, \frac{3}{4} \leq t \leq 1: b - 4(t - \frac{3}{4})(b - a)\}`, hidden: true, secret: true },
					{ latex: raw`y_{reg}(t) = \{ 0 \leq t < \frac{1}{4}: g(a)(1 - 4t) + 4tf(a), \frac{1}{4} \leq t < \frac{1}{2}: f(a + 4(t - \frac{1}{4})(b - a)), \frac{1}{2} \leq t < \frac{3}{4}: f(b)(1 - 4(t - \frac{1}{2})) + 4(t - \frac{1}{2})g(b), \frac{3}{4} \leq t \leq 1: g(b - 4(t - \frac{3}{4})(b - a))\}`, hidden: true, secret: true },

					{ latex: raw`(x_S(t + n_{rot} - 1), y_S(t + n_{rot} - 1))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b1}(t) + y_x y_{b1}(t) + z_x z_{b1}(t), x_y x_{b1}(t) + y_y y_{b1}(t) + z_y z_{b1}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b2}(t) + y_x y_{b2}(t) + z_x z_{b2}(t), x_y x_{b2}(t) + y_y y_{b2}(t) + z_y z_{b2}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b3}(t) + y_x y_{b3}(t) + z_x z_{b3}(t), x_y x_{b3}(t) + y_y y_{b3}(t) + z_y z_{b3}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`(x_x x_{b4}(t) + y_x y_{b4}(t) + z_x z_{b4}(t), x_y x_{b4}(t) + y_y y_{b4}(t) + z_y z_{b4}(t))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosPurple },
					{ latex: raw`x_{b1}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(0) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b2}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{1}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b3}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{1}{2}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`x_{b4}(t) = \cos(\frac{2\pi}{N} t)x_{reg}(\frac{3}{4}) \{t \leq n_{rot} - 1\}`, hidden: true, secret: true },
					{ latex: raw`y_{b1}(t) = y_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`y_{b2}(t) = y_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`y_{b3}(t) = y_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`y_{b4}(t) = y_{reg}(\frac{3}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b1}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(0)`, hidden: true, secret: true },
					{ latex: raw`z_{b2}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{1}{4})`, hidden: true, secret: true },
					{ latex: raw`z_{b3}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{1}{2})`, hidden: true, secret: true },
					{ latex: raw`z_{b4}(t) = -\sin(\frac{2\pi}{N} t)x_{reg}(\frac{3}{4})`, hidden: true, secret: true },

					{ latex: raw`x_R(t) = x_x x_{reg}(\mod(t, 1)) + y_x y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`y_R(t) = x_y x_{reg}(\mod(t, 1)) + y_y y_{reg}(\mod(t, 1))`, hidden: true, secret: true },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: 0, max: 1 }, color: desmosPurple },



					{ latex: raw`(\mod(t, 1)x_S(\floor(t) + \frac{1}{4} + \frac{1}{4} x_0) + (1 - \mod(t, 1))x_S(\floor(t) + 1 - \frac{1}{4}x_0), \mod(t, 1)y_S(\floor(t) + \frac{1}{4} + \frac{1}{4}x_0) + (1 - \mod(t, 1))y_S(\floor(t) + 1 - \frac{1}{4}x_0))`, secret: true, parametricDomain: { min: 0, max: 500 }, color: desmosRed },
					{ latex: raw`(x_R(t), y_R(t))`, secret: true, parametricDomain: { min: .25, max: .5 }, color: desmosPurple }
				]
			},



			aDifferentAxis1:
			{
				bounds: { left: -1, right: 15, bottom: -1, top: 17 },

				expressions:
				[
					{ latex: raw`y = x^2\{0 \leq x \leq 4\}`, color: desmosPurple, secret: true },
					{ latex: raw`y = 0\{0 \leq x \leq 4\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = 4\{0 \leq y \leq 16\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = 6`, color: desmosGreen, secret: true },

					{ latex: raw`y_0 = 8`, sliderBounds: { min: 0, max: 16 } },
					{ latex: raw`y = y_0\{\sqrt{y} \leq x \leq 4\}`, color: desmosRed, secret: true },
				]
			},



			aDifferentAxis2:
			{
				bounds: { left: -1, right: 15, bottom: -1, top: 17 },

				expressions:
				[
					{ latex: raw`y = x^2\{0 \leq x \leq 4\}`, color: desmosPurple, secret: true },
					{ latex: raw`y = 0\{0 \leq x \leq 4\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = 4\{0 \leq y \leq 16\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = 6`, color: desmosGreen, secret: true },

					{ latex: raw`x_0 = 2`, sliderBounds: { min: 0, max: 4 } },
					{ latex: raw`x = x_0\{0 \leq y \leq x^2\}`, color: desmosRed, secret: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}