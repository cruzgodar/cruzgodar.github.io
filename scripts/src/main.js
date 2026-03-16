import { cardContainer, openCard } from "./cards.js";
import { addHeader } from "./header.js";
import { initInteractionListeners } from "./interaction.js";
import { initOnResize } from "./layout.js";
import { redirect } from "./navigation.js";
import {
	initDarkTheme,
	initIncreaseContrast,
	initReduceMotion,
	setScroll,
	siteSettings
} from "./settings.js";
import { sleep } from "./utils.js";

const blockCardPages = [
	"/gallery"
];

export let pageElement = document.createElement("div");

export let $ = (queryString) => pageElement.querySelector(queryString);
export let $$ = (queryString) => pageElement.querySelectorAll(queryString);

export const raw = String.raw;

export function updatePageElement()
{
	pageElement = document.body.querySelector(".page");

	$ = (queryString) => pageElement.querySelector(queryString);
	$$ = (queryString) => pageElement.querySelectorAll(queryString);
}



const params = new URLSearchParams(document.location.search);

export let pageUrl = decodeURIComponent(params.get("page")).replace("index.html", "");

if (pageUrl[pageUrl.length - 1] === "/")
{
	pageUrl = pageUrl.slice(0, -1);
}

export function setPageUrl(newPageUrl)
{
	pageUrl = newPageUrl;
}

if (pageUrl === "null")
{
	pageUrl = "/home";
}


export let temporaryListeners = [];

export function addTemporaryListener({ object, event, callback, options = {} })
{
	object.addEventListener(event, callback, options);

	temporaryListeners.push([object, event, callback]);
}

export function clearTemporaryListeners()
{
	temporaryListeners = [];
}



export let temporaryIntervals = [];

export function addTemporaryInterval(refreshId)
{
	temporaryIntervals.push(refreshId);
}

export function clearTemporaryIntervals()
{
	temporaryIntervals = [];
}



export let temporaryParams = [];

export function addTemporaryParam(key)
{
	temporaryParams.push(key);
}

export function clearTemporaryParams()
{
	temporaryParams = [];
}



export async function loadSite(url = pageUrl)
{
	await initDarkTheme(url);
	initReduceMotion();
	initIncreaseContrast();
	
	pageElement.classList.add("page");

	document.body.insertBefore(pageElement, document.body.firstChild);

	initInteractionListeners();

	initOnResize();



	if ("scrollRestoration" in history)
	{
		history.scrollRestoration = "manual";
	}

	// When in PWA form, disable text selection and drag-and-drop.
	if (matchMedia("(display-mode: standalone)").matches)
	{
		document.documentElement.style.WebkitUserSelect = "none";
		document.documentElement.style.userSelect = "none";
		document.documentElement.style.WebkitTouchCallout = "none";

		for (const element of $$("body *"))
		{
			element.setAttribute("draggable", "false");
		}

		// Also add a little extra spacing at the top of each page
		// to keep content from feeling too close to the top of the screen.
		addStyle(`
			#logo, .name-text-container, .empty-top
			{
				margin-top: 2vh;
			}
		`, false);
	}

	// Fade in the opacity when the user presses the back button.
	window.addEventListener("popstate", (e) =>
	{
		// Ew
		if (window.location.href.indexOf("#") !== -1)
		{
			return;
		}

		redirect({
			url: e.state.url,
			noStatePush: true,
			restoreScroll: true
		});
	});

	if (!window.DEBUG)
	{
		addStyle(".DEBUG {display: none;}", false);
	}

	addHeader();

	pageUrl = "";

	// If it's not an html file, it shouldn't be anywhere near redirect().
	if (url.indexOf(".") !== -1)
	{
		// This should really be using history.replaceState(),
		// but that doesn't update the page to make the file show for some reason.
		window.location.href = url;
	}

	else
	{
		await redirect({
			url,
			noStatePush: true,
			noFadeOut: true,
			noFadeIn: window.DEBUG
		});

		await showAndRestoreScroll();

		let scrollTimeout;
		window.addEventListener("scroll", () =>
		{
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(setScroll, 100);
		});

		window.addEventListener("beforeunload", setScroll);
	}
}



// Adds a style tag to <head> with the given content.
// If temporary is true, it will be removed at the next page load. Returns the style element added.
export function addStyle(content, temporary = true, atBeginningOfHead = false)
{
	const element = document.createElement("style");

	element.textContent = content;

	if (temporary)
	{
		element.classList.add("temporary-style");
	}

	if (atBeginningOfHead)
	{
		document.head.insertBefore(element, document.head.firstChild);
	}

	else
	{
		document.head.appendChild(element);
	}

	return element;
}


async function showAndRestoreScroll()
{
	await sleep(10);

	if (siteSettings.card)
	{
		if (!blockCardPages.includes(pageUrl))
		{
			const targetScroll = siteSettings.scroll;

			await openCard({
				id: siteSettings.card,
				fromElement: pageElement,
				animationTime: 10
			});

			for (let i = 0; i < 20; i++)
			{
				cardContainer.scrollTo(0, targetScroll);

				if (targetScroll === 0 || cardContainer.scrollTop >= targetScroll - 1)
				{
					break;
				}

				await sleep(50);
			}
		}

		else
		{
			siteSettings.card = undefined;
		}
	}

	else
	{
		const targetScroll = siteSettings.scroll;

		// Retry scroll restoration until the page is tall enough
		// or we've waited long enough.
		for (let i = 0; i < 20; i++)
		{
			window.scrollTo(0, targetScroll);

			if (targetScroll === 0 || window.scrollY >= targetScroll - 1)
			{
				break;
			}

			await sleep(50);
		}
	}
}