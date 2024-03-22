import { addHoverEventWithScale } from "./hoverEvents.js";
import { $, pageElement } from "./main.js";

export function setUpPageContents()
{
	const navButtonsElement = $(".nav-buttons");

	if (!navButtonsElement)
	{
		return;
	}

	prepareContents();

	navButtonsElement.firstElementChild.insertAdjacentHTML("beforebegin", /* html */`
		<div class="focus-on-child contents-container" style="margin-left: 0 !important" tabindex="1">
			<button class="text-button linked-text-button" type="button" tabindex="-1">Contents</button>
		</div>
	`);

	navButtonsElement.classList.add("contents-container");

	setTimeout(() =>
	{
		const contentButtonElement = navButtonsElement.firstElementChild.firstElementChild;

		addHoverEventWithScale(contentButtonElement, 1.075);

		contentButtonElement.addEventListener("click", showContents);
	});
}

function prepareContents()
{
	const contentsContainerElement = document.createElement("div");
	contentsContainerElement.id = "contents-container";
	pageElement.appendChild(contentsContainerElement);

	const contentsElement = document.createElement("div");
	contentsElement.id = "contents";
	contentsContainerElement.append(contentsElement);
}

function showContents()
{

}