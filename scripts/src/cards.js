import { cardAnimationTime } from "./animation.js";
import { addHoverEvent } from "./hoverEvents.js";
import { $$, pageElement } from "./main.js";
import { metaThemeColorElement, siteSettings } from "./settings.js";
import anime from "/scripts/anime.js";

export let cardIsOpen = false;
export let cardIsAnimating = false;

const container = document.querySelector("#card-container");

let currentCard;

const closeButton = document.querySelector("#card-close-button");

if (closeButton)
{
	addHoverEvent(closeButton);

	closeButton.addEventListener("click", hideCard);

	document.documentElement.addEventListener("keydown", (e) =>
	{
		if (e.key === "Escape" && cardIsOpen)
		{
			hideCard();
		}
	});
}



export let scrollBeforeCard = 0;



export function setUpCards()
{
	$$("[data-card-id]").forEach(element =>
	{
		element.addEventListener("click", () => showCard(element.getAttribute("data-card-id")));
	});
}

export async function showCard(id)
{
	if (cardIsAnimating)
	{
		return;
	}

	cardIsAnimating = true;

	scrollBeforeCard = window.scrollY;

	cardIsOpen = true;
	
	container.style.display = "flex";
	container.style.opacity = 0;
	container.style.transform = "scale(1)";

	// Makes the animation look a little nicer (since it doesn't cut off the bottom of long cards).
	container.style.display = "flex";

	currentCard = document.querySelector(`#${id}-card`);

	container.appendChild(currentCard);
	currentCard.insertBefore(closeButton, currentCard.firstElementChild);

	container.scroll(0, 0);



	const rect = currentCard.getBoundingClientRect();

	if (rect.height > window.innerHeight - 32)
	{
		container.style.justifyContent = "flex-start";
	}

	else
	{
		container.style.justifyContent = "center";
	}



	container.style.transform = "scale(.95)";

	pageElement.style.filter = "brightness(1)";
	document.querySelector("#header").style.filter = "brightness(1)";
	document.querySelector("#header-container").style.filter = "brightness(1)";
 
	pageElement.style.transformOrigin = "50% calc(50vh)";

	document.documentElement.addEventListener("click", handleClickEvent);

	const color = siteSettings.darkTheme ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
	const themeColor = siteSettings.darkTheme ? "#0c0c0c" : "#7f7f7f";

	// Unfortunately necessary to make the animation work. We reset it later!
	document.documentElement.style.backgroundColor = siteSettings.darkTheme
		? "rgb(24, 24, 24)"
		: "rgb(255, 255, 255)";
	
	window.scrollTo(0, 0);
	pageElement.style.transform = `scale(1) translateY(-${scrollBeforeCard}px)`;
	pageElement.style.position = "fixed";

	await Promise.all([
		anime({
			targets: container,
			opacity: 1,
			scale: 1,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,

		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
				document.querySelector("#header-container")
			],
			filter: "brightness(.5)",
			scale: .975,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,
	]);

	cardIsAnimating = false;
}

export async function hideCard()
{
	if (cardIsAnimating)
	{
		return;
	}

	cardIsAnimating = true;

	cardIsOpen = false;

	await new Promise(resolve => setTimeout(resolve, 0));

	const color = siteSettings.darkTheme ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
	const themeColor = siteSettings.darkTheme ? "#181818" : "#ffffff";

	await Promise.all([
		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
				document.querySelector("#header-container")
			],
			filter: "brightness(1)",
			scale: 1,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished,

		anime({
			targets: container,
			opacity: 0,
			scale: .95,
			duration: cardAnimationTime,
			easing: "easeOutQuint",
		}).finished
	]);



	pageElement.style.position = "relative";
	
	window.scrollTo(0, scrollBeforeCard);
	pageElement.style.transform = "";

	document.documentElement.style.backgroundColor = "var(--background)";

	container.style.display = "none";

	pageElement.appendChild(currentCard);

	container.appendChild(closeButton);

	document.documentElement.removeEventListener("click", handleClickEvent);

	cardIsAnimating = false;
}

function handleClickEvent(e)
{
	if (e.target.id === "card-container")
	{
		hideCard();
	}
}

export function resizeCard()
{
	if (cardIsOpen)
	{
		const rect = currentCard.getBoundingClientRect();

		if (rect.height > window.innerHeight - 32)
		{
			container.style.justifyContent = "flex-start";
		}

		else
		{
			container.style.justifyContent = "center";
		}
	}
}