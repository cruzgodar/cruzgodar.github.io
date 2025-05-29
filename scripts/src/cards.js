import { cardAnimationTime } from "./animation.js";
import { browserIsIos } from "./browser.js";
import { addHoverEvent } from "./hoverEvents.js";
import { loadImages } from "./images.js";
import { $$, pageElement, pageUrl } from "./main.js";
import { typesetMath } from "./math.js";
import { currentlyRedirecting, getDisplayUrl } from "./navigation.js";
import { metaThemeColorElement, setScroll, siteSettings } from "./settings.js";
import { animate, asyncFetch, sleep } from "./utils.js";
import anime from "/scripts/anime.js";

export let cardIsOpen = false;
export let cardIsZoom = false;
export let cardIsAnimating = false;

const easing = "cubicBezier(.25, 1, .25, 1)";

export const cardContainer = document.querySelector("#card-container");

export let currentCard;

const closeButton = document.querySelector("#card-close-button");

if (closeButton)
{
	addHoverEvent({ element: closeButton, addBounceOnTouch: () =>true });

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
	for (const element of $$("[data-card-id]"))
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
	}

	if (window.DEBUG)
	{
		cardContainer.addEventListener("scroll", () => setScroll());
	}
}



// This system lets pages do stuff with the DOM after it's changed
// due to loading external cards. It's only called once for each
// card, so it's safe to use it for things like initializing custom
// elements.

// eslint-disable-next-line no-unused-vars
let onLoadExternalCard = (card, id) => {};

export function setOnLoadExternalCard(callback)
{
	onLoadExternalCard = callback;
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

	currentCard = document.querySelector(`#${id}-card`);

	if (currentCard.classList.contains("external-card"))
	{
		const data = await asyncFetch(`${pageUrl}/cards/${id}/data.html`);
		const dataInnards = data
			.replaceAll(/^<div.*?>/g, "")
			.replaceAll(/<\/div>$/g, "");
		currentCard.innerHTML = dataInnards;
		
		await Promise.all([
			typesetMath(),
			loadImages()
		]);

		onLoadExternalCard(currentCard, id);

		await sleep(10);
	}

	cardContainer.style.display = "flex";
	cardContainer.style.opacity = 1;
	cardContainer.style.top = "100vh";
	cardContainer.style.transform = "";



	cardContainer.appendChild(currentCard);
	currentCard.insertBefore(closeButton, currentCard.firstElementChild);

	cardContainer.scroll(0, 0);

	const backgroundScale = siteSettings.reduceMotion ? 1 : .975;



	const rect = currentCard.getBoundingClientRect();

	if (rect.height > window.innerHeight - 32)
	{
		cardContainer.style.justifyContent = "flex-start";
	}

	else
	{
		cardContainer.style.justifyContent = "center";
	}



	const image = currentCard.querySelector("img.gallery-card-image");

	if (image)
	{
		const imageHeight = image.getBoundingClientRect().height;
		const margin = window.innerWidth <= 500 ? 8 : 16;

		image.style.width = `calc(100vh - ${rect.height - imageHeight + 2 * margin}px)`;

		if (!(image.complete && image.naturalHeight))
		{
			await new Promise(resolve =>
			{
				image.onload = () => setTimeout(resolve, 100);
			});
		}

		else
		{
			await sleep(100);
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
		cardContainer.style.opacity = 0;
		cardContainer.style.top = 0;
	}

	await Promise.all([
		anime({
			targets: cardContainer,
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
			...(siteSettings.increaseContrast && { opacity: 0 }),
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: backgroundScale,
			...(siteSettings.increaseContrast && { opacity: 0 }),
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
	cardContainer.scrollTo(0, 0);
	cardIsAnimating = false;

	if (window.DEBUG)
	{
		setScroll();
	}
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

	await sleep(0);

	const color = siteSettings.darkTheme ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";
	const themeColor = siteSettings.darkTheme ? "#181818" : "#ffffff";

	if (browserIsIos)
	{
		pageElement.style.transformOrigin = `50% calc(50vh + ${window.scrollY}px)`;
	}

	const containerOldScroll = cardContainer.scrollTop;
	const totalHeightToMove = containerOldScroll + window.innerHeight + 64;

	const hidePromise = siteSettings.reduceMotion
		? anime({
			targets: cardContainer,
			opacity: 0,
			duration: animationTime,
			easing,
		}).finished
		: animate((t) =>
		{
			const heightMoved = t * totalHeightToMove;
			const scroll = Math.max(containerOldScroll - heightMoved, 0);
			cardContainer.scrollTo(0, scroll);

			const remainingHeight = Math.max(heightMoved - containerOldScroll, 0);
			cardContainer.style.top = `${remainingHeight}px`;
		}, animationTime, easing);

	await Promise.all([
		anime({
			targets: [
				pageElement,
				document.querySelector("#header")
			],
			filter: "brightness(1)",
			scale: 1,
			...(siteSettings.increaseContrast && !currentlyRedirecting && { opacity: 1 }),
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: 1,
			...(siteSettings.increaseContrast && !currentlyRedirecting && { opacity: 1 }),
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

	cardContainer.style.display = "none";

	pageElement.appendChild(currentCard);

	cardContainer.appendChild(closeButton);

	document.documentElement.removeEventListener("click", handleClickEvent);

	cardIsAnimating = false;

	if (window.DEBUG)
	{
		setScroll();
	}
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

	cardContainer.style.transform = `scale(${scale})`;
	
	toElementRect = toElement.getBoundingClientRect();
	const translateX = fromElementRect.left - toElementRect.left
		- (computedScale - 1) / 2 * fromElementRect.width;
	const translateY = fromElementRect.top - toElementRect.top
		- (computedScale - 1) / 2 * fromElementRect.height;

	cardContainer.style.transform = "translateX(0) translateY(0) scale(1)";

	await sleep(0);

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



	cardContainer.style.display = "flex";
	cardContainer.style.opacity = 0.002;
	cardContainer.style.top = 0;
	cardContainer.style.transform = "";

	currentCard = document.querySelector(`#${id}-card`);

	if (!toElement)
	{
		toElement = currentCard;
	}

	cardContainer.appendChild(currentCard);
	currentCard.insertBefore(closeButton, currentCard.firstElementChild);

	cardContainer.scroll(0, 0);

	

	const rect = currentCard.getBoundingClientRect();

	if (rect.height > window.innerHeight - 32)
	{
		cardContainer.style.justifyContent = "flex-start";
	}

	else
	{
		cardContainer.style.justifyContent = "center";
	}



	const image = currentCard.querySelector("img.gallery-card-image");

	if (image)
	{
		const imageHeight = image.getBoundingClientRect().height;
		const margin = window.innerWidth <= 500 ? 8 : 16;

		image.style.width = `calc(100vh - ${rect.height - imageHeight + 2 * margin}px)`;

		if (!(image.complete && image.naturalHeight))
		{
			await new Promise(resolve =>
			{
				image.onload = () => setTimeout(resolve, 90);
			});
		}

		else
		{
			await sleep(90);
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

	cardContainer.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;

	cardContainer.style.opacity = .75;

	await Promise.all([
		anime({
			targets: cardContainer,
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
			...(siteSettings.increaseContrast && { opacity: 0 }),
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: backgroundScale,
			...(siteSettings.increaseContrast && { opacity: 0 }),
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
	cardContainer.scrollTo(0, 0);
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

	await sleep(0);

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
			...(siteSettings.increaseContrast && !currentlyRedirecting && { opacity: 1 }),
			duration: animationTime,
			easing,
		}).finished,

		anime({
			targets: document.querySelector("#header-container"),
			backgroundColor: color,
			scale: 1,
			...(siteSettings.increaseContrast && !currentlyRedirecting && { opacity: 1 }),
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
			targets: cardContainer,
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

	cardContainer.style.display = "none";

	pageElement.appendChild(currentCard);

	cardContainer.appendChild(closeButton);

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
			cardContainer.style.justifyContent = "flex-start";
		}

		else
		{
			cardContainer.style.justifyContent = "center";
		}
	}
}