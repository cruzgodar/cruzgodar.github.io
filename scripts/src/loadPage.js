import anime from "../anime.js";
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
import { Button, initNavButtons, initTextButtons } from "./buttons.js";
import { initCards } from "./cards.js";
import { initCarousels } from "./carousels.js";
import { initFocusEvents, initHoverEvents } from "./hoverEvents.js";
import { loadImages } from "./images.js";
import { listenForFullscreenKey } from "./interaction.js";
import { equalizeAppletColumns, onResize } from "./layout.js";
import {
	$,
	$$,
	asyncFetch,
	pageElement,
	pageUrl,
	sleep,
	updatePageElement
} from "./main.js";
import { typesetMath } from "./math.js";
import {
	navigationTransitionType,
	redirect,
	setCurrentlyRedirecting
} from "./navigation.js";
import { initPageContents } from "./pageContent.js";
import { sitemap } from "./sitemap.js";

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

	loadCustomScripts();

	setLinks();

	disableLinks();

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

	listenForFullscreenKey();

	setTimeout(initFocusEvents, 50);
	setTimeout(equalizeAppletColumns, 50);
	setTimeout(equalizeAppletColumns, 100);

	window.scrollTo(0, 0);
}



export async function showPage()
{
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



function loadCustomScripts()
{
	if (!sitemap[pageUrl].customScript)
	{
		requestAnimationFrame(showPage);

		return;
	}
	
	import(`${pageUrl}/scripts/index.${window.DEBUG ? "js" : "min.js"}`)
		.then(Module => Module.default());
}

async function fadeInPage()
{
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
	$$("a:not([data-card-id])").forEach(link =>
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
	});

	$$("a[data-card-id]").forEach(link =>
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
	});
}

export function disableLinks()
{
	$$("a:not(.real-link)").forEach(link =>
	{
		link.addEventListener("click", e => e.preventDefault());
	});
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

			const dummy = { t: 0 };

			await anime({
				targets: dummy,
				t: 1,
				duration: 450,
				easing: "easeOutQuint",
				update: () =>
				{
					solutionElement.style.height = `${solutionElementHeight * dummy.t}px`;
					textButtonsElement.style.height = `${textButtonsElementHeight * (1 - dummy.t)}px`;
					textButtonsElement.style.marginTop = `${textButtonsElementMarginTop * (1 - dummy.t)}px`;

					textButtonsElement.style.opacity = 1 - dummy.t;
					solutionElement.style.opacity = dummy.t;
				}
			}).finished;

			solutionElement.style.height = "auto";
			solutionElement.style.width = "auto";
			textButtonsElement.remove();
		}
	});
}

function initSolutions()
{
	$$(".notes-ex .solution").forEach(e => e.remove());

	const element = $("#show-solutions");

	$$(".notes-exc .solution").forEach(e =>
	{
		packageSolution(e, element !== undefined || window.DEBUG);
	});
}