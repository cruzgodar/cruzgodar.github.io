import { Button } from "/scripts/components/buttons.js";
import { setOnLoadExternalCard } from "/scripts/src/cards.js";
import { addHoverEventWithScale } from "/scripts/src/hoverEvents.js";
import { pageUrl } from "/scripts/src/main.js";
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
};

const filenamesTex = {
	"homework-1": "Homework 1.tex",
	"homework-2": "Homework 2.zip",
	"homework-3": "Homework 3.tex",
	"homework-4": "Homework 4.tex",
	"homework-5": "Homework 5.tex",
	"homework-6": "Homework 6.tex",
	"homework-7": "Homework 7.tex",
	"homework-8": "Homework 8.tex",
	"homework-9": "Homework 9.tex",
};

export default async function load()
{
	setOnLoadExternalCard((card, id) =>
	{
		const button = card.querySelector(".text-button");

		if (!button)
		{
			return;
		}

		addHoverEventWithScale({
			element: button,
			scale: 1.05,
			addBounceOnTouch: () => true,
		});

		new Button({
			element: button,
			name: "Download Tex Source",
			onClick: async () =>
			{
				downloadFile(`${pageUrl}/cards/${id}/${filenamesTex[id]}`);
			}
		});
	});
}