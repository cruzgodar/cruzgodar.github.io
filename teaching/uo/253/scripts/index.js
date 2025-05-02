import { convertCardToLatex } from "../../../../build/bin/latex.js";
import { Button } from "/scripts/src/buttons.js";
import { setOnLoadExternalCard } from "/scripts/src/cards.js";
import { addHoverEventWithScale } from "/scripts/src/hoverEvents.js";
import { showPage } from "/scripts/src/loadPage.js";
import { asyncFetch, pageUrl } from "/scripts/src/main.js";

export default async function load()
{
	setOnLoadExternalCard((card, id) =>
	{
		const buttons = card.querySelectorAll(".text-button");

		addHoverEventWithScale({
			element: buttons[0],
			scale: 1.05,
			addBounceOnTouch: () => true,
		});

		new Button({
			element: buttons[0],
			name: "Download PDF Version",
			onClick: async () =>
			{
				const html = await asyncFetch(`${pageUrl}/cards/${id}/data.html`);
				convertCardToLatex(html, "Math 253");
			}
		});
	});

	showPage();
}