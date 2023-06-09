"use strict";



Page.Navigation =
{
	currentlyChangingPage: false,

	lastPageScroll: 0,
	
	elementsToRemove: [],
	
	navigationPath: [],
	
	transitionType: 0,
	
	
	
	//Handles virtually all links.
	redirect: async function(url, inNewTab = false, noStatePush = false, restoreScroll = false, noFadeOut = false)
	{
		if (this.currentlyChangingPage)
		{
			return;
		}
		
		//If we're going somewhere outside of the site, open it in a new tab and don't screw with the opacity.
		if (inNewTab || url.indexOf(".") !== -1)
		{
			window.open(url, "_blank");
			return;
		}
		
		if (Page.Cards.isOpen)
		{
			await Page.Cards.hide();
		}
		
		
		
		this.currentlyChangingPage = true;
		
		
		
		const temp = window.scrollY;
		
		
		
		Site.appletProcessId++;
		
		
		
		this.transitionType = this.getTransitionType(url);
		
		Page.url = url;
		
		Page.parentFolder = url.slice(0, url.length);
		
		document.querySelectorAll("#header-links a").forEach(element => element.classList.remove("active"));
		
		
		
		//We need to record this in case we can't successfully load the next page and we need to return to the current one.
		const backgroundColor = document.documentElement.style.backgroundColor;
		
		await Page.Unload.fadeOut(noFadeOut, url);
		
		
		
		//Get the new data, fade out the page, and preload the next page's banner if it exists. When all of those things are successfully done, replace the current html with the new stuff.
		Promise.all([fetch(url + `${DEBUG ? "src" : "index"}.html`), Page.Banner.load()])
		
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
			Page.unload();
			
			
			
			let index = data.indexOf("</head>");
			
			if (index !== -1)
			{
				data = data.slice(index + 7);
			}
			
			
			if (DEBUG)
			{
				let newHtml = Page.Components.decode(`<div class="page" style="${Site.showingPresentation ? "display: none; " : ""}opacity: 0">\n${data}</div>`);
				
				newHtml = newHtml.slice(newHtml.indexOf("<body>") + 6, newHtml.indexOf("</body>"));
				
				document.body.firstElementChild.insertAdjacentHTML("beforebegin", newHtml);
			}
			
			else
			{
				data = data.slice(data.indexOf("<body>") + 6, data.indexOf("</body>"));
				
				document.body.firstElementChild.insertAdjacentHTML("beforebegin", `<div class="page" style="${Site.showingPresentation ? "display: none; " : ""}opacity: 0">${data}</div>`);
			}
			
			Page.load();
			
			
			
			let displayUrl = url;
			
			if (DEBUG)
			{
				displayUrl = `/index-testing.html?page=${encodeURIComponent(url)}`;
			}
			
			//Record the page change in the url bar and in the browser history.
			if (!noStatePush)
			{
				history.pushState({url: url}, document.title, displayUrl);
			}
			
			else
			{
				history.replaceState({url: url}, document.title, displayUrl);
			}
			
			
			
			//Restore the ability to scroll in case it was removed.
			document.documentElement.style.overflowY = "visible";
			document.body.style.overflowY = "visible";
			
			document.body.style.userSelect = "auto";
			document.body.style.WebkitUserSelect = "auto";
			
			
			
			if (restoreScroll)
			{
				window.scrollTo(0, this.lastPageScroll);
				Page.Banner.onScroll(this.lastPageScroll);
			}
			
			else
			{
				window.scrollTo(0, 0);
				Page.scroll = 0;
			}
			
			this.lastPageScroll = temp;
		})
		
		
		
		.catch((error) =>
		{
			console.error(error.message);
			
			console.log("Failed to load new page -- reversing fade-out.");
			
			
			
			this.currentlyChangingPage = false;
			
			setTimeout(() =>
			{
				if (!Page.backgroundColorChanged)
				{
					Page.Animate.changeOpacity(document.body, 1, Site.opacityAnimationTime);
				}
				
				
				
				else
				{
					setTimeout(() =>
					{
						document.documentElement.classList.add("background-transition");
						document.body.classList.add("background-transition");
						
						document.documentElement.style.backgroundColor = backgroundColor;
						document.body.style.backgroundColor = backgroundColor;
						
						setTimeout(() =>
						{
							document.documentElement.classList.remove("background-transition");
							document.body.classList.remove("background-transition");
							
							document.body.style.backgroundColor = "";
							
							setTimeout(() =>
							{
								Page.Animate.changeOpacity(document.body, 1, Site.opacityAnimationTime);
							}, Site.opacityAnimationTime);
						}, Site.backgroundColorAnimationTime);
					}, Site.backgroundColorAnimationTime);
				}
			}, Site.opacityAnimationTime);
		});
	},
	
	
	
	//Figures out what type of transition to use to get to this url. Returns 1 for deeper, -1 for shallower, 2 for a sibling to the right, -2 for one to the left, and 0 for anything else.
	getTransitionType: function(url)
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
};



Page.Unload =
{
	fadeOut: function(noFadeOut, url)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (Site.forceDarkThemePages.includes(url) && Site.Settings.urlVars["theme"] !== 1)
			{
				Site.Settings.revertTheme = 0;
				
				Site.Settings.forcedTheme = true;
				
				Site.Settings.toggleTheme(false, true);
			}
			
			
			
			if (noFadeOut)
			{
				Page.element.style.opacity = 0;
				
				resolve();
				return;
			}
			
			
			
			//Fade out the current page's content.
			let promise = null;
			
			if (Page.Navigation.transitionType === 1)
			{
				promise = Page.Animate.fadeUpOut(Page.element, Site.pageAnimationTime);
				
				if (Page.bannerElement !== null)
				{
					promise = Page.Animate.fadeUpOut(Page.bannerElement, Site.pageAnimationTime * 2);
				}
			}
			
			else if (Page.Navigation.transitionType === -1)
			{
				promise = Page.Animate.fadeDownOut(Page.element, Site.pageAnimationTime);
				
				if (Page.bannerElement !== null)
				{
					promise = Page.Animate.fadeDownOut(Page.bannerElement, Site.pageAnimationTime * 2);
				}
			}
			
			else if (Page.Navigation.transitionType === 2)
			{
				promise = Page.Animate.fadeLeftOut(Page.element, Site.pageAnimationTime);
				
				if (Page.bannerElement !== null)
				{
					promise = Page.Animate.fadeLeftOut(Page.bannerElement, Site.pageAnimationTime * 2);
				}
			}
			
			else if (Page.Navigation.transitionType === -2)
			{
				promise = Page.Animate.fadeRightOut(Page.element, Site.pageAnimationTime);
				
				if (Page.bannerElement !== null)
				{
					promise = Page.Animate.fadeRightOut(Page.bannerElement, Site.pageAnimationTime * 2);
				}
			}
			
			else
			{
				promise = Page.Animate.fadeOut(Page.element, Site.pageAnimationTime);
				
				if (Page.bannerElement !== null)
				{
					promise = Page.Animate.fadeOut(Page.bannerElement, Site.pageAnimationTime * 2);
				}
			}
			
			await promise;
				
				
				
			//If necessary, take the time to fade back to the default background color, whatever that is.
			if (Page.backgroundColorChanged)
			{
				document.documentElement.classList.add("background-transition");
				document.body.classList.add("background-transition");
				
				if (Site.Settings.urlVars["theme"] === 1)
				{
					if (Site.Settings.urlVars["darkThemeColor"] === 1)
					{
						document.documentElement.style.backgroundColor = "rgb(0, 0, 0)";
						document.body.style.backgroundColor = "rgb(0, 0, 0)";
						
						anime({
							targets: Site.Settings.metaThemeColorElement,
							content: "#000000",
							duration: 500,
							easing: "cubicBezier(.42, 0, .58, 1)"
						});
					}
					
					else
					{
						document.documentElement.style.backgroundColor = "rgb(24, 24, 24)";
						document.body.style.backgroundColor = "rgb(24, 24, 24)";
						
						anime({
							targets: Site.Settings.metaThemeColorElement,
							content: "#181818",
							duration: 500,
							easing: "cubicBezier(.42, 0, .58, 1)"
						});
					}
				}
				
				else
				{
					document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
					document.body.style.backgroundColor = "rgb(255, 255, 255)";
					
					anime({
						targets: Site.Settings.metaThemeColorElement,
						content: "#ffffff",
						duration: 500,
						easing: "cubicBezier(.42, 0, .58, 1)"
					});
				}
				
				setTimeout(() =>
				{
					document.body.style.backgroundColor = "";
					
					document.documentElement.classList.remove("background-transition");
					document.body.classList.remove("background-transition");
				}, Site.backgroundColorAnimationTime);
			}
			
			resolve();
		});
	}
};



Page.unload = function()
{
	//Remove JS so it's not executed twice.
	document.querySelectorAll("script, style.temporary-style, link.temporary-style").forEach(element => element.remove());
	
	
	
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
	
	
	
	Page.currentApplets.forEach(applet => applet.destroy());
	
	Page.currentApplets = [];
	
	
	
	//Remove everything that's not a script from the page element.
	Page.element.remove();
}