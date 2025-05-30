import { cardContainer, showCard } from "./cards.js";
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



export let temporaryWorkers = {};

export function addTemporaryWorker(src, id = src)
{
	if (temporaryWorkers[id]?.terminate)
	{
		temporaryWorkers[id].terminate();
	}

	const replacedSrc = window.DEBUG ? src : src.replace(".js", ".min.js");

	const worker = new Worker(replacedSrc);

	temporaryWorkers[id] = worker;

	return worker;
}

export function clearTemporaryWorkers()
{
	temporaryWorkers = {};
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



const scriptsLoaded =
{
	glsl: 0
};



export async function loadSite(url = pageUrl)
{
	await initDarkTheme();
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

	

	if (window.DEBUG)
	{
		window.addEventListener("scroll", () => setScroll());
		window.addEventListener("resize", () => setScroll());
	}

	else
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
			noFadeOut: true
		});

		showAndRestoreScroll();
	}
}



// Loads a script with the given source and returns a promise for when it completes.
export function loadScript(src, isModule = false)
{
	return new Promise((resolve, reject) =>
	{
		if (scriptsLoaded[src])
		{
			resolve();
			return;
		}

		const script = document.createElement("script");

		if (isModule)
		{
			script.setAttribute("type", "module");
		}

		document.body.appendChild(script);

		script.onload = () =>
		{
			scriptsLoaded[src] = true;

			resolve();
		};

		script.onerror = reject;
		script.async = true;
		script.src = src;
	});
}



// Loads a style with the given href.
export function loadStyle(href)
{
	const style = document.createElement("link");

	style.setAttribute("rel", "stylesheet");
	style.setAttribute("type", "text/css");

	document.head.appendChild(style);

	style.setAttribute("href", href);

	return style;
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
	const scroll = siteSettings.scroll;
	siteSettings.scroll = undefined;

	await sleep(10);
	
	if (siteSettings.card)
	{
		if (!blockCardPages.includes(pageUrl))
		{
			showCard({
				id: siteSettings.card,
				fromElement: pageElement,
				animationTime: 10
			}).then(() =>
			{
				cardContainer.scrollTo(0, scroll);

				setTimeout(() =>
				{
					cardContainer.scrollTo(0, scroll);
				}, 100);
			});
		}

		else
		{
			siteSettings.card = undefined;
		}
	}

	else
	{
		window.scrollTo(0, scroll);
		setTimeout(() => window.scrollTo(0, scroll), 100);
	}
}