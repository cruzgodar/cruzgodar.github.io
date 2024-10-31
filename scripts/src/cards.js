import { cardAnimationTime } from "./animation.js";
import { browserIsIos } from "./browser.js";
import { addHoverEvent } from "./hoverEvents.js";
import { $$, pageElement, pageUrl } from "./main.js";
import { getDisplayUrl } from "./navigation.js";
import { metaThemeColorElement, siteSettings } from "./settings.js";
import anime from "/scripts/anime.js";

export let cardIsOpen = false;
export let cardIsZoom = false;
export let cardIsAnimating = false;

const easing = "cubicBezier(.25, 1, .25, 1)";

const container = document.querySelector("#card-container");

export let currentCard;

const closeButton = document.querySelector("#card-close-button");

if (closeButton)
{
	addHoverEvent({ element: closeButton });

	closeButton.addEventListener("click", () => hideCard());

	document.documentElement.addEventListener("keydown", (e) =>
	{
		if (e.key === "Escape" && cardIsOpen)
		{
			hideCard();
		}
	});
}



export let scrollBeforeCard = 0;



export function initCards()
{
	$$("[data-card-id]").forEach(element =>
	{
		element.addEventListener("click", (e) =>
		{
			if (!e.metaKey)
			{
				showCard({
					id: element.getAttribute("data-card-id"),
					fromElement: element
				});
			}
		});
	});
}

export async function showCard({
	id,
	animationTime = cardAnimationTime
}) {
	if (cardIsOpen)
	{
		await hideCard();
	}
	
	if (cardIsAnimating)
	{
		return;
	}

	cardIsAnimating = true;

	scrollBeforeCard = window.scrollY;

	cardIsOpen = true;
	cardIsZoom = false;
	
	siteSettings.card = id;
	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());
	
	container.style.display = "flex";
	container.style.opacity = 1;
	container.style.top = "100vh";
	container.style.transform = "";

	currentCard = document.querySelector(`#${id}-card`);

	container.appendChild(currentCard);
	currentCard.insertBefore(closeButton, currentCard.firstElementChild);

	container.scroll(0, 0);

	const backgroundScale = siteSettings.reduceMotion ? 1 : .975;



	const rect = currentCard.getBoundingClientRect();

	if (rect.height > window.innerHeight - 32)
	{
		container.style.justifyContent = "flex-start";
	}

	else
	{
		container.style.justifyContent = "center";
	}



	const image = currentCard.querySelector("img");

	if (image)
	{
		const imageHeight = image.getBoundingClientRect().height;
		const margin = window.innerWidth <= 500 ? 8 : 16;

		image.style.maxHeight = `calc(100vh - ${rect.height - imageHeight + 2 * margin}px)`;

		if (!(image.complete && image.naturalHeight))
		{
			await new Promise(resolve =>
			{
				image.onload = () => setTimeout(resolve, 100);
			});
		}

		else
		{
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}


	pageElement.style.filter = "brightness(1)";
	document.querySelector("#header").style.filter = "brightness(1)";
	document.querySelector("#header-container").style.filter = "brightness(1)";
 
	pageElement.style.transformOrigin = browserIsIos ? `50% calc(50vh + ${window.scrollY}px)` : "50% 50vh";

	document.documentElement.addEventListener("click", handleClickEvent);

	const color = siteSettings.darkTheme ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
	const themeColor = siteSettings.darkTheme ? "#0c0c0c" : "#7f7f7f";

	// Unfortunately necessary to make the animation work. We reset it later!
	document.documentElement.style.backgroundColor = siteSettings.darkTheme
		? "rgb(24, 24, 24)"
		: "rgb(255, 255, 255)";

	document.querySelector("#header-container").style.backgroundColor = siteSettings.darkTheme
		? "rgb(24, 24, 24)"
		: "rgb(255, 255, 255)";

	if (!browserIsIos)
	{
		window.scrollTo(0, 0);
		pageElement.style.transform = `scale(1) translateY(-${scrollBeforeCard}px)`;
		pageElement.style.position = "fixed";
	}

	if (siteSettings.reduceMotion)
	{
		container.style.opacity = 0;
		container.style.top = 0;
	}

	await Promise.all([
		anime({
			targets: container,
			top: 0,
			opacity: 1,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
			],
			filter: "brightness(.5)",
			scale: backgroundScale,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: backgroundScale,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing,
		}).finished,
	]);

	currentCard.setAttribute("tabindex", "0");
	currentCard.focus();
	container.scrollTo(0, 0);
	cardIsAnimating = false;
}

export async function hideCard(animationTime = cardAnimationTime)
{
	if (cardIsZoom)
	{
		return hideZoomCard(animationTime);
	}

	if (cardIsAnimating)
	{
		return;
	}

	cardIsAnimating = true;

	cardIsOpen = false;

	siteSettings.card = undefined;
	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());

	await new Promise(resolve => setTimeout(resolve, 0));

	const color = siteSettings.darkTheme ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
	const themeColor = siteSettings.darkTheme ? "#181818" : "#ffffff";

	if (browserIsIos)
	{
		pageElement.style.transformOrigin = `50% calc(50vh + ${window.scrollY}px)`;
	}

	const dummy = { t: 0 };
	const containerOldScroll = container.scrollTop;
	const totalHeightToMove = containerOldScroll + window.innerHeight + 64;

	const hidePromise = siteSettings.reduceMotion
		? anime({
			targets: container,
			opacity: 0,
			duration: animationTime,
			easing,
		}).finished
		: anime({
			targets: dummy,
			t: 1,
			duration: animationTime,
			easing,
			update: () =>
			{
				const heightMoved = dummy.t * totalHeightToMove;
				const scroll = Math.max(containerOldScroll - heightMoved, 0);
				container.scrollTo(0, scroll);

				const remainingHeight = Math.max(heightMoved - containerOldScroll, 0);
				container.style.top = `${remainingHeight}px`;
			}
		}).finished;

	await Promise.all([
		anime({
			targets: [
				pageElement,
				document.querySelector("#header")
			],
			filter: "brightness(1)",
			scale: 1,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: 1,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing,
		}).finished,

		hidePromise
	]);

	if (!browserIsIos)
	{
		pageElement.style.position = "relative";
		
		window.scrollTo(0, scrollBeforeCard);
		pageElement.style.transform = "";
	}

	document.documentElement.style.backgroundColor = "var(--background)";
	document.querySelector("#header-container").style.backgroundColor = "var(--background)";

	container.style.display = "none";

	pageElement.appendChild(currentCard);

	container.appendChild(closeButton);

	document.documentElement.removeEventListener("click", handleClickEvent);

	cardIsAnimating = false;
}



async function getClosedContainerStyle({
	fromElement,
	toElement
}) {
	const fromElementRect = fromElement.getBoundingClientRect();
	let toElementRect = toElement.getBoundingClientRect();

	const computedScale = getComputedStyle(fromElement).transform
		.split(",")[0].split("(")[1].split(")")[0];

	const scale = computedScale * fromElementRect.width / toElementRect.width;

	container.style.transform = `scale(${scale})`;
	
	toElementRect = toElement.getBoundingClientRect();
	const translateX = fromElementRect.left - toElementRect.left
		- (computedScale - 1) / 2 * fromElementRect.width;
	const translateY = fromElementRect.top - toElementRect.top
		- (computedScale - 1) / 2 * fromElementRect.height;

	container.style.transform = "translateX(0) translateY(0) scale(1)";

	await new Promise(resolve => setTimeout(resolve, 0));

	return [translateX, translateY, scale];
}



export async function showZoomCard({
	id,
	fromElement,
	toElement,
	animationTime = cardAnimationTime * .85
}) {
	if (siteSettings.reduceMotion)
	{
		return showCard({
			id,
			animationTime
		});
	}

	if (cardIsOpen)
	{
		await hideCard();
	}
	
	if (cardIsAnimating)
	{
		return;
	}

	cardIsAnimating = true;

	scrollBeforeCard = window.scrollY;

	cardIsOpen = true;
	cardIsZoom = true;
	
	siteSettings.card = id;
	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());

	const backgroundScale = .975;



	container.style.display = "flex";
	container.style.opacity = 0.0001;
	container.style.top = 0;
	container.style.transform = "";

	currentCard = document.querySelector(`#${id}-card`);

	if (!toElement)
	{
		toElement = currentCard;
	}

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



	const image = currentCard.querySelector("img");

	if (image)
	{
		const imageHeight = image.getBoundingClientRect().height;
		const margin = window.innerWidth <= 500 ? 8 : 16;

		image.style.maxHeight = `calc(100vh - ${rect.height - imageHeight + 2 * margin}px)`;

		if (!(image.complete && image.naturalHeight))
		{
			await new Promise(resolve =>
			{
				image.onload = () => setTimeout(resolve, 70);
			});
		}

		else
		{
			await new Promise(resolve => setTimeout(resolve, 70));
		}
	}



	pageElement.style.filter = "brightness(1)";
	document.querySelector("#header").style.filter = "brightness(1)";
	document.querySelector("#header-container").style.filter = "brightness(1)";
 
	pageElement.style.transformOrigin = browserIsIos ? `50% calc(50vh + ${window.scrollY}px)` : "50% 50vh";

	document.documentElement.addEventListener("click", handleClickEventZoom);

	const color = siteSettings.darkTheme ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
	const themeColor = siteSettings.darkTheme ? "#0c0c0c" : "#7f7f7f";

	// Unfortunately necessary to make the animation work. We reset it later!
	document.documentElement.style.backgroundColor = siteSettings.darkTheme
		? "rgb(24, 24, 24)"
		: "rgb(255, 255, 255)";

	document.querySelector("#header-container").style.backgroundColor = siteSettings.darkTheme
		? "rgb(24, 24, 24)"
		: "rgb(255, 255, 255)";

	if (!browserIsIos)
	{
		window.scrollTo(0, 0);
		pageElement.style.transform = `scale(1) translateY(-${scrollBeforeCard}px)`;
		pageElement.style.position = "fixed";
	}

	const [translateX, translateY, scale] = await getClosedContainerStyle({
		fromElement,
		toElement,
	});

	container.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;

	container.style.opacity = .75;

	await Promise.all([
		anime({
			targets: container,
			opacity: 1,
			scale: 1,
			translateX: 0,
			translateY: 0,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
			],
			filter: "brightness(.5)",
			scale: backgroundScale,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: backgroundScale,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing,
		}).finished,
	]);

	currentCard.setAttribute("tabindex", "0");
	currentCard.focus();
	container.scrollTo(0, 0);
	cardIsAnimating = false;
}

export async function hideZoomCard(animationTime = cardAnimationTime * .75)
{
	if (siteSettings.reduceMotion)
	{
		return hideCard(animationTime);
	}

	if (cardIsAnimating)
	{
		return;
	}

	cardIsAnimating = true;

	cardIsOpen = false;

	siteSettings.card = undefined;
	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());

	await new Promise(resolve => setTimeout(resolve, 0));

	const color = siteSettings.darkTheme ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
	const themeColor = siteSettings.darkTheme ? "#181818" : "#ffffff";

	if (browserIsIos)
	{
		pageElement.style.transformOrigin = `50% calc(50vh + ${window.scrollY}px)`;
	}

	await Promise.all([
		anime({
			targets: [
				pageElement,
				document.querySelector("#header")
			],
			filter: "brightness(1)",
			scale: 1,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: 1,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: container,
			opacity: 0,
			scale: siteSettings.reduceMotion ? 1 : .925,
			duration: animationTime,
			easing,
		}).finished,
	]);

	if (!browserIsIos)
	{
		pageElement.style.position = "relative";
		
		window.scrollTo(0, scrollBeforeCard);
		pageElement.style.transform = "";
	}

	document.documentElement.style.backgroundColor = "var(--background)";
	document.querySelector("#header-container").style.backgroundColor = "var(--background)";

	container.style.display = "none";

	pageElement.appendChild(currentCard);

	container.appendChild(closeButton);

	document.documentElement.removeEventListener("click", handleClickEventZoom);

	cardIsAnimating = false;
}



function handleClickEvent(e)
{
	if (e.target.id === "card-container")
	{
		hideCard();
	}
}

function handleClickEventZoom(e)
{
	if (e.target.id === "card-container")
	{
		hideZoomCard();
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