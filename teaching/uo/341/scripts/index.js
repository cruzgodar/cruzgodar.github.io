import { convertCardToLatex } from "../../../../build/bin/latex.js";
import { Button } from "/scripts/src/buttons.js";
import { showPage } from "/scripts/src/loadPage.js";

export default function load()
{
	for (let i = 1; i <= 9; i++)
	{
		new Button({
			element: document.body.querySelector(`#download-homework-${i}-button`),
			name: "Download Latex Source",
			onClick: () =>
			{
				convertCardToLatex(
					document.body.querySelector(`#homework-${i}-card`),
					`Homework ${i}`,
					"Math 341"
				);
			}
		});
	}

	showPage();
}