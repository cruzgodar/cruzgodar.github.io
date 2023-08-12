import { fadeDownOut, fadeLeftOut, fadeOut, fadeRightOut, fadeUpOut } from "./animation.mjs";
import { bannerElement, bannerOnScroll, loadBanner } from "./banners.mjs";
import { cardIsOpen, hideCard } from "./cards.mjs";
import { loadPage, pageElement } from "./load-page.mjs";
import { forceThemePages, preventThemeChangePages, setForcedTheme, setRevertThemeTo, siteSettings, toggleDarkTheme } from "./settings.mjs";

let currentlyRedirecting = false;

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
	if (currentlyRedirecting)
	{
		return;
	}
	
	//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
	if (inNewTab || url.indexOf(".") !== -1)
	{
		window.open(url, "_blank");
		return;
	}
	
	if (cardIsOpen)
	{
		await hideCard();
	}
	
	currentlyRedirecting = true;
	
	const temp = window.scrollY;
	
	navigationTransitionType = getTransitionType(url);
	
	
	
	//We need to record this in case we can't successfully load the next page and we need to return to the current one.
	const backgroundColor = document.documentElement.style.backgroundColor;
	
	await fadeOutPage({url, noFadeOut});
	
	Page.url = url;
	
	//Get the new data, fade out the page, and preload the next page's banner if it exists. When all of those things are successfully done, replace the current html with the new stuff.
	Promise.all([fetch(`${url}index.html`), loadBanner()])
	
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
		
		const index = data.indexOf("</head>");
		
		if (index !== -1)
		{
			data = data.slice(index + 7);
		}
		
		
		data = data.slice(data.indexOf("<body>") + 6, data.indexOf("</body>"));
			
		document.body.firstElementChild.insertAdjacentHTML("beforebegin", `<div class="page" style="${Site.showingPresentation ? "display: none; " : ""}opacity: 0">${data}</div>`);
		
		currentlyRedirecting = false;

		loadPage();
		
		
		
		//Record the page change in the url bar and in the browser history.
		const displayUrl = url.replace(/\/home\//, "/");

		if (noStatePush)
		{
			history.replaceState({url}, document.title, displayUrl);
		}
		
		else
		{
			history.pushState({url}, document.title, displayUrl);
		}
		
		
		
		//Restore the ability to scroll in case it was removed.
		document.documentElement.style.overflowY = "visible";
		document.body.style.overflowY = "visible";
		
		document.body.style.userSelect = "auto";
		document.body.style.WebkitUserSelect = "auto";
		
		
		
		if (restoreScroll)
		{
			window.scrollTo(0, lastPageScroll);
			bannerOnScroll(lastPageScroll);
		}
		
		else
		{
			window.scrollTo(0, 0);
			Page.scroll = 0;
		}
		
		lastPageScroll = temp;
	})
	
	
	
	.catch((error) =>
	{
		console.error(error.message);
		
		console.error("Failed to load new page :(");
	});
}



//Figures out what type of transition to use to get to this url. Returns 1 for deeper, -1 for shallower, 2 for a sibling to the right, -2 for one to the left, and 0 for anything else.
function getTransitionType(url)
{
	if (!(url in Site.sitemap) || url === Page.url)
	{
		return 0;
	}
	
	
	
	let parent = Page.url;
	
	while (parent !== "")
	{
		parent = Site.sitemap[parent].parent;
		
		if (url === parent)
		{
			return -1;
		}
	}
	
	
	
	parent = url;
	
	while (parent !== "")
	{
		parent = Site.sitemap[parent].parent;
		
		if (Page.url === parent)
		{
			return 1;
		}
	}
	
	
	
	if (Site.sitemap[url].parent === Site.sitemap[Page.url].parent)
	{
		const parent = Site.sitemap[url].parent;
		
		if (Site.sitemap[parent].children.indexOf(url) > Site.sitemap[parent].children.indexOf(Page.url))
		{
			return 2;
		}
		
		return -2;
	}
	
	
	
	return 0;
}




async function fadeOutPage({ url, noFadeOut })
{
	if (forceThemePages[url] !== undefined && siteSettings.darkTheme !== forceThemePages[url] && !(preventThemeChangePages.includes(Page.url)))
	{
		setRevertThemeTo(siteSettings.darkTheme);

		setForcedTheme(true);

		toggleDarkTheme({ force: true });
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
			return bannerElement ? Promise.all([fadeUpOut(pageElement, Site.pageAnimationTime), fadeUpOut(bannerElement, Site.pageAnimationTime * 2)]) : fadeUpOut(pageElement, Site.pageAnimationTime);
		}
		
		else if (navigationTransitionType === -1)
		{
			return bannerElement ? Promise.all([fadeDownOut(bannerElement, Site.pageAnimationTime * 2), fadeDownOut(pageElement, Site.pageAnimationTime)]) : fadeDownOut(pageElement, Site.pageAnimationTime);
		}
		
		else if (navigationTransitionType === 2)
		{
			return bannerElement ? Promise.all([fadeLeftOut(bannerElement, Site.pageAnimationTime * 2), fadeLeftOut(pageElement, Site.pageAnimationTime)]) : fadeLeftOut(pageElement, Site.pageAnimationTime);
		}
		
		else if (navigationTransitionType === -2)
		{
			return bannerElement ? Promise.all([fadeRightOut(bannerElement, Site.pageAnimationTime * 2), fadeRightOut(pageElement, Site.pageAnimationTime)]) : fadeRightOut(pageElement, Site.pageAnimationTime);
		}
		
		else
		{
			return bannerElement ? Promise.all([fadeOut(bannerElement, Site.pageAnimationTime * 2), fadeOut(pageElement, Site.pageAnimationTime)]) : fadeOut(pageElement, Site.pageAnimationTime);
		}
	})()
		
		
		
	//If necessary, take the time to fade back to the default background color, whatever that is.
	if (Page.backgroundColorChanged)
	{
		document.documentElement.classList.add("background-transition");
		document.body.classList.add("background-transition");

		const backgroundColor = Site.Settings.urlVars["theme"] === 1 ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)";

		document.documentElement.style.backgroundColor = backgroundColor;
		document.body.style.backgroundColor = backgroundColor;
		
		anime({
			targets: Site.Settings.metaThemeColorElement,
			content: Site.Settings.urlVars["theme"] === 1 ? "#181818" : "#ffffff",
			duration: Site.backgroundColorAnimationTime,
			easing: "cubicBezier(.42, 0, .58, 1)",
			complete: () =>
			{
				document.body.style.backgroundColor = "";
				
				document.documentElement.classList.remove("background-transition");
				document.body.classList.remove("background-transition");
			}
		});
	}
}



function unloadPage()
{
	//Remove JS so it's not executed twice.
	document.querySelectorAll("script, style.temporary-style, link.temporary-style").forEach(element => element.remove());
	
	//document.querySelectorAll("#header-links a").forEach(element => element.classList.remove("active"));
	
	//Clear temporary things.
	//Unbind everything transient from the window and the html element.
	for (let key in Page.temporaryHandlers)
	{
		for (let j = 0; j < Page.temporaryHandlers[key].length; j++)
		{
			window.removeEventListener(key, Page.temporaryHandlers[key][j]);
			document.documentElement.removeEventListener(key, Page.temporaryHandlers[key][j]);
		}
	}
	
	
	
	Page.temporaryIntervals.forEach(refreshId => clearInterval(refreshId));
	
	Page.temporaryIntervals = [];
	
	
	
	Page.temporaryWebWorkers.forEach(webWorker => webWorker.terminate());
	
	Page.temporaryWebWorkers = [];
	
	
	
	for (let key in Page.desmosGraphs)
	{
		Page.desmosGraphs[key].destroy();
	}
	
	
	try 
	{
		Applet.current.forEach(applet => applet.destroy());
		
		Applet.current = [];
	}
	
	catch(ex) {}
	
	
	pageElement.remove();
}