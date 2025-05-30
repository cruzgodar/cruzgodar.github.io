import {
    createDesmosGraphs,
    desmosBlack,
    desmosBlue,
    setGetDesmosData
} from "/scripts/src/desmos.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			geometricSeries:
			{
				options: { showGrid: false, showXAxis: false, showYAxis: false },

				bounds: { left: -.25, right: 1.25, bottom: -.25, top: 1.25 },

				expressions:
				[
					{ latex: raw`n=2`, sliderBounds: { min: 1, max: 20, step: 1 } },

					{ latex: raw`x = [0, 1] \{0 \leq y \leq 1\}`, color: desmosBlack, secret: true },
					{ latex: raw`y = [0, 1] \{0 \leq x \leq 1\}`, color: desmosBlack, secret: true },
					{ latex: raw`x_1(k) = 1 - 2^{-\floor(\frac{k}{2})}`, hidden: true, secret: true },
					{ latex: raw`x_2(k) = \{\mod(k, 2) = 0: 1, \mod(k, 2) = 1: 1 - 2^{-\frac{k + 1}{2}} \}`, hidden: true, secret: true },
					{ latex: raw`y_1(k) = 1 - 2^{-\floor(\frac{k - 1}{2})}`, hidden: true, secret: true },
					{ latex: raw`y_2(k) = \{\mod(k, 2) = 1: 1, \mod(k, 2) = 0: 1 - 2^{-\frac{k}{2}} \}`, hidden: true, secret: true },
					{ latex: raw`N = [1, ..., n]`, secret: true },
					{ latex: raw`x_1(N) \leq x \leq x_2(N) \{ y_1(N) \leq y \leq y_2(N) \}`, color: desmosBlue, secret: true },
					{ latex: raw`y = y_1(N) \{ x_1(N) \leq x \leq x_2(N) \}`, color: desmosBlue, secret: true },
					{ latex: raw`y = y_2(N) \{ x_1(N) \leq x \leq x_2(N) \}`, color: desmosBlue, secret: true }
				]
			}
		};

		return data;
	});

	createDesmosGraphs();
}