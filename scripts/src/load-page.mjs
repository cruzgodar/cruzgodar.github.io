import { fadeDownIn, fadeIn, fadeLeftIn, fadeRightIn, fadeUpIn, pageAnimationTime } from "./animation.mjs";
import { bannerElement, bannerOpacity, setUpBanner } from "./banners.mjs";
import { setUpDropdowns, setUpNavButtons, setUpTextButtons } from "./buttons.mjs";
import { setUpCards } from "./cards.mjs";
import { setUpFocusEvents, setUpHoverEvents } from "./hover-events.mjs";
import { equalizeAppletColumns, onResize } from "./layout.mjs";
import { $$, pageElement, pageUrl, updatePageElement } from "./main.mjs";
import { typesetMath } from "./math.mjs";
import { navigationTransitionType, redirect, setCurrentlyRedirecting } from "./navigation.mjs";
import { condenseApplet, revertTheme, siteSettings } from "./settings.mjs";
import { sitemap } from "./sitemap.mjs";

//The big one. Gets a page ready to be shown but doesn't do anything that requires it to be visible.
export async function loadPage()
{
	window.dispatchEvent(new Event("scroll"));

	updatePageElement();

	//Set the page title.
	const titleElement = document.head.querySelector("title");

	if (titleElement)
	{
		titleElement.textContent = sitemap[pageUrl].title;
	}



	setUpBanner();

	loadCustomStyle();

	loadCustomScripts();

	equalizeAppletColumns();

	setLinks();

	disableLinks();

	setUpHoverEvents();

	setUpTextButtons();

	setUpNavButtons();

	setUpDropdowns();

	typesetMath();

	setUpCards();

	onResize();

	revertTheme();

	if (siteSettings.condensedApplets && sitemap[pageUrl].parent === "/applets/")
	{
		condenseApplet();
	}

	setTimeout(setUpFocusEvents, 50);
	setTimeout(equalizeAppletColumns, 100);
}



export async function showPage()
{
	await new Promise(resolve => setTimeout(resolve, 10));

	await fadeInPage();

	setCurrentlyRedirecting(false);
}



function loadCustomStyle()
{
	fetch(`${pageUrl}style/index.${window.DEBUG ? "css" : "min.css"}`)
		.then(response => response.text())
		.then(text =>
		{
			const element = document.createElement("style");

			element.textContent = text;
			
			element.classList.add("temporary-style");
			
			//This is kind of subtle. If we append this new style to the end of the head,
			//then it will take precendence over settings styles, which is terrible --
			//for example, the homepage will render all of its custom classes like
			//quote-text and quote-attribution incorrectly. Therefore, we need to
			//*prepend* it, ensuring it has the lowest-possible priority.
			document.head.insertBefore(element, document.head.firstChild);
		});
}



function loadCustomScripts()
{
	import(`${pageUrl}scripts/index.${window.DEBUG ? "mjs" : "min.mjs"}`)
		.then(Module => Module.load())
		.catch(() => window.requestAnimationFrame(showPage));
}

async function fadeInPage()
{
	fadeIn(document.querySelector("#header"));
	document.querySelector("#header-container").style.opacity = 1;

	await (() =>
	{
		if (navigationTransitionType === 1)
		{
			return bannerElement ? Promise.all([fadeUpIn(bannerElement, pageAnimationTime * 2, bannerOpacity), fadeUpIn(pageElement)]) : fadeUpIn(pageElement);
		}

		else if (navigationTransitionType === -1)
		{
			return bannerElement ? Promise.all([fadeDownIn(bannerElement, pageAnimationTime * 2, bannerOpacity), fadeDownIn(pageElement)]) : fadeDownIn(pageElement);
		}

		else if (navigationTransitionType === 2)
		{
			return bannerElement ? Promise.all([fadeLeftIn(bannerElement, pageAnimationTime * 2, bannerOpacity), fadeLeftIn(pageElement)]) : fadeLeftIn(pageElement);
		}

		else if (navigationTransitionType === -2)
		{
			return bannerElement ? Promise.all([fadeRightIn(bannerElement, pageAnimationTime * 2, bannerOpacity), fadeRightIn(pageElement)]) : fadeRightIn(pageElement);
		}

		else
		{
			return bannerElement ? Promise.all([fadeIn(bannerElement, pageAnimationTime * 2, bannerOpacity), fadeIn(pageElement)]) : fadeIn(pageElement);
		}
	})();
}



function setLinks()
{
	$$("a").forEach(link =>
	{
		const href = link.getAttribute("href");

		if (href === null)
		{
			return;
		}

		const inNewTab = !(href.slice(0, 5) !== "https" && href.slice(0, 4) !== "data" && !(link.getAttribute("data-in-new-tab") == 1));

		link.addEventListener("click", () => redirect({ url: href, inNewTab }));
	});
}

export function disableLinks()
{
	$$("a:not(.real-link)").forEach(link => link.addEventListener("click", e => e.preventDefault()));
}