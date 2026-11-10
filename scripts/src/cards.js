import { cardAnimationTime } from "./animation.js";
import { browserIsIos } from "./browser.js";
import { addHoverEvent } from "./hoverEvents.js";
import { loadImages } from "./images.js";
import { updateTapClickElements } from "./interaction.js";
import { $$, pageElement, pageUrl } from "./main.js";
import { typesetMath } from "./math.js";
import { currentlyRedirecting, getDisplayUrl } from "./navigation.js";
import { metaThemeColorElement, setScroll, siteSettings } from "./settings.js";
import { animate, asyncFetch, sleep } from "./utils.js";
import anime from "/scripts/anime.js";

export let cardIsOpen = false;
export let cardIsZoom = false;
export let cardIsAnimating = false;

const openEasing = "cubicBezier(.25, 1, .3, 1)";
const closeEasing = "cubicBezier(.25, 1, .3, 1)";

export const cardContainer = document.querySelector("#card-container");

export let currentCard;

const closeButton = document.querySelector("#card-close-button");

if (closeButton)
{
	addHoverEvent({ element: closeButton, addBounceOnTouch: () => true });

	closeButton.addEventListener("click", () => closeCard());

}

// A debug-only button next to the close button that exports the open card as a
// pdf. The export wrecks the page on its way out, so it's a click-then-refresh
// affair. Imported on click so that nothing else has to pay for it.
const debugButton = cardContainer && window.DEBUG ? createDebugButton() : null;

function createDebugButton()
{
	const button = document.createElement("div");
	button.id = "card-debug-button";
	button.innerHTML = "<span>&#x2193;</span>";

	addHoverEvent({ element: button, addBounceOnTouch: () => true });

	button.addEventListener("click", async () =>
	{
		const { downloadCardPdf } = await import("./cardScreenshot.js");

		await downloadCardPdf({
			card: currentCard,
			name: currentCard.querySelector(".heading-text")?.textContent.trim()
				|| siteSettings.card
		});
	});

	cardContainer.appendChild(button);

	return button;
}

export let scrollBeforeCard = 0;



// iOS Safari only re-tints its status bar when an opaque fixed element is added or
// removed, and it briefly shows that element's color while it's there. This adds
// one for a couple of frames in the current html background color, which is what
// the status bar should become, and blends it so that it doesn't change the page.
// It sits under the card and stops halfway down, since one that reaches the bottom
// shows its color in the toolbar too.
function refreshBrowserBarTint()
{
	if (!browserIsIos)
	{
		return;
	}

	const element = document.createElement("div");
	element.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 50%;
		z-index: 1999;
		pointer-events: none;
		mix-blend-mode: ${siteSettings.darkTheme ? "lighten" : "darken"};
	`;
	element.style.backgroundColor = getComputedStyle(document.documentElement).backgroundColor;
	document.body.appendChild(element);

	requestAnimationFrame(() => requestAnimationFrame(() => element.remove()));
}



// The height of the screen in the current orientation. iOS keeps screen.width and
// screen.height in portrait, and outerHeight doesn't reliably include all of the
// window chrome on devices.
function getScreenHeight()
{
	const portrait = window.innerHeight >= window.innerWidth;

	return portrait
		? Math.max(window.screen.width, window.screen.height)
		: Math.min(window.screen.width, window.screen.height);
}

// On iOS, fixed elements are cut off where the bottom toolbar starts, so the card
// container is absolutely positioned over the current scroll position instead.
// It keeps the size the fixed version would have so that the card scrolls within
// the same bounds, and padding extends it under the toolbar without changing them.
let cardContainerTop = 0;

function positionCardContainer()
{
	cardContainerTop = 0;

	if (!browserIsIos)
	{
		return;
	}

	resetCardContainerPosition();
	cardContainer.style.top = "0";

	const rect = cardContainer.getBoundingClientRect();

	cardContainerTop = window.scrollY + rect.top;

	cardContainer.style.position = "absolute";
	cardContainer.style.marginTop = "0";
	cardContainer.style.height = `${rect.height}px`;
	cardContainer.style.paddingBottom = `${Math.max(getScreenHeight() - rect.bottom, 0)}px`;
	cardContainer.style.overscrollBehavior = "contain";

	// Stops things like tapping the status bar from scrolling the page out from under it.
	document.documentElement.style.overflow = "hidden";
}

// How far the container has to move down to be entirely off-screen. On iOS, it
// reaches under the toolbar, past the bottom of the viewport.
function getCardOffscreenDistance()
{
	return browserIsIos ? getScreenHeight() : window.innerHeight;
}

// The window chrome can grow or shrink while a card is open, which changes the size
// the fixed container would have. Resizes during the opening animation are handled
// once it's done.
let cardContainerNeedsUpdate = false;

function updateOpenCardContainer()
{
	if (!browserIsIos || !cardIsOpen)
	{
		cardContainerNeedsUpdate = false;
		return;
	}

	if (cardIsAnimating)
	{
		cardContainerNeedsUpdate = true;
		return;
	}

	cardContainerNeedsUpdate = false;

	const scroll = cardContainer.scrollTop;

	positionCardContainer();
	cardContainer.style.top = `${cardContainerTop}px`;
	cardContainer.scrollTop = scroll;
}

function resetCardContainerPosition()
{
	cardContainer.style.position = "";
	cardContainer.style.marginTop = "";
	cardContainer.style.height = "";
	cardContainer.style.paddingBottom = "";
	cardContainer.style.overscrollBehavior = "";
	document.documentElement.style.overflow = "";
}



export function initCards()
{
	for (const element of $$("[data-card-id]"))
	{
		element.addEventListener("click", (e) =>
		{
			if (!e.metaKey)
			{
				openCard({
					id: element.getAttribute("data-card-id"),
				});
			}
		});
	}

	cardContainer.addEventListener("scroll", () => setScroll());
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



export async function openCard({
	id,
	animationTime = cardAnimationTime
}) {
	if (cardIsOpen)
	{
		await closeCard();
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
			loadImages(),
			updateTapClickElements(),
		]);

		onLoadExternalCard(currentCard, id);

		await sleep(10);
	}

	cardContainer.style.display = "flex";
	cardContainer.style.opacity = 1;
	positionCardContainer();
	cardContainer.style.top = `${cardContainerTop + getCardOffscreenDistance()}px`;
	cardContainer.style.transform = "";



	cardContainer.appendChild(currentCard);
	currentCard.insertBefore(closeButton, currentCard.firstElementChild);

	if (debugButton)
	{
		currentCard.insertBefore(debugButton, currentCard.firstElementChild);
	}

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
	document.querySelector("#header-background").style.filter = "brightness(1)";
 
	pageElement.style.transformOrigin = browserIsIos ? `50% calc(50vh + ${window.scrollY}px)` : "50% 50vh";

	document.documentElement.addEventListener("pointerdown", handlePointerDownEvent);
	document.documentElement.addEventListener("pointerup", handlePointerUpEvent);

	const color = siteSettings.darkTheme ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
	const themeColor = siteSettings.darkTheme ? "#0c0c0c" : "#7f7f7f";

	// Unfortunately necessary to make the animation work. We reset it later!
	document.documentElement.style.backgroundColor = siteSettings.darkTheme
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
		cardContainer.style.top = `${cardContainerTop}px`;
	}

	await Promise.all([
		anime({
			targets: cardContainer,
			top: cardContainerTop,
			opacity: 1,
			duration: animationTime,
			easing: openEasing,
		}).finished,

		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
				document.querySelector("#header-background"),
			],
			filter: "brightness(.5)",
			scale: backgroundScale,
			...(siteSettings.increaseContrast && { opacity: 0 }),
			duration: animationTime,
			easing: openEasing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing: openEasing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing: openEasing,
		}).finished,
	]);

	currentCard.setAttribute("tabindex", "0");
	currentCard.focus();
	cardContainer.scrollTo(0, 0);
	refreshBrowserBarTint();
	cardIsAnimating = false;

	if (cardContainerNeedsUpdate)
	{
		updateOpenCardContainer();
	}

	setScroll();
}

export async function closeCard(animationTime = cardAnimationTime)
{
	if (cardIsZoom)
	{
		return closeZoomCard(animationTime);
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
	const totalHeightToMove = containerOldScroll + getCardOffscreenDistance() + 32;

	const hidePromise = siteSettings.reduceMotion
		? anime({
			targets: cardContainer,
			opacity: 0,
			duration: animationTime,
			easing: closeEasing,
		}).finished
		: animate((t) =>
		{
			const heightMoved = t * totalHeightToMove;
			const scroll = Math.max(containerOldScroll - heightMoved, 0);
			cardContainer.scrollTo(0, scroll);

			const remainingHeight = Math.max(heightMoved - containerOldScroll, 0);
			cardContainer.style.top = `${cardContainerTop + remainingHeight}px`;
		}, animationTime, closeEasing);

	await Promise.all([
		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
				document.querySelector("#header-background"),
			],
			filter: "brightness(1)",
			scale: 1,
			...(siteSettings.increaseContrast && !currentlyRedirecting && { opacity: 1 }),
			duration: animationTime,
			easing: closeEasing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing: closeEasing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing: closeEasing,
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

	cardContainer.style.display = "none";
	resetCardContainerPosition();

	pageElement.appendChild(currentCard);

	cardContainer.appendChild(closeButton);

	if (debugButton)
	{
		cardContainer.appendChild(debugButton);
	}

	document.documentElement.removeEventListener("pointerdown", handlePointerDownEvent);
	document.documentElement.removeEventListener("pointerup", handlePointerUpEvent);

	refreshBrowserBarTint();
	cardIsAnimating = false;

	setScroll();
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



export async function openZoomCard({
	id,
	fromElement,
	toElement,
	animationTime = cardAnimationTime * .85
}) {
	if (siteSettings.reduceMotion)
	{
		return openCard({
			id,
			animationTime
		});
	}

	if (cardIsOpen)
	{
		await closeCard();
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
	positionCardContainer();
	cardContainer.style.top = `${cardContainerTop}px`;
	cardContainer.style.transform = "";

	currentCard = document.querySelector(`#${id}-card`);

	if (!toElement)
	{
		toElement = currentCard;
	}

	cardContainer.appendChild(currentCard);
	currentCard.insertBefore(closeButton, currentCard.firstElementChild);

	if (debugButton)
	{
		currentCard.insertBefore(debugButton, currentCard.firstElementChild);
	}

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
	document.querySelector("#header-background").style.filter = "brightness(1)";
 
	pageElement.style.transformOrigin = browserIsIos ? `50% calc(50vh + ${window.scrollY}px)` : "50% 50vh";

	document.documentElement.addEventListener("pointerdown", handlePointerDownEvent);
	document.documentElement.addEventListener("pointerup", handlePointerUpEventZoom);

	const color = siteSettings.darkTheme ? "rgb(12, 12, 12)" : "rgb(127, 127, 127)";
	const themeColor = siteSettings.darkTheme ? "#0c0c0c" : "#7f7f7f";

	// Unfortunately necessary to make the animation work. We reset it later!
	document.documentElement.style.backgroundColor = siteSettings.darkTheme
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
			easing: openEasing,
		}).finished,

		anime({
			targets: [
				pageElement,
				document.querySelector("#header"),
				document.querySelector("#header-background"),
			],
			filter: "brightness(.5)",
			scale: backgroundScale,
			...(siteSettings.increaseContrast && { opacity: 0 }),
			duration: animationTime,
			easing: openEasing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing: openEasing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing: openEasing,
		}).finished,
	]);

	currentCard.setAttribute("tabindex", "0");
	currentCard.focus();
	cardContainer.scrollTo(0, 0);
	refreshBrowserBarTint();
	cardIsAnimating = false;

	if (cardContainerNeedsUpdate)
	{
		updateOpenCardContainer();
	}
}

export async function closeZoomCard(animationTime = cardAnimationTime * .75)
{
	if (siteSettings.reduceMotion)
	{
		return closeCard(animationTime);
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
				document.querySelector("#header"),
				document.querySelector("#header-background"),
			],
			filter: "brightness(1)",
			scale: 1,
			...(siteSettings.increaseContrast && !currentlyRedirecting && { opacity: 1 }),
			duration: animationTime,
			easing: closeEasing,
		}).finished,

		anime({
			targets: metaThemeColorElement,
			content: themeColor,
			duration: animationTime,
			easing: closeEasing,
		}).finished,

		anime({
			targets: document.documentElement,
			backgroundColor: color,
			duration: animationTime,
			easing: closeEasing,
		}).finished,

		anime({
			targets: cardContainer,
			opacity: 0,
			scale: siteSettings.reduceMotion ? 1 : .925,
			duration: animationTime,
			easing: closeEasing,
		}).finished,
	]);

	if (!browserIsIos)
	{
		pageElement.style.position = "relative";
		
		window.scrollTo(0, scrollBeforeCard);
		pageElement.style.transform = "";
	}

	document.documentElement.style.backgroundColor = "var(--background)";

	cardContainer.style.display = "none";
	resetCardContainerPosition();

	pageElement.appendChild(currentCard);

	cardContainer.appendChild(closeButton);

	if (debugButton)
	{
		cardContainer.appendChild(debugButton);
	}

	document.documentElement.removeEventListener("pointerdown", handlePointerDownEvent);
	document.documentElement.removeEventListener("pointerup", handlePointerUpEventZoom);

	refreshBrowserBarTint();
	cardIsAnimating = false;
}



let pointerDownOnCardContainer = false;

function handlePointerDownEvent(e)
{
	pointerDownOnCardContainer = e.target.id === "card-container";
}

function handlePointerUpEvent(e)
{
	if (pointerDownOnCardContainer && e.target.id === "card-container")
	{
		closeCard();
	}

	pointerDownOnCardContainer = false;
}

function handlePointerUpEventZoom(e)
{
	if (pointerDownOnCardContainer && e.target.id === "card-container")
	{
		closeZoomCard();
	}

	pointerDownOnCardContainer = false;
}



export function resizeCard()
{
	updateOpenCardContainer();

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