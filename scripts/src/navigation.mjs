import {
	fadeDownOut,
	fadeLeftOut,
	fadeOut,
	fadeRightOut,
	fadeUpOut,
	opacityAnimationTime
} from "./animation.mjs";
import { Applet } from "./applets.mjs";
import {
	bannerElement,
	loadBanner,
	setScrollButtonExists
} from "./banners.mjs";
import { cardIsOpen, hideCard } from "./cards.mjs";
import { clearDesmosGraphs, desmosGraphs } from "./desmos.mjs";
import { loadPage } from "./load-page.mjs";
import {
	clearTemporaryIntervals,
	clearTemporaryListeners,
	clearTemporaryWorkers,
	pageElement,
	pageUrl,
	setPageUrl,
	temporaryIntervals,
	temporaryListeners,
	temporaryWorkers
} from "./main.mjs";
import {
	forceThemePages,
	getQueryParams,
	setForcedTheme,
	setRevertThemeTo,
	siteSettings,
	toggleDarkTheme
} from "./settings.mjs";
import { sitemap } from "./sitemap.mjs";

let currentlyRedirecting = false;

export function setCurrentlyRedirecting(newCurrentlyRedirecting)
{
	currentlyRedirecting = newCurrentlyRedirecting;
}

let lastPageScroll = 0;

export let navigationTransitionType = 0;



//Handles virtually all links.
export async function redirect({
	url,
	inNewTab = false,
	noStatePush = false,
	restoreScroll = false,
	noFadeOut = false
})
{
	if (currentlyRedirecting || url === pageUrl)
	{
		return;
	}

	//If we're going somewhere outside of the site,
	//open it in a new tab and don't screw with the opacity.
	if (inNewTab || url.indexOf(".") !== -1)
	{
		window.open(url, "_blank");
		return;
	}

	currentlyRedirecting = true;

	if (cardIsOpen)
	{
		await hideCard();
	}


	const temp = window.scrollY;

	navigationTransitionType = getTransitionType(url);



	await fadeOutPage({ url, noFadeOut });

	//Get the new data, fade out the page, and preload the next page's banner if it exists.
	//When all of those things are successfully done, replace the current html with the new stuff.
	Promise.all([fetch(`${url}data.html`), loadBanner()])
		.then((response) =>
		{
			if (!response[0].ok)
			{
				window.location.replace("/404.html");
			}

			else
			{
				return response[0].text();
			}
		})
		.then((data) =>
		{
			unloadPage();

			document.body.firstElementChild.insertAdjacentHTML(
				"beforebegin",
				`<div class="page"${opacityAnimationTime ? "style=\"opacity: 0\"" : ""}>${data}</div>`
			);

			setPageUrl(url);

			loadPage();



			//Record the page change in the url bar and in the browser history.
			if (noStatePush)
			{
				history.replaceState({ url }, document.title, getDisplayUrl());
			}

			else
			{
				history.pushState({ url }, document.title, getDisplayUrl());
			}



			//Restore the ability to scroll in case it was removed.
			document.documentElement.style.overflowY = "scroll";
			document.body.style.overflowY = "visible";

			document.body.style.userSelect = "auto";
			document.body.style.WebkitUserSelect = "auto";



			if (restoreScroll)
			{
				window.scrollTo(0, lastPageScroll);
			}

			else
			{
				window.scrollTo(0, 0);
			}

			lastPageScroll = temp;
		});
}



//Figures out what type of transition to use to get to this url.
//Returns 1 for deeper, -1 for shallower, 2 for a sibling to the right,
//-2 for one to the left, and 0 for anything else.
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



export function getDisplayUrl()
{
	return pageUrl.replace(/\/home\//, "/") + getQueryParams();
}



async function fadeOutPage({ url, noFadeOut })
{
	if (
		forceThemePages[url]
		&& siteSettings.darkTheme !== forceThemePages[url]
	)
	{
		setRevertThemeTo(siteSettings.darkTheme);

		setForcedTheme(true);

		toggleDarkTheme({ force: true });
	}

	if (!opacityAnimationTime)
	{
		return;
	}

	if (noFadeOut)
	{
		pageElement.style.opacity = 0;

		return;
	}



	//Fade out the current page's content.
	await (() =>
	{
		if (navigationTransitionType === 1)
		{
			return bannerElement
				? Promise.all([
					fadeUpOut(bannerElement, opacityAnimationTime, true),
					fadeUpOut(pageElement)
				])
				: fadeUpOut(pageElement);
		}

		else if (navigationTransitionType === -1)
		{
			return bannerElement
				? Promise.all([
					fadeDownOut(bannerElement, opacityAnimationTime, true),
					fadeDownOut(pageElement)
				])
				: fadeDownOut(pageElement);
		}

		else if (navigationTransitionType === 2)
		{
			return bannerElement
				? Promise.all([
					fadeLeftOut(bannerElement, opacityAnimationTime, true),
					fadeLeftOut(pageElement)
				])
				: fadeLeftOut(pageElement);
		}

		else if (navigationTransitionType === -2)
		{
			return bannerElement
				? Promise.all([
					fadeRightOut(bannerElement, opacityAnimationTime, true),
					fadeRightOut(pageElement)
				])
				: fadeRightOut(pageElement);
		}

		else
		{
			return bannerElement
				? Promise.all([
					fadeOut(bannerElement, opacityAnimationTime, true),
					fadeOut(pageElement)
				])
				: fadeOut(pageElement);
		}
	})();
}



function unloadPage()
{
	//Remove temporary things outside the page element.
	document.querySelectorAll("script, .temporary-style").forEach(element => element.remove());
	
	temporaryListeners.forEach(temporaryListener =>
	{
		temporaryListener[0].removeEventListener(temporaryListener[1], temporaryListener[2]);
	});

	clearTemporaryListeners();



	temporaryIntervals.forEach(refreshId => clearInterval(refreshId));

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


	Applet.current.forEach(applet =>
	{
		if (applet?.destroy)
		{
			applet.destroy();
		}
	});

	Applet.current = [];



	setScrollButtonExists(false);


	pageElement.remove();
}