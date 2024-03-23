import anime from "../anime.js";
import { cardAnimationTime } from "./animation.js";
import { addHoverEventWithScale } from "./hoverEvents.js";
import { $, $$, pageElement } from "./main.js";

const contentsSelector = ".notes-title:not(.notes-pf-title), .section-text, .heading-text";

let contentsContainerElement;
let contentsElement;
let contentsShown = false;

export function setUpPageContents()
{
	const navButtonsElement = $(".nav-buttons");

	if (!navButtonsElement)
	{
		return;
	}

	prepareContents();

	navButtonsElement.lastElementChild.insertAdjacentHTML("afterend", /* html */`
		<div class="focus-on-child contents-button-container" tabindex="1">
			<button class="text-button linked-text-button" type="button" tabindex="-1">Contents</button>
		</div>
	`);

	navButtonsElement.classList.add("contents-container");

	setTimeout(() =>
	{
		const contentButtonElement = navButtonsElement.lastElementChild.firstElementChild;

		addHoverEventWithScale(contentButtonElement, 1.075);

		contentButtonElement.addEventListener("click", showContents);
	});
}

function prepareContents()
{
	contentsContainerElement = document.createElement("div");
	contentsContainerElement.id = "contents-container";
	pageElement.appendChild(contentsContainerElement);

	contentsElement = document.createElement("div");
	contentsElement.id = "contents";
	contentsContainerElement.append(contentsElement);

	$$(contentsSelector).forEach(element =>
	{
		const clonedElement = element.cloneNode(true);

		if (clonedElement.classList.contains("heading-text"))
		{
			const index = clonedElement.textContent.indexOf(":");
			
			if (index !== -1)
			{
				clonedElement.textContent = clonedElement.textContent.slice(index + 2);
			}
		}

		contentsElement.appendChild(clonedElement);

		clonedElement.addEventListener("click", () =>
		{
			element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

			if (window.innerWidth < 1000)
			{
				hideContents();
			}
		});

		addHoverEventWithScale(clonedElement, 1.025);
	});

	contentsContainerElement.style.opacity = 0;
	contentsContainerElement.style.marginRight = "-32px";
	contentsContainerElement.style.display = "none";
}

async function showContents()
{
	if (contentsShown)
	{
		return;
	}

	contentsShown = true;

	contentsContainerElement.style.display = "flex";

	await anime({
		targets: contentsContainerElement,
		opacity: 1,
		marginRight: 0,
		duration: cardAnimationTime,
		easing: "easeOutQuint"
	}).finished;

	document.documentElement.addEventListener("click", handleClickEvent);
}

async function hideContents()
{
	if (!contentsShown)
	{
		return;
	}
	
	document.documentElement.removeEventListener("click", handleClickEvent);

	await anime({
		targets: contentsContainerElement,
		opacity: 0,
		marginRight: "-32px",
		duration: cardAnimationTime,
		easing: "easeOutQuint"
	}).finished;

	contentsContainerElement.style.display = "none";

	contentsShown = false;
}

function handleClickEvent(e)
{
	let element = e.target;
	while (element !== pageElement)
	{
		if (element === contentsElement)
		{
			return;
		}

		element = element.parentElement;
	}

	hideContents();
}