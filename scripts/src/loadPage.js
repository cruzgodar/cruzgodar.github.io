import { Button, initNavButtons, initTextButtons } from "../components/buttons.js";
import { initCarousels } from "../components/carousels.js";
import {
	fadeDownIn,
	fadeIn,
	fadeLeftIn,
	fadeRightIn,
	fadeUpIn,
	opacityAnimationTime
} from "./animation.js";
import {
	bannerElement,
	initBanner
} from "./banners.js";
import { initCards } from "./cards.js";
import { initFocusEvents, initHoverEvents, initImageLinks } from "./hoverEvents.js";
import { loadImages } from "./images.js";
import { listenForWilsonButtons, updateTapClickElements } from "./interaction.js";
import { equalizeAppletColumns, onResize } from "./layout.js";
import {
	$,
	$$,
	pageElement,
	pageUrl,
	updatePageElement
} from "./main.js";
import { typesetMath } from "./math.js";
import {
	navigationTransitionType,
	redirect,
	setCurrentlyRedirecting
} from "./navigation.js";
import { initPageContents } from "./pageContent.js";
import { siteSettings } from "./settings.js";
import { sitemap } from "./sitemap.js";
import { animate, asyncFetch, sleep } from "./utils.js";

export let pageShown = true;

// The big one. Gets a page ready to be shown but doesn't
// do anything that requires it to be visible.
export async function loadPage()
{
	pageShown = false;

	window.dispatchEvent(new Event("scroll"));

	updatePageElement();

	// Set the page title.
	const titleElement = document.head.querySelector("title");

	if (titleElement)
	{
		titleElement.textContent = sitemap[pageUrl].title;
	}



	initBanner();

	await loadCustomStyle();

	setLinks();

	disableLinks();

	initImageLinks();

	initSolutions();

	initHoverEvents();

	initTextButtons();

	initNavButtons();

	initPageContents();

	initCarousels();

	loadImages();

	typesetMath();

	initCards();

	onResize();
	requestAnimationFrame(onResize);
	setTimeout(onResize, 50);
	setTimeout(onResize, 100);
	setTimeout(onResize, 500);

	updateTapClickElements();

	listenForWilsonButtons();

	setTimeout(initFocusEvents, 50);
	setTimeout(equalizeAppletColumns, 50);
	setTimeout(equalizeAppletColumns, 100);

	window.scrollTo(0, 0);

	await loadCustomScripts();

	await fadeInPage();

	setCurrentlyRedirecting(false);
}



async function loadCustomStyle()
{
	if (!sitemap[pageUrl].customStyle)
	{
		return;
	}

	const element = document.createElement("style");

	element.textContent = await asyncFetch(
		`${pageUrl}/style/index.${window.DEBUG ? "css" : "min.css"}`);
	
	element.classList.add("temporary-style");
	
	// This is kind of subtle. If we append this new style to the end of the head,
	// then it will take precendence over settings styles, which is terrible --
	// for example, the homepage will render all of its custom classes like
	// quote-text and quote-attribution incorrectly. Therefore, we need to
	//* prepend* it, ensuring it has the lowest-possible priority.
	document.head.insertBefore(element, document.head.firstChild);
}



async function loadCustomScripts()
{
	if (!sitemap[pageUrl].customScript)
	{
		return;
	}
	
	const module = await import(`${pageUrl}/scripts/index.${window.DEBUG ? "js" : "min.js"}`);

	module.default();
}

async function fadeInPage()
{
	if (siteSettings.reduceMotion)
	{
		document.querySelector("#header").style.opacity = 1;
		document.querySelector("#header-container").style.opacity = 1;

		if (bannerElement)
		{
			bannerElement.style.opacity = 1;
		}

		pageElement.style.opacity = 1;

		return;
	}

	fadeIn({ element: document.querySelector("#header") });
	document.querySelector("#header-container").style.opacity = 1;

	setTimeout(() => pageShown = true, 10);

	if (!opacityAnimationTime)
	{
		pageElement.style.opacity = 1;

		if (bannerElement)
		{
			bannerElement.style.opacity = 1;
		}

		return;
	}

	await (() =>
	{
		if (navigationTransitionType === 1)
		{
			return bannerElement
				? Promise.all([
					fadeUpIn({
						element: bannerElement,
					}),
					fadeUpIn({ element: pageElement })
				])
				: fadeUpIn({ element: pageElement });
		}

		else if (navigationTransitionType === -1)
		{
			return bannerElement
				? Promise.all([
					fadeDownIn({
						element: bannerElement,
					}),
					fadeDownIn({ element: pageElement })
				])
				: fadeDownIn({ element: pageElement });
		}

		else if (navigationTransitionType === 2)
		{
			return bannerElement
				? Promise.all([
					fadeLeftIn({
						element: bannerElement,
					}),
					fadeLeftIn({ element: pageElement })
				])
				: fadeLeftIn({ element: pageElement });
		}

		else if (navigationTransitionType === -2)
		{
			return bannerElement
				? Promise.all([
					fadeRightIn({
						element: bannerElement,
					}),
					fadeRightIn({ element: pageElement })
				])
				: fadeRightIn({ element: pageElement });
		}

		else
		{
			return bannerElement
				? Promise.all([
					fadeIn({
						element: bannerElement,
					}),
					fadeIn({ element: pageElement })
				])
				: fadeIn({ element: pageElement });
		}
	})();
}



function setLinks()
{
	for (const link of $$("a:not([data-card-id])"))
	{
		link.addEventListener("click", (e) =>
		{
			const href = link.getAttribute("href");

			if (!href)
			{
				return;
			}

			const inNewTab = !(
				href.slice(0, 5) !== "https"
				&& href.slice(0, 4) !== "data"
				&& link.getAttribute("data-in-new-tab") != 1
			);
			
			redirect({ url: href, inNewTab: inNewTab || e.metaKey });
		});
	}

	for (const link of $$("a[data-card-id]"))
	{
		link.addEventListener("click", (e) =>
		{
			if (e.metaKey)
			{
				const href = link.getAttribute("href");

				if (!href)
				{
					return;
				}
				
				redirect({ url: href, inNewTab: true });
			}
		});
	}
}

export function disableLinks()
{
	for (const link of $$("a:not(.real-link)"))
	{
		link.addEventListener("click", e => e.preventDefault());
	}
}

function packageSolution(solutionElement, showButton = true)
{
	while (solutionElement.nextElementSibling)
	{
		solutionElement.appendChild(solutionElement.nextElementSibling);
	}

	solutionElement.style.position = "fixed";
	solutionElement.style.top = "0";
	solutionElement.style.left = "0";
	solutionElement.style.opacity = 0;
	solutionElement.style.zIndex = -100;

	if (!showButton)
	{
		return;
	}

	const textButtonsElement = document.createElement("div");
	textButtonsElement.classList.add("text-buttons");
	textButtonsElement.style.marginBottom = "16px";
	solutionElement.parentElement.appendChild(textButtonsElement);

	const childElement = document.createElement("div");
	childElement.classList.add("focus-on-child");
	childElement.tabIndex = 1;
	childElement.style.margin = "0px auto";
	textButtonsElement.appendChild(childElement);

	const buttonElement = document.createElement("button");
	buttonElement.classList.add("text-button");
	buttonElement.type = "button";
	buttonElement.tabIndex = -1;
	childElement.appendChild(buttonElement);

	

	new Button({
		element: buttonElement,
		name: "Show Solution",
		linked: false,
		onClick: async () =>
		{
			solutionElement.style.height = "auto";
			solutionElement.style.width =
				solutionElement.parentElement.getBoundingClientRect().width - 12 + "px";

			await sleep(10);

			const solutionElementHeight = solutionElement.getBoundingClientRect().height;
			const textButtonsElementHeight = textButtonsElement.getBoundingClientRect().height;
			const textButtonsElementMarginTop = parseFloat(
				window.getComputedStyle(textButtonsElement).marginTop
			);

			solutionElement.style.height = 0;
			solutionElement.style.position = "relative";

			await animate((t) =>
			{
				solutionElement.style.height = `${solutionElementHeight * t}px`;
				textButtonsElement.style.height = `${textButtonsElementHeight * (1 - t)}px`;
				textButtonsElement.style.marginTop = `${textButtonsElementMarginTop * (1 - t)}px`;
				textButtonsElement.style.opacity = 1 - t;
				solutionElement.style.opacity = t;
			}, 450, "easeOutQuint");

			solutionElement.style.height = "auto";
			solutionElement.style.width = "auto";
			textButtonsElement.remove();
		}
	});
}

function initSolutions()
{
	for (const e of $$(".notes-ex .solution"))
	{
		e.remove();
	}

	const element = $("#show-solutions");

	for (const e of $$(".notes-exc .solution"))
	{
		packageSolution(e, element !== null || window.DEBUG);
	}
}