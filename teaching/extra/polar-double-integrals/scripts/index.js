import {
	createDesmosGraphs,
	desmosBlue,
	desmosPurple,
	getDesmosSlider,
	setGetDesmosData
} from "/scripts/src/desmos.js";
import { showPage } from "/scripts/src/loadPage.js";
import { raw } from "/scripts/src/main.js";

export default function()
{
	setGetDesmosData(() =>
	{
		const data =
		{
			polarCoordinates:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: raw`r = 1`, color: desmosPurple },
					{ latex: raw`r = \sin(4\theta)`, color: desmosBlue },
				]
			},

			polarSlice:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 \leq (r_0 + \Delta_r)^2 \left\{ r_0^2 \leq x^2 + y^2 \right\} \left\{ \theta_0 \leq \mod(\arctan(y, x), 2\pi) \right\} \left\{ \mod(\arctan(y, x), 2\pi) \leq \theta_0 + \Delta_{theta} \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`r_0^2 = x^2 + y^2 \left\{ \theta_0 \leq \mod(\arctan(y, x), 2\pi) \right\} \left\{ \mod(\arctan(y, x), 2\pi) \leq \theta_0 + \Delta_{theta} \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`\mod(\arctan(y, x), 2\pi) = \theta_0 \left\{ x^2 + y^2 \leq (r_0 + \Delta_r)^2 \right\} \left\{ r_0^2 \leq x^2 + y^2 \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`\mod(\arctan(y, x), 2\pi) = \theta_0 + \Delta_{theta} \left\{ x^2 + y^2 \leq (r_0 + \Delta_r)^2 \right\} \left\{ r_0^2 \leq x^2 + y^2 \right\}`, color: desmosPurple, secret: true },
					...getDesmosSlider({
						expression: "\\Delta_r = 0.25",
						min: 0.01,
						max: 0.5,
						secret: false,
					}),
					...getDesmosSlider({
						expression: `\\Delta_{theta} = ${Math.round(Math.PI / 4 * 100) / 100}`,
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
						expression: `\\theta_0 = ${Math.round(Math.PI / 8 * 100) / 100}`,
						min: 0.01,
						max: "2\\pi",
						secret: false,
					})
				]
			},

			polarIntegrationRegion:
			{
				bounds: { left: -2.5, right: 2.5, bottom: -2.5, top: 2.5 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 \geq 1 \left\{ -\frac{\pi}{2} \leq \arctan(y, x) \leq \pi \right\} \left\{ x^2 + y^2 \leq 4 \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`x^2 + y^2 = 4 \left\{ -\frac{\pi}{2} \leq \arctan(y, x) \leq \pi \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`x = 0 \left\{ -2 \leq y \leq -1 \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`y = 0 \left\{ -2 \leq x \leq -1 \right\}`, color: desmosPurple, secret: true },
				]
			},

			polarIntegrationRegion2:
			{
				bounds: { left: -1.5, right: 1.5, bottom: -1.5, top: 1.5 },

				expressions:
				[
					{ latex: raw`x^2 + y^2 \leq 1 \left\{ 0 \leq \mod(\arctan(y, x), 2\pi) \leq \pi \right\} \left\{ x^2 + y^2 \geq \sin(\mod(\arctan(y, x), 2\pi))^2 \right\}`, color: desmosPurple, secret: true },
					{ latex: raw`r = \sin(\theta)`, color: desmosPurple, secret: true },
					{ latex: raw`y = 0 \left\{ -1 \leq x \leq 1 \right\}`, color: desmosPurple, secret: true },
				]
			}
		};

		return data;
	});

	createDesmosGraphs();

	showPage();
}