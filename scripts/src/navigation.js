import { clearCurrentlyLoadedApplets, currentlyLoadedApplets } from "../applets/applet.js";
import {
	fadeDownOut,
	fadeLeftOut,
	fadeOut,
	fadeRightOut,
	fadeUpOut,
	opacityAnimationTime
} from "./animation.js";
import {
	bannerElement,
	bannerPages,
	loadBanner,
	preloadBanner
} from "./banners.js";
import { cardIsOpen, closeCard } from "./cards.js";
import { clearDesmosGraphs, desmosGraphs } from "./desmos.js";
import { loadPage } from "./loadPage.js";
import {
	clearTemporaryIntervals,
	clearTemporaryListeners,
	clearTemporaryParams,
	clearTemporaryWorkers,
	pageElement,
	pageUrl,
	setPageUrl,
	temporaryIntervals,
	temporaryListeners,
	temporaryParams,
	temporaryWorkers
} from "./main.js";
import {
	forceThemePages,
	getQueryParams,
	revertTheme,
	setForcedTheme,
	setOnThemeChange,
	setRevertThemeTo,
	siteSettings,
	toggleDarkTheme
} from "./settings.js";
import { sitemap } from "./sitemap.js";
import { asyncFetch, sleep } from "./utils.js";

export let currentlyRedirecting = false;

export function setCurrentlyRedirecting(newCurrentlyRedirecting)
{
	currentlyRedirecting = newCurrentlyRedirecting;
}

let lastPageScroll = 0;

export let navigationTransitionType = 0;

const urlsFetched = [];



// Handles virtually all links.
export async function redirect({
	url,
	inNewTab = false,
	noStatePush = false,
	restoreScroll = false,
	noFadeOut = false,
	noFadeIn = false,
}) {
	if (currentlyRedirecting)
	{
		return;
	}

	// If we're going somewhere outside of the site,
	// open it in a new tab and don't screw with the opacity.
	if (
		inNewTab
		|| url.indexOf("http") !== -1
		|| url.indexOf("mailto:") !== -1
		|| url.slice(-4) == ".pdf"
	) {
		window.open(url, "_blank");
		return;
	}

	if (url === pageUrl)
	{
		return;
	}

	const queryParams = (() =>
	{
		if (url.indexOf("?") !== -1)
		{
			const [trimmedUrl, params] = url.split("?");

			url = trimmedUrl;
			
			return params;
		}

		return "";
	})();

	if (url[url.length - 1] === "/")
	{
		url = url.slice(0, -1);
	}

	currentlyRedirecting = true;

	const temp = window.scrollY;

	navigationTransitionType = getTransitionType(url);
	
	async function swapPageContents()
	{
		// Get the new data, fade out the page,
		// and preload the next page's banner if it exists.
		// When all of those things are successfully done,
		// replace the current html with the new stuff.
		
		const [text] = await Promise.all([
			asyncFetch(`${url}/data.html`),
			preloadBanner(url),
			fadeOutPage(noFadeOut),
			cardIsOpen ? closeCard() : Promise.resolve()
		]);

		

		loadBanner({ url });

		if (forceThemePages[url])
		{
			setForcedTheme(true);

			if (siteSettings.darkTheme !== forceThemePages[url])
			{
				setRevertThemeTo(siteSettings.darkTheme);
				toggleDarkTheme({ force: true, noAnimation: siteSettings.reduceMotion });
			}
		}

		else if (!forceThemePages[url])
		{
			revertTheme();
		}

		unloadPage();

		document.body.firstElementChild.insertAdjacentHTML(
			"beforebegin",
			`<div class="page"${opacityAnimationTime ? " style=\"opacity: 0\"" : ""}>${text}</div>`
		);

		setPageUrl(url);

		urlsFetched.push(url);

		loadPage(noFadeIn);
	}


	if (siteSettings.reduceMotion && document.startViewTransition)
	{
		await document.startViewTransition(swapPageContents).finished;
	}

	else
	{
		await swapPageContents();
	}


	
	// Record the page change in the url bar and in the browser history.
	if (noStatePush)
	{
		history.replaceState({ url }, document.title, getDisplayUrl(queryParams));
	}

	else
	{
		history.pushState({ url }, document.title, getDisplayUrl(queryParams) || "/");
	}



	// Restore the ability to scroll in case it was removed.
	document.documentElement.style.overflowY = "scroll";
	document.body.style.overflowY = "visible";

	document.body.style.userSelect = "auto";
	document.body.style.WebkitUserSelect = "auto";


	if (restoreScroll)
	{
		window.scrollTo(0, lastPageScroll);
	}

	lastPageScroll = temp;
}



// Figures out what type of transition to use to get to this url.
// Returns 1 for deeper, -1 for shallower, 2 for a sibling to the right,
// -2 for one to the left, and 0 for anything else.
function getTransitionType(url)
{
	if (!(url in sitemap) || url === pageUrl || !pageUrl)
	{
		return 0;
	}



	let parent = pageUrl;

	while (parent !== "")
	{
		parent = sitemap[parent].parent;

		if (url === parent)
		{
			return -1;
		}
	}



	parent = url;

	while (parent !== "")
	{
		parent = sitemap[parent].parent;

		if (pageUrl === parent)
		{
			return 1;
		}
	}



	if (sitemap[url].parent === sitemap[pageUrl].parent)
	{
		const parent = sitemap[url].parent;

		if (sitemap[parent].children.indexOf(url) > sitemap[parent].children.indexOf(pageUrl))
		{
			return 2;
		}

		return -2;
	}

	return 0;
}



export function getDisplayUrl(additionalQueryParams)
{
	const queryParams = getQueryParams() + (additionalQueryParams ? `&${additionalQueryParams}` : "");

	let displayUrl = pageUrl.replace(/\/home/, "/");
	
	if (displayUrl[displayUrl.length - 1] === "/")
	{
		displayUrl = displayUrl.slice(0, -1);
	}
	
	displayUrl = displayUrl + (queryParams ? `/?${queryParams}` : "");

	return displayUrl;
}



async function fadeOutPage(noFadeOut)
{
	if (!opacityAnimationTime)
	{
		return;
	}

	if (noFadeOut || siteSettings.reduceMotion)
	{
		pageElement.style.opacity = 0;

		if (bannerElement)
		{
			bannerElement.style.opacity = 0;
		}

		return;
	}



	// Fade out the current page's content.
	await (() =>
	{
		if (navigationTransitionType === 1)
		{
			return bannerElement
				? Promise.all([
					fadeUpOut({
						element: bannerElement,
						noOpacityChange: true
					}),
					fadeUpOut({ element: pageElement })
				])
				: fadeUpOut({ element: pageElement });
		}

		else if (navigationTransitionType === -1)
		{
			return bannerElement
				? Promise.all([
					fadeDownOut({
						element: bannerElement,
						noOpacityChange: true
					}),
					fadeDownOut({ element: pageElement })
				])
				: fadeDownOut({ element: pageElement });
		}

		else if (navigationTransitionType === 2)
		{
			return bannerElement
				? Promise.all([
					fadeLeftOut({
						element: bannerElement,
						noOpacityChange: true
					}),
					fadeLeftOut({ element: pageElement })
				])
				: fadeLeftOut({ element: pageElement });
		}

		else if (navigationTransitionType === -2)
		{
			return bannerElement
				? Promise.all([
					fadeRightOut({
						element: bannerElement,
						noOpacityChange: true
					}),
					fadeRightOut({ element: pageElement })
				])
				: fadeRightOut({ element: pageElement });
		}

		else
		{
			return bannerElement
				? Promise.all([
					fadeOut({
						element: bannerElement,
						noOpacityChange: true
					}),
					fadeOut({ element: pageElement })
				])
				: fadeOut({ element: pageElement });
		}
	})();

	await sleep(33);
}



function unloadPage()
{
	// Remove temporary things outside the page element.
	const elements = document.querySelectorAll(
		"script, .temporary-style, .WILSON_fullscreen-container, .temporary-element"
	);

	for (const element of elements)
	{
		element.remove();
	}
	
	for (const temporaryListener of temporaryListeners)
	{
		temporaryListener[0].removeEventListener(temporaryListener[1], temporaryListener[2]);
	}

	clearTemporaryListeners();



	for (const refreshId of temporaryIntervals)
	{
		clearInterval(refreshId);
	}

	clearTemporaryIntervals();



	for (const key in temporaryWorkers)
	{
		if (temporaryWorkers[key]?.terminate)
		{
			temporaryWorkers[key].terminate();
		}
	}

	clearTemporaryWorkers();



	for (const key in desmosGraphs)
	{
		desmosGraphs[key].destroy();
	}

	clearDesmosGraphs();



	const searchParams = new URLSearchParams(window.location.search);

	for (const key of temporaryParams)
	{
		searchParams.delete(key);
	}

	const string = searchParams.toString();

	window.history.replaceState(
		{ url: pageUrl },
		"",
		pageUrl.replace(/\/home/, "") + "/" + (string ? `?${string}` : "")
	);

	clearTemporaryParams();

	document.documentElement.style.overscrollBehaviorY = "auto";



	setOnThemeChange(() => {});


	
	for (const applet of currentlyLoadedApplets)
	{
		if (applet?.destroy)
		{
			applet.destroy();
		}
	}

	clearCurrentlyLoadedApplets();

	pageElement.remove();
}

// Fetches (and caches) a url, including all the page images
// and banner images, and its scripts and styles.
export async function prefetchPage(url)
{
	url = url.replace(/^https*:\/\/.+?(\/.+)$/, (match, $1) => $1);

	if (urlsFetched.includes(url))
	{
		return;
	}

	urlsFetched.push(url);

	const urlsToFetch = [`${url}/data.html`];

	if (bannerPages.includes(url))
	{
		urlsToFetch.push(`${url}/banners/small.webp`);
	}
	
	const sitemapEntry = sitemap[url];

	if (sitemapEntry?.customScript)
	{
		urlsToFetch.push(`${url}/scripts/index.min.js`);
	}

	if (sitemapEntry?.customStyle)
	{
		urlsToFetch.push(`${url}/style/index.min.css`);
	}

	await Promise.all(urlsToFetch.map(urlToFetch => asyncFetch(urlToFetch)));
}