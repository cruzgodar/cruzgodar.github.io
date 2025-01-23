import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	desmosRed,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			polarCoordinates:
			{
				bounds: { left: -2, right: 2, bottom: -2, top: 2 },

				expressions:
				[
					{ latex: String.raw`r = 1`, color: desmosPurple },
					{ latex: String.raw`r = \sin(\theta)`, color: desmosBlue },
					{ latex: String.raw`r = \sin(4\theta)`, color: desmosRed },
				]
			},

			polarSlice:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: String.raw`x^2 + y^2 \leq (r_0 + \Delta_r)^2 \left\{ r_0^2 \leq x^2 + y^2 \right\} \left\{ \theta_0 \leq \mod(\arctan(y, x), 2\pi) \right\} \left\{ \mod(\arctan(y, x), 2\pi) \leq \theta_0 + \Delta_{theta} \right\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`r_0^2 = x^2 + y^2 \left\{ \theta_0 \leq \mod(\arctan(y, x), 2\pi) \right\} \left\{ \mod(\arctan(y, x), 2\pi) \leq \theta_0 + \Delta_{theta} \right\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`\mod(\arctan(y, x), 2\pi) = \theta_0 \left\{ x^2 + y^2 \leq (r_0 + \Delta_r)^2 \right\} \left\{ r_0^2 \leq x^2 + y^2 \right\}`, color: desmosPurple, secret: true },
					{ latex: String.raw`\mod(\arctan(y, x), 2\pi) = \theta_0 + \Delta_{theta} \left\{ x^2 + y^2 \leq (r_0 + \Delta_r)^2 \right\} \left\{ r_0^2 \leq x^2 + y^2 \right\}`, color: desmosPurple, secret: true },
					...getDesmosSlider({
						expression: "\\Delta_r = 0.25",
						min: 0.01,
						max: 0.5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: `\\Delta_{theta} = ${Math.PI / 4}`,
						min: 0.01,
						max: "2\\pi",
						secret: false,
					}),
					...getDesmosSlider({
						expression: "r_0 = 0.5",
						min: 0,
						max: 1.5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: `\\theta_0 = ${Math.PI / 8}`,
						min: 0.01,
						max: "2\\pi",
						secret: false,
					})
				]
			},
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}