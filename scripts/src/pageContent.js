import anime from "../anime.js";
import { cardAnimationTime } from "./animation.js";
import { addHoverEventWithScale } from "./hoverEvents.js";
import { $, $$, pageElement } from "./main.js";

const contentsSelector = ".notes-title, .section-text, .heading-text";

let contentsContainerElement;
let contentsElement;
let indicatorElement;
let contentsShown = false;
let contentsAnimating = false;

export function setUpPageContents()
{
	const navButtonsElement = $(".nav-buttons");

	if (!navButtonsElement)
	{
		return;
	}

	prepareContents();

	navButtonsElement.insertAdjacentHTML("afterend", /* html */`
		<div class="text-buttons nav-buttons contents-button-container" style="grid-template-columns: repeat(auto-fit, 88px);">
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button" type="button" tabindex="-1">Contents</button>
			</div>
		</div>
	`);

	navButtonsElement.classList.add("contents-container");

	setTimeout(() =>
	{
		const contentButtonElement = navButtonsElement.nextElementSibling.firstElementChild;

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



	indicatorElement = document.createElement("img");
	indicatorElement.id = "contents-indicator";
	indicatorElement.src = "/graphics/general-icons/contents-indicator.png";
	pageElement.appendChild(indicatorElement);

	addHoverEventWithScale(indicatorElement, 1.1);
	indicatorElement.addEventListener("click", showContents);
}

async function showContents()
{
	if (contentsShown || contentsAnimating)
	{
		return;
	}

	contentsAnimating = true;
	contentsShown = true;

	contentsContainerElement.style.display = "flex";

	await Promise.all([
		anime({
			targets: contentsContainerElement,
			opacity: 1,
			marginRight: 0,
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished,

		anime({
			targets: indicatorElement,
			opacity: 0,
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished
	]);

	document.documentElement.addEventListener("click", handleClickEvent);
	contentsAnimating = false;
}

async function hideContents()
{
	if (!contentsShown || contentsAnimating)
	{
		return;
	}

	contentsAnimating = true;
	contentsShown = false;

	document.documentElement.removeEventListener("click", handleClickEvent);

	await Promise.all([
		anime({
			targets: contentsContainerElement,
			opacity: 0,
			marginRight: "-32px",
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished,

		anime({
			targets: indicatorElement,
			opacity: 1,
			duration: cardAnimationTime,
			easing: "easeOutQuint"
		}).finished
	]);

	contentsContainerElement.style.display = "none";
	contentsAnimating = false;
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