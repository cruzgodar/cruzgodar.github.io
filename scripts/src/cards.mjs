import { addHoverEvent } from "./hover-events.mjs"

const container = document.querySelector("#card-container");

const closeButton = document.querySelector("#card-close-button");
addHoverEvent(closeButton);

let currentCard = null;



closeButton.addEventListener("click", hideCard);

document.documentElement.addEventListener("keydown", (e) =>
{
	if (e.keyCode === 27 && cardIsOpen)
	{
		hideCard();
	}
});

	

export let cardIsOpen = false;

const animationTime = 500;

export function setUpCards()
{
	$$("[data-card-id]").forEach(element =>
	{
		element.addEventListener("click", () => showCard(element.getAttribute("data-card-id")))
	});
}

export async function showCard(id)
{
	cardIsOpen = true;
	
	container.style.display = "flex";
	container.style.opacity = 0;
	container.style.transform = "scale(1)";
	
	//Makes the animation look a little nicer (since it doesn't cut off the bottom of long cards).
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
	
	Page.element.style.filter = "brightness(1)";
	document.querySelector("#header").style.filter = "brightness(1)";
	document.querySelector("#header-container").style.filter = "brightness(1)";
	
	Page.element.style.transformOrigin = `50% calc(50vh + ${window.scrollY}px)`;
	
	document.documentElement.addEventListener("click", handleClickEvent);
	
	const color = Site.Settings.urlVars["theme"] === 1 ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
	const themeColor = Site.Settings.urlVars["theme"] === 1 ? "#0c0c0c" : "#7f7f7f";
	
	await Promise.all([
		new Promise((resolve, reject) =>
		{
			anime({
				targets: container,
				opacity: 1,
				scale: 1,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		}),
		
		new Promise((resolve, reject) =>
		{
			anime({
				targets: Page.element,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			})
		}),
		
		new Promise((resolve, reject) =>
		{
			anime({
				targets: [Page.element, document.querySelector("#header"), document.querySelector("#header-container")],
				filter: "brightness(.5)",
				scale: .975,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		}),
		
		new Promise((resolve, reject) =>
		{
			anime({
				targets: Site.Settings.metaThemeColorElement,
				content: themeColor,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		}),

		new Promise((resolve, reject) =>
		{
			anime({
				targets: document.documentElement,
				backgroundColor: color,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		})
	]);
}

export async function hideCard()
{
	cardIsOpen = false;

	const color = Site.Settings.urlVars["theme"] === 1 ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
	const themeColor = Site.Settings.urlVars["theme"] === 1 ? "#181818" : "#ffffff";
	
	await Promise.all([
		new Promise((resolve, reject) =>
		{
			anime({
				targets: [Page.element, document.querySelector("#header"), document.querySelector("#header-container")],
				filter: "brightness(1)",
				scale: 1,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		}),
		
		new Promise((resolve, reject) =>
		{
			anime({
				targets: Site.Settings.metaThemeColorElement,
				content: themeColor,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		}),
		
		new Promise((resolve, reject) =>
		{
			anime({
				targets: document.documentElement,
				backgroundColor: color,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		}),

		new Promise((resolve, reject) =>
		{
			anime({
				targets: container,
				opacity: 0,
				scale: .95,
				duration: animationTime,
				easing: "easeOutQuint",
				complete: resolve
			});
		})
	]);
	
	container.style.display = "none";
	
	Page.element.appendChild(currentCard);
	
	container.appendChild(closeButton);
	
	document.documentElement.removeEventListener("click", handleClickEvent);
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