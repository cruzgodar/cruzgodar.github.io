"use strict";



Page.bannerElement = null;
Page.contentElement = null;



Page.Banner =
{
	doneLoading: false,

	fileName: "",
	filePath: "",
	
	opacity: 1,
	
	maxScroll: null,
	
	
	bannerPages:
	[
		"/home/",
		
		"/about/",
		
		"/writing/mist/",
		"/writing/desolation-point/"
	],

	multibannerPages:
	{
		"/home/":
		{
			"currentBanner": Math.floor(Math.random() * 11) + 1,
			"numBanners": 11
		}
	},

	//Filled in with pages when banners are preloaded so the console isn't spammed and caches aren't needlessly checked.
	pagesAlreadyFetched: [],
	
	otherSizePagesAlreadyFetched: [],



	load: function(large = false)
	{
		return new Promise((resolve, reject) =>
		{
			//Only do banner things if the banner things are in the standard places.
			if (!(this.bannerPages.includes(Page.url)))
			{
				resolve();
			}
			
			
			
			else
			{
				this.fileName = `${large ? "large." : "small."}${Page.Images.fileExtension}`;
				
					
				
				this.filePath = Page.parentFolder + "banners/";
				
				if (this.multibannerPages.hasOwnProperty(Page.url))
				{
					this.filePath += this.multibannerPages[Page.url]["currentBanner"] + "/";
				}
				
				
				
				//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we remove the banner entirely.
				fetch(this.filePath + this.fileName)
				
				.then((response) =>
				{
					const img = new Image();
					
					img.onload = () =>
					{
						img.remove();
						
						if (!large)
						{
							this.ScrollButton.timeoutId = setTimeout(() =>
							{
								this.ScrollButton.insert();
							}, 2000);
						}
						
						resolve();
					};
					
					img.style.display = "hidden";
					img.style.opacity = 0;
					
					Page.element.appendChild(img);
					
					setTimeout(() =>
					{
						img.src = this.filePath + this.fileName;
					}, 20);
				})
				
				.catch((error) =>
				{
					$("#banner").remove();
					$("#banner-cover").remove();
					
					
					
					//We resolve here because the page can still be loaded without the banner.
					resolve();
				});
			}
		});
	},

	
	
	lastScrollTimestamp: -1,

	onScroll: function(scrollPositionOverride)
	{
		if (scrollPositionOverride === 0)
		{
			Page.scroll = window.scrollY;
		}
		
		else
		{
			Page.scroll = scrollPositionOverride;
			this.doneLoading = false;
			this.ScrollButton.doneLoading = false;
		}
		
		window.requestAnimationFrame(this.scrollAnimationFrame);
	},
		
	scrollAnimationFrame: function(timestamp)
	{
		const timeElapsed = timestamp - Page.Banner.lastScrollTimestamp;
		
		Page.Banner.lastScrollTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		Page.Banner.scrollHandler();
	},
	
	scrollHandler: function()
	{
		if (Page.scroll <= this.maxScroll)
		{
			this.opacity = Math.min(Math.max(1 - Page.scroll / this.maxScroll, 0), 1);
			
			try
			{
				Page.bannerElement.style.opacity = this.opacity;
				Page.contentElement.style.opacity = 1 - this.opacity;
			}
			
			catch(ex) {}
			
			if (this.opacity === 0)
			{
				this.doneLoading = true;
			}
			
			else
			{
				this.doneLoading = false;
			}
		}
		
		else if (!this.doneLoading)
		{
			this.opacity = 0;
			
			try 
			{
				Page.bannerElement.style.opacity = 0;
				Page.contentElement.style.opacity = 1;
			}
			
			catch(ex) {}
			
			this.doneLoading = true;
		}
		
		
		
		if (Page.scroll <= this.maxScroll / 2.5)
		{
			const opacity = Math.min(Math.max(1 - Page.scroll / (this.maxScroll / 2.5), 0), 1);
			
			if (this.ScrollButton.exists)
			{
				try {$("#scroll-button").style.opacity = opacity;}
				catch(ex) {}
			}
			
			
			
			try
			{
				$("#cruz-text").parentNode.style.opacity = opacity;
				$("#godar-text").parentNode.style.opacity = opacity;
			}
			
			catch(ex) {}
			
			
			
			if (opacity === 0)
			{
				this.ScrollButton.doneLoading = true;
			}
			
			else
			{
				this.ScrollButton.doneLoading = false;
			}
		}
		
		
		
		else if (this.ScrollButton.doneLoading === false)
		{
			try
			{
				$("#cruz-text").parentNode.style.opacity = 0;
				$("#godar-text").parentNode.style.opacity = 0;
			}
			
			catch(ex) {}
			
			try {$("#scroll-button").style.opacity = 0}
			catch(ex) {}
			
			this.ScrollButton.doneLoading = true;
		}
		
		else
		{
			try {document.querySelector("#scroll-button").remove();}
			catch(ex) {}
		}
	},



	//For every banner page linked to by the current page, this fetches that banner so that the waiting time between pages is minimized.
	fetchOtherPageBannersInBackground: function()
	{
		$$("a").forEach(link =>
		{
			const href = link.getAttribute("href");
			
			if (this.bannerPages.includes(href) && !(this.pagesAlreadyFetched.includes(href)))
			{
				this.pagesAlreadyFetched.push(href);
				
				let filePath = href.slice(0, href.lastIndexOf("/") + 1) + "banners/";
				
				if (this.multibannerPages.hasOwnProperty(href))
				{
					filePath += (this.multibannerPages[href]["currentBanner"] + 1) + "/";
				}
				
				filePath += `small.${Page.Images.fileExtension}`;
			}
		});
	},


	
	ScrollButton:
	{
		doneLoading: false,
		
		exists: false,

		timeoutId: null,
		
		
		
		insert: function()
		{
			if (Page.scroll > Page.Banner.maxScroll / 2.5)
			{
				return;
			}
			
			
			
			const opacity = Math.min(Math.max(1 - Page.scroll / (Page.Banner.maxScroll / 2.5), 0), 1);
			
			let chevronName = "chevron-down";
			
			if (Site.Settings.urlVars["contrast"] === 1)
			{
				chevronName += "-dark";
			}
			
			
			
			//Gotta have a try block here in case the user loads a banner page then navigates to a non-banner page within 3 seconds.
			try
			{
				document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
					<div id="new-banner-cover" data-aos="fade-down">
						<input type="image" id="scroll-button" src="/graphics/general-icons/${chevronName}.png" style="opacity: 0" alt="Scroll down" onclick="Page.Banner.ScrollButton.animateTo(document.querySelector('#scroll-to'))">
					</div>
				`);
				
				setTimeout(() =>
				{
					$("#new-banner-cover").style.opacity = 0;
					$("#new-banner-cover").style.transform = "translateY(-100px)";
					
					anime({
						targets: $("#new-banner-cover"),
						opacity: 1,
						translateY: 0,
						duration: Site.opacityAnimationTime * 4,
						easing: "easeOutCubic"
					});
					
					anime({
						targets: $("#scroll-button"),
						opacity: opacity,
						translateY: 0,
						duration: Site.opacityAnimationTime * 4,
						easing: "easeOutCubic"
					});
					
					
					
					setTimeout(() => this.exists = true, Site.opacityAnimationTime * 4);
					
					try {Page.Load.HoverEvents.addWithScale(document.querySelector("#scroll-button"), 1.1);}
					catch(ex) {}
				}, 100);
				
				document.querySelector("#banner-cover").remove();
			}
			
			catch(ex) {}
		},



		animateTo: function(targetElement)
		{
			targetElement.scrollIntoView({behavior: "smooth"});
		}
	}
};