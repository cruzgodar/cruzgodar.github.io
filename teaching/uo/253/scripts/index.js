import { Button } from "/scripts/src/buttons.js";
import { convertCardToLatex } from "/scripts/src/latex.js";
import { showPage } from "/scripts/src/loadPage.js";
import { $ } from "/scripts/src/main.js";

export default function load()
{
	for (let i = 1; i <= 9; i++)
	{
		const element = $(`#download-homework-${i}-button`);
		
		if (!element)
		{
			break;
		}

		new Button({
			element,
			name: "Download Latex Source",
			onClick: () =>
			{
				convertCardToLatex(
					document.body.querySelector(`#homework-${i}-card`),
					`Homework ${i}`,
					"Math 253"
				);
			}
		});
	}

	showPage();
}