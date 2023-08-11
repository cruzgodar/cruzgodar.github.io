import { fadeUpIn, fadeDownIn, fadeLeftIn, fadeRightIn, fadeIn } from "./animation.mjs"
import { setUpBanner, bannerElement, bannerOpacity } from "./banners.mjs"
import { setUpTextButtons, setUpNavButtons, setUpDropdowns } from "./buttons.mjs"
import { setUpCards } from "./cards.mjs"
import { addHoverEvent, setUpHoverEvents, setUpFocusEvents } from "./hover-events.mjs"
import { typesetMath } from "./math.mjs"
import { redirect, navigationTransitionType } from "./navigation.mjs"
import { siteSettings, toggleDarkTheme, revertTheme, condenseApplet } from "./settings.mjs"

export let headerElement = null;

//The big one. Gets a page ready to be shown but doesn't do anything that requires it to be visible.
export async function loadPage()
{
	window.dispatchEvent(new Event("scroll"));
	window.dispatchEvent(new Event("resize"));

	Page.element = document.body.querySelector(".page");
	$ = (queryString) => Page.element.querySelector(queryString);
	$$ = (queryString) => Page.element.querySelectorAll(queryString);
	
	//Set the page title.
	try {document.head.querySelector("title").textContent = Site.sitemap[Page.url].title}
	catch(ex) {}
	
	
	
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
	
	
	
	Page.backgroundColorChanged = false;
	
	revertTheme();
	
	
	
	if (siteSettings.condensedApplets && Site.sitemap[Page.url].parent === "/applets/")
	{
		condenseApplet();
	}
	
	
	
	setTimeout(() => setUpFocusEvents(), 50);
}



export async function showPage()
{
	await new Promise((resolve, reject) => setTimeout(resolve, 10));
	
	await fadeInPage();
}



function loadCustomStyle()
{
	fetch(`${Page.url}style/index.${window.DEBUG ? "css" : "min.css"}`)
	
	.then(response => response.text())
	
	.then(text =>
	{
		const element = document.createElement("style");
		
		element.textContent = text;
		
		//This is kind of subtle. If we append this new style to the end of the head, then it will take precendence over settings styles, which is terrible -- for example, the homepage will render all of its custom classes like quote-text and quote-attribution incorrectly. Therefore, we need to *prepend* it, ensuring it has the lowest-possible priority.
		element.classList.add("temporary-style");
		
		document.head.insertBefore(element, document.head.firstChild);
	})
	
	.catch(ex => {});
}



function loadCustomScripts()
{
	import(`${Page.url}scripts/index.${window.DEBUG ? "mjs" : "min.mjs"}`)

	.then(Module => Module.load())

	.catch(() =>
	{
		setTimeout(() => showPage(), 1);
	});
}



export function addHeader()
{
	document.body.firstChild.insertAdjacentHTML("beforebegin", `
		<div id="header-container"></div>
		
		<div id="header">
			<a id="header-logo" href="/home/">
				<img src="/graphics/header-icons/logo.webp"></img>
				<span>Cruz Godar</span>
			</a>
			
			<div id="header-links">
				<a id="header-gallery-link" href="/gallery/">
					<span>Gallery</span>
					<img src="/graphics/header-icons/gallery.webp"></img>
				</a>
				
				<a id="header-applets-link" href="/applets/">
					<span>Applets</span>
					<img src="/graphics/header-icons/applets.webp"></img>
				</a>
				
				<a id="header-teaching-link" href="/teaching/">
					<span>Teaching</span>
					<img src="/graphics/header-icons/teaching.webp"></img>
				</a>
				
				<a id="header-slides-link" href="/slides/">
					<span>Slides</span>
					<img src="/graphics/header-icons/slides.webp"></img>
				</a>
				
				<a id="header-writing-link" href="/writing/">
					<span>Writing</span>
					<img src="/graphics/header-icons/writing.webp"></img>
				</a>
				
				<a id="header-about-link" href="/about/">
					<span>About</span>
					<img src="/graphics/header-icons/about.webp"></img>
				</a>
			</div>
			
			<div id="header-theme-button">
				<input type="image" src="/graphics/header-icons/moon.webp">
			</div>
		</div>
	`);
	
	setTimeout(() =>
	{
		const imageElement = document.body.querySelector("#header-logo img");
		
		imageElement.style.width = `${imageElement.getBoundingClientRect().height}px`;
		
		
		
		document.body.querySelectorAll("#header-logo, #header-links a").forEach(link =>
		{
			addHoverEvent(link);
			
			const href = link.getAttribute("href");
	
			link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href));
			
			link.addEventListener("click", e =>
			{
				e.preventDefault();
				
				redirect({ url: href });
			});
		});
		
		
		
		const element = document.body.querySelector("#header-theme-button");
		
		addHoverEvent(element);
		
		element.addEventListener("click", () => toggleDarkTheme({}));
		
		
		
		headerElement = document.body.querySelector("#header");
	});
}



async function fadeInPage()
{
	await (() =>
	{
		if (navigationTransitionType === 1)
		{
			return bannerElement ? Promise.all([fadeUpIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeUpIn(Page.element, Site.pageAnimationTime * 2)]) : fadeUpIn(Page.element, Site.pageAnimationTime * 2);
		}
		
		else if (navigationTransitionType === -1)
		{
			return bannerElement ? Promise.all([fadeDownIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeDownIn(Page.element, Site.pageAnimationTime * 2)]) : fadeDownIn(Page.element, Site.pageAnimationTime * 2);
		}
		
		else if (navigationTransitionType === 2)
		{
			return bannerElement ? Promise.all([fadeLeftIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeLeftIn(Page.element, Site.pageAnimationTime * 2)]) : fadeLeftIn(Page.element, Site.pageAnimationTime * 2);
		}
		
		else if (navigationTransitionType === -2)
		{
			return bannerElement ? Promise.all([fadeRightIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeRightIn(Page.element, Site.pageAnimationTime * 2)]) : fadeRightIn(Page.element, Site.pageAnimationTime * 2);
		}
		
		else
		{
			return bannerElement ? Promise.all([fadeIn(bannerElement, Site.pageAnimationTime * 2, bannerOpacity), fadeIn(Page.element, Site.pageAnimationTime * 2)]) : fadeIn(Page.element, Site.pageAnimationTime * 2);
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