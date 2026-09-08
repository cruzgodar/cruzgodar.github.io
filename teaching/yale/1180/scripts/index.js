import { Button } from "/scripts/components/buttons.js";
import { setOnLoadExternalCard } from "/scripts/src/cards.js";
import {
	createDesmosGraphs, desmosColors,
	desmosDragModes,
	desmosPointStyles,
	getDesmosPoint,
	getDesmosSlider,
	recreateDesmosGraphs
} from "/scripts/src/desmos.js";
import { addHoverEventWithScale } from "/scripts/src/hoverEvents.js";
import { pageUrl, raw } from "/scripts/src/main.js";
import { downloadFile } from "/scripts/src/utils.js";

const filenamesPDF = {
	"homework-1": "Homework 1.pdf",
	"homework-2": "Homework 2.pdf",
	"homework-3": "Homework 3.pdf",
	"homework-4": "Homework 4.pdf",
	"homework-5": "Homework 5.pdf",
	"homework-6": "Homework 6.pdf",
	"homework-7": "Homework 7.pdf",
	"homework-8": "Homework 8.pdf",
	"homework-9": "Homework 9.pdf",
	"homework-10": "Homework 10.pdf",
};

const filenamesTex = {
	"homework-1": "Homework 1.tex",
	"homework-2": "Homework 2.tex",
	"homework-3": "Homework 3.tex",
	"homework-4": "Homework 4.tex",
	"homework-5": "Homework 5.tex",
	"homework-6": "Homework 6.tex",
	"homework-7": "Homework 7.tex",
	"homework-8": "Homework 8.tex",
	"homework-9": "Homework 9.tex",
	"homework-10": "Homework 10.tex",
};

export default async function load()
{
	createDesmosGraphs({
		limits:
		{
			bounds: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },

			expressions:
			[
				{ latex: raw`f(x) = \{ x \leq -2: \frac{x}{2}, -2 < x < 0: -1, 0 < x < 2: \frac{x^2}{2}, 2 < x: \sin(\pi x) + 2 \}`, color: desmosColors.purple, secret: true },

				...getDesmosPoint({
					point: [0, -1],
					style: desmosPointStyles.OPEN,
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE
				}),

				...getDesmosPoint({
					point: [2, 2],
					style: desmosPointStyles.OPEN,
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE
				}),

				...getDesmosPoint({
					point: [0, 0],
					color: desmosColors.purple,
					dragMode: desmosDragModes.NONE
				}),
			]
		},

		graphMatching:
		{
			use3d: true,

			options: { expressionsCollapsed: false },

			bounds: { xmin: -2.5, xmax: 2.5, ymin: -2.5, ymax: 2.5, zmin: -2.5, zmax: 2.5 },

			expressions:
			[
				{ latex: raw`f(x, y) = \frac{1}{5}(x^3 + y^3)`, secret: true, hidden: true },
				{ latex: raw`g(x, y) = \sin(x) + \cos(y)`, secret: true, hidden: true },
				{ latex: raw`h(x, y) = \sqrt{1 - x^2 - (\frac{y}{2})^2}`, secret: true, hidden: true },
				{ latex: raw`k(x, y) = xy`, secret: true, hidden: true },

				{ latex: raw`f(x, y)`, color: desmosColors.purple, hidden: true },
				{ latex: raw`g(x, y)`, color: desmosColors.blue, hidden: true },
				{ latex: raw`h(x, y)`, color: desmosColors.red, hidden: true },
				{ latex: raw`k(x, y)`, color: desmosColors.orange, hidden: true },
			]
		},

		unitVectorsSpherical:
		{
			use3d: true,

			options: {
				worldRotation3D: [0, -1, 0, 0, 0, 1, -1, 0, 0],
				expressionsCollapsed: false
			},

			bounds: { xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, zmin: -1.5, zmax: 1.5 },

			expressions:
			[
				...getDesmosSlider({
					expression: "\\theta_0 = 1",
					min: 0,
					max: "2\\pi",
					secret: false
				}),

				...getDesmosSlider({
					expression: "\\varphi_0 = 0",
					min: raw`\frac{-\pi}{2}`,
					max: raw`\frac{\pi}{2}`,
					secret: false
				}),

				{ latex: raw`\sin(\theta_0)x - \cos(\theta_0)y + 0z = 0 \{x^2 + y^2 + z^2 \leq 1\} \{\cos(\theta_0)x + \sin(\theta_0)y \geq 0\}`, color: desmosColors.blue, secret: true },


				{ latex: raw`(0.2\cos(t), 0.2\sin(t), 0)`, color: desmosColors.red, parametricDomain: { min: 0, max: "a" }, secret: true },

				{ latex: raw`\vector((0, 0, 0), (\cos(\varphi_0)\cos(\theta_0), \cos(\varphi_0)\sin(\theta_0), \sin(\varphi_0)))`, color: desmosColors.purple, secret: true },
			]
		},
	});



	setOnLoadExternalCard((card, id) =>
	{
		setTimeout(recreateDesmosGraphs, 600);

		const buttons = card.querySelectorAll(".text-button");

		if (buttons.length === 0)
		{
			return;
		}

		addHoverEventWithScale({
			element: buttons[0],
			scale: 1.05,
			addBounceOnTouch: () => true,
		});
		
		addHoverEventWithScale({
			element: buttons[1],
			scale: 1.05,
			addBounceOnTouch: () => true,
		});

		new Button({
			element: buttons[0],
			name: "Download PDF Version",
			onClick: async () =>
			{
				downloadFile(`${pageUrl}/cards/${id}/${filenamesPDF[id]}`);
			}
		});

		new Button({
			element: buttons[1],
			name: "Download Tex Source",
			onClick: async () =>
			{
				downloadFile(`${pageUrl}/cards/${id}/${filenamesTex[id]}`);
			}
		});
	});
}