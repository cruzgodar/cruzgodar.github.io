import {
	createDesmosGraphs,
	desmosBlue,
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
			geometricIntegral:
			{
				bounds: { xmin: -2, xmax: 4, ymin: -2, ymax: 4 },

				expressions:
				[
					{ latex: raw`f(x) = \left|x\right|`, color: desmosPurple },
					{ latex: raw`a = -1` },
					{ latex: raw`b = 3` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true }
				]
			},



			geometricIntegral2:
			{
				bounds: { xmin: -1, xmax: 4, ymin: -2, ymax: 8 },

				expressions:
				[
					{ latex: raw`f(x) = 2x`, color: desmosPurple },
					{ latex: raw`a = 1` },
					{ latex: raw`b = 3` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
					{ latex: raw`y = 2 \{1 \leq x \leq 3\}`, color: desmosPurple, secret: true }
				]
			},



			integralFromLimitDef:
			{
				bounds: { xmin: -.25, xmax: 2.25, ymin: -.25, ymax: 4.25 },

				expressions:
				[
					{ latex: raw`f(x) = x^2`, color: desmosPurple },
					{ latex: raw`a = 0`, hidden: true },
					{ latex: raw`b = 2`, hidden: true },
					{ latex: raw`n = 6`, sliderBounds: { min: 1, max: 200, step: 1 } },

					{ latex: raw`s = \frac{b - a}{n}`, secret: true },
					{ latex: raw`X = [a, a + s, ..., b]`, secret: true },
					{ latex: raw`L = [a, a + s, ..., b - s]`, secret: true },
					{ latex: raw`R = [a + s, a + 2s, ..., b]`, secret: true },
					{ latex: raw`0 \leq y \leq f(R) \{ L \leq x \leq R \}`, color: desmosRed, secret: true },
					{ latex: raw`x = L \{ 0 \leq y \leq f(R) \}`, color: desmosRed, secret: true },
					{ latex: raw`x = R \{ 0 \leq y \leq f(R) \}`, color: desmosRed, secret: true }
				]
			},



			geometricIntegral3:
			{
				bounds: { xmin: -1, xmax: 7, ymin: -2.5, ymax: 5.5 },

				expressions:
				[
					{ latex: raw`f(x) = \sqrt{9 - (x - 3)^2}`, color: desmosPurple },
					{ latex: raw`a = 3` },
					{ latex: raw`b = 6` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosPurple, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosPurple, secret: true },
				]
			},



			signedArea:
			{
				bounds: { xmin: -3, xmax: 3, ymin: -10, ymax: 10 },

				expressions:
				[
					{ latex: raw`f(x) = x^3`, color: desmosPurple },
					{ latex: raw`a = -2` },
					{ latex: raw`b = 2` },

					{ latex: raw`x = [a, b] \{0 \leq y \leq f(x)\} `, color: desmosRed, secret: true },
					{ latex: raw`x = [a, b] \{f(x) \leq y \leq 0\} `, color: desmosBlue, secret: true },
					{ latex: raw`0 \leq y \leq f(x) \{a \leq x \leq b\}`, color: desmosRed, secret: true },
					{ latex: raw`f(x) \leq y \leq 0 \{a \leq x \leq b\}`, color: desmosBlue, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}