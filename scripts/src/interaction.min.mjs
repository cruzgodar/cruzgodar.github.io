import { sitemap } from "./sitemap.mjs";

export let $ = (queryString) => pageElement.querySelector(queryString);
export let $$ = (queryString) => pageElement.querySelectorAll(queryString);

export let pageElement = document.createElement("div");

export function updatePageElement()
{
	pageElement = document.body.querySelector(".page");

	$ = (queryString) => pageElement.querySelector(queryString);
	$$ = (queryString) => pageElement.querySelectorAll(queryString);
}



const params = new URLSearchParams(document.location.search);

export let pageUrl = decodeURIComponent(params.get("page")).replace("index.html", "");

if (pageUrl === "null")
{
	pageUrl = "/home/";
}


export let pageScroll = 0;

let pageIsReadyToShow = false;

const pageSettings = {};



export const temporaryListeners = [];

export function addTemporaryListener({ object, event, callback })
{
	object.addEventListener(event, callback);

	temporaryListeners.push([object, event, callback]);
}

export function clearTemporaryListeners()
{
	temporaryListeners = [];
}



export const temporaryIntervals = [];

export function addTemporaryInterval({ callback, delay })
{
	const refreshId = setInterval(callback, delay);

	temporaryIntervals.push(refreshId);

	return refreshId;
}

export function clearTemporaryIntervals()
{
	temporaryIntervals = [];
}



export const temporaryWorkers = {};

export function addTemporaryWorker(src, id = src)
{
	try {temporaryWorkers[id].terminate()}
	catch(ex) {}

	const replacedSrc = window.DEBUG ? src.replace(".js", ".min.js") : src;

	const worker = new Worker(replacedSrc);

	temporaryWorkers[id] = worker;

	return worker;
}

export function clearTemporaryWorkers()
{
	temporaryWorkers = {};
}



export let visitedHomepage = false;

export function setVisitedHomepage(newVisitedHomepage)
{
	visitedHomepage = newVisitedHomepage;
}



const scriptsLoaded =
{
	"mathjax": false,
	"complexjs": false,
	"three": false,
	"lodash": false,
	"desmos": false,
	"glsl": 0
};
	
	

export async function loadSite(url)
{
	pageElement.classList.add("page");
	
	document.body.insertBefore(pageElement, document.body.firstChild);
	
	window.addEventListener("scroll", () => bannerOnScroll(0));
	
	
	
	Site.Interaction.setUpListeners();
	
	
	
	window.MathJax =
	{
		tex:
		{
			inlineMath: [["$", "$"], ["\\(", "\\)"]]
		}
	};
	
	await new Promise(async (resolve, reject) =>
	{
		await Site.loadScript("https://polyfill.io/v3/polyfill.min.js?features=es6");
		
		await Site.loadScript("https://cdn.jsdelivr.net/npm/mathjax@3.2.0/es5/tex-mml-chtml.js")
		
		resolve();
	});
	
	
	
	if ("scrollRestoration" in history)
	{
		history.scrollRestoration = "manual";
	}
	
	
	
	//When in PWA form, disable text selection and drag-and-drop.
	if (window.matchMedia("(display-mode: standalone)").matches)
	{
		document.documentElement.style.WebkitUserSelect = "none";
		document.documentElement.style.userSelect = "none";
		document.documentElement.style.WebkitTouchCallout = "none";
		
		$$("body *").forEach(element => element.setAttribute("draggable", "false"));
		
		
		
		//Also add a little extra spacing at the top of each page to keep content from feeling too close to the top of the screen.
		addStyle(`
			#logo, .name-text-container, .empty-top
			{
				margin-top: 2vh;
			}
		`, false);
	}
	
	
	
	//Fade in the opacity when the user presses the back button.
	window.addEventListener("popstate", (e) =>
	{
		//Ew
		if (window.location.href.indexOf("#") !== -1)
		{
			return;
		}
		
		redirect({ url: e.state.url, noStatePush: true, restoreScroll: true });
	});
	
	
	
	if ("serviceWorker" in navigator)
	{
		window.addEventListener("load", () =>
		{
			navigator.serviceWorker.register("/service-worker.js");
		});
	}
	
	
	
	setScrollButtonExists(false);
	
	if (!Site.showingPresentation)
	{
		addHeader();
	}
	
	//If it's not an html file, it shouldn't be anywhere near redirect().
	if (url.indexOf(".") !== -1)
	{
		//This should really be using history.replaceState(), but that doesn't update the page to make the file show for some reason.
		window.location.href = url;
	}
	
	else
	{
		redirect({ url, noStatePush: true, noFadeOut: true });
	}
};



//Loads a script with the given source and returns a promise for when it completes.
Site.loadScript = function(src, isModule = false)
{
	return new Promise((resolve, reject) =>
	{
		const script = document.createElement("script");
		
		if (isModule)
		{
			script.setAttribute("type", "module");
		}
		
		document.body.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
		script.async = true;
		script.src = src;
	});
};



//Loads a style with the given href.
Site.loadStyle = function(href)
{
	const style = document.createElement("link");
	
	style.setAttribute("rel", "stylesheet");
	style.setAttribute("type", "text/css");
	
	document.head.appendChild(style);
	
	style.setAttribute("href", href);
	
	return style;
};



//Adds a style tag to <head> with the given content. If temporary is true, it will be removed at the next page load. Returns the style element added.
Site.addStyle = function(content, temporary = true, atBeginningOfHead = false)
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
};



Site.Interaction =
{
	//Whether this is a touchscreen device on the current page. It's assumed to be false on every page until a touchstart or touchmove event is detected, at which point it's set to true.
	currentlyTouchDevice: (("ontouchstart" in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)),
	
	lastMousemoveEvent: 0,
	
	lastTouchX: 0,
	lastTouchY: 0,
	
	
	
	setUpListeners: function()
	{
		const boundFunction = this.handleTouchEvent.bind(this);
		
		document.documentElement.addEventListener("touchstart", boundFunction, false);
		document.documentElement.addEventListener("touchmove", boundFunction, false);



		document.documentElement.addEventListener("mousemove", () =>
		{
			if (this.currentlyTouchDevice)
			{
				const timeBetweenMousemoves = Date.now() - this.lastMousemoveEvent;
				
				this.lastMousemoveEvent = Date.now();
				
				//Checking if it's >= 3 kinda sucks, but it seems like touch devices like to fire two mousemoves in quick succession sometimes. They also like to make that delay exactly 33. Look, I hate this too, but it needs to be here.
				if (timeBetweenMousemoves >= 3 && timeBetweenMousemoves <= 50 && timeBetweenMousemoves !== 33)
				{
					this.currentlyTouchDevice = false;
				}
			}
		});



		document.documentElement.addEventListener("keydown", (e) =>
		{
			//Click the focused element when the enter key is pressed.
			if (e.keyCode === 13)
			{
				if (document.activeElement.classList.contains("click-on-child"))
				{
					document.activeElement.children[0].click();
				}
				
				else if (!(document.activeElement.tagName === "BUTTON" || (document.activeElement.tagName === "INPUT" && document.activeElement.getAttribute("type") !== "button")))
				{
					document.activeElement.click();
				}
			}
		});



		//Remove focus when moving the mouse or touching anything.
		document.documentElement.addEventListener("mousedown", () =>
		{
			if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "SELECT")
			{
				document.activeElement.blur();
			}
			
			else if (document.activeElement.tagName !== "SELECT")
			{
				try {element.previousElementSibling.classList.remove("hover");}
				catch(ex) {}
			}
		});
	},
	
	
	
	handleTouchEvent: function(e)
	{
		this.lastTouchX = e.touches[0].clientX;
		this.lastTouchY = e.touches[0].clientY;
		
		if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && document.activeElement.tagName !== "SELECT")
		{
			document.activeElement.blur();
		}
		
		if (!this.currentlyTouchDevice)
		{
			removeHoverEvents();
			
			this.currentlyTouchDevice = true;
		}
	}
};