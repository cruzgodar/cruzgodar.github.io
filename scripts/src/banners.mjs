export let bannerElement = null;

export function setBannerElement(newBannerElement)
{
	bannerElement = newBannerElement;
}



export let contentElement = null;

export function setContentElement(newContentElement)
{
	contentElement = newContentElement;
}



export let bannerDoneLoading = false;

export function setBannerDoneLoading(newBannerDoneLoading)
{
	bannerDoneLoading = newBannerDoneLoading;
}



let bannerOpacity = 1;

export function setBannerOpacity(newBannerOpacity)
{
	bannerOpacity = newBannerOpacity;
	
	try
	{
		bannerElement.style.opacity = bannerOpacity;
		contentElement.style.opacity = 1 - bannerOpacity;
	}
	
	catch(ex) {}
	
	if (bannerOpacity)
	{
		bannerDoneLoading = false;
	}
	
	else
	{
		bannerDoneLoading = true;
	}
}



export let bannerMaxScroll = null;

export function setBannerMaxScroll(newBannerMaxScroll)
{
	bannerMaxScroll = newBannerMaxScroll;
}



let bannerFilename = "";
let bannerFilepath = "";

let lastScrollTimestamp = -1;

export const bannerPages =
[
	"/home/",
	
	"/about/",
	
	"/writing/mist/",
	"/writing/desolation-point/"
];

export const multibannerPages =
{
	"/home/":
	{
		"currentBanner": Math.floor(Math.random() * 11) + 1,
		"numBanners": 11
	}
};

//Filled in with pages when banners are preloaded so the console isn't spammed and caches aren't needlessly checked.
const pagesAlreadyFetched = [];

const otherSizePagesAlreadyFetched = [];

let scrollButtonExists = false;

let scrollButtonTimeoutId = null;



let scrollButtonDoneLoading = false;

export function setScrollButtonDoneLoading(newScrollButtonDoneLoading)
{
	scrollButtonDoneLoading = newScrollButtonDoneLoading;
}



export function loadBanner(large = false)
{
	return new Promise((resolve, reject) =>
	{
		//Only do banner things if the banner things are in the standard places.
		if (!(bannerPages.includes(Page.url)))
		{
			resolve();
		}
		
		bannerElement = $("#banner");
		contentElement = $("#content");
		
		bannerFilename = `${large ? "large." : "small."}${Page.Images.fileExtension}`;
		
		bannerFilepath = Page.parentFolder + "banners/";
		
		if (multibannerPages.hasOwnProperty(Page.url))
		{
			bannerFilepath += multibannerPages[Page.url].currentBanner + "/";
		}
		
		
		
		Site.addStyle(`
			#banner-small
			{
				background: url(${bannerFilepath}small.${Page.Images.fileExtension}) no-repeat center center;
				background-size: cover;
			}
			
			#banner-large
			{
				background: url(${bannerFilepath}large.${Page.Images.fileExtension}) no-repeat center center;
				background-size: cover;
			}
		`);
		
		
		
		//Fetch the banner file. If that works, great! Set the background and fade in the page. If not, that means the html was cached but the banner was not (this is common on the homepage). In that case, we need to abort, so we remove the banner entirely.
		fetch(bannerFilepath + bannerFilename)
		
		.then((response) =>
		{
			const img = new Image();
			
			img.onload = () =>
			{
				img.remove();
				
				if (!large)
				{
					scrollButtonTimeoutId = setTimeout(() =>
					{
						insertScrollButton();
					}, 2000);
				}
				
				resolve();
			};
			
			img.style.display = "hidden";
			img.style.opacity = 0;
			
			Page.element.appendChild(img);
			
			setTimeout(() =>
			{
				img.src = bannerFilepath + bannerFilename;
			}, 20);
		})
		
		.catch((error) =>
		{
			$("#banner").remove();
			$("#banner-cover").remove();
			
			resolve();
		});
	});
}



export function bannerOnScroll(scrollPositionOverride)
{
	if (scrollPositionOverride === 0)
	{
		Page.scroll = window.scrollY;
	}
	
	else
	{
		Page.scroll = scrollPositionOverride;
		bannerDoneLoading = false;
		scrollButtonDoneLoading = false;
	}
	
	window.requestAnimationFrame(scrollAnimationFrame);
}
		
function scrollAnimationFrame(timestamp)
{
	const timeElapsed = timestamp - lastScrollTimestamp;
	
	lastScrollTimestamp = timestamp;
	
	if (timeElapsed === 0)
	{
		return;
	}
	
	scrollHandler();
}

function scrollHandler()
{
	if (Page.scroll <= bannerMaxScroll)
	{
		bannerOpacity = Math.min(Math.max(1 - Page.scroll / bannerMaxScroll, 0), 1);
		
		try
		{
			bannerElement.style.opacity = bannerOpacity;
			contentElement.style.opacity = 1 - bannerOpacity;
		}
		
		catch(ex) {}
		
		if (bannerOpacity === 0)
		{
			bannerDoneLoading = true;
		}
		
		else
		{
			bannerDoneLoading = false;
		}
	}
	
	else if (!bannerDoneLoading)
	{
		bannerOpacity = 0;
		
		try 
		{
			bannerElement.style.opacity = 0;
			contentElement.style.opacity = 1;
		}
		
		catch(ex) {}
		
		bannerDoneLoading = true;
	}
	
	
	
	if (Page.scroll <= bannerMaxScroll / 2.5)
	{
		const scrollButtonOpacity = Math.min(Math.max(1 - Page.scroll / (bannerMaxScroll / 2.5), 0), 1);
		
		if (scrollButtonExists)
		{
			try {$("#scroll-button").style.opacity = scrollButtonOpacity;}
			catch(ex) {}
		}
		
		
		
		try
		{
			$("#cruz-text").parentNode.style.opacity = scrollButtonOpacity;
			$("#godar-text").parentNode.style.opacity = scrollButtonOpacity;
		}
		
		catch(ex) {}
		
		
		
		if (scrollButtonOpacity === 0)
		{
			scrollButtonDoneLoading = true;
		}
		
		else
		{
			scrollButtonDoneLoading = false;
		}
	}
	
	else if (!scrollButtonDoneLoading)
	{
		try
		{
			$("#cruz-text").parentNode.style.opacity = 0;
			$("#godar-text").parentNode.style.opacity = 0;
		}
		
		catch(ex) {}
		
		try {$("#scroll-button").style.opacity = 0}
		catch(ex) {}
		
		scrollButtonDoneLoading = true;
	}
	
	else
	{
		try {document.querySelector("#scroll-button").remove();}
		catch(ex) {}
	}
}



//For every banner page linked to by the current page, this fetches that banner so that the waiting time between pages is minimized.
export function fetchOtherPageBannersInBackground()
{
	$$("a").forEach(link =>
	{
		const href = link.getAttribute("href");
		
		if (bannerPages.includes(href) && !pagesAlreadyFetched.includes(href))
		{
			pagesAlreadyFetched.push(href);
			
			let bannerFilepath = href.slice(0, href.lastIndexOf("/") + 1) + "banners/";
			
			if (multibannerPages.hasOwnProperty(href))
			{
				bannerFilepath += (multibannerPages[href]["currentBanner"] + 1) + "/";
			}
			
			bannerFilepath += `small.${Page.Images.fileExtension}`;
		}
	});
}



export function insertScrollButton()
{
	if (Page.scroll > bannerMaxScroll / 2.5)
	{
		return;
	}
	
	
	
	const opacity = Math.min(Math.max(1 - Page.scroll / (bannerMaxScroll / 2.5), 0), 1);
	
	let chevronName = "chevron-down";
	
	if (Site.Settings.urlVars["contrast"] === 1)
	{
		chevronName += "-dark";
	}
	
	
	
	//Gotta have a try block here in case the user loads a banner page then navigates to a non-banner page within 3 seconds.
	try
	{
		document.querySelector("#banner-cover").insertAdjacentHTML("beforebegin", `
			<div id="new-banner-cover">
				<input type="image" id="scroll-button" src="/graphics/general-icons/${chevronName}.png" style="opacity: 0" alt="Scroll down">
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
				opacity,
				translateY: 0,
				duration: Site.opacityAnimationTime * 4,
				easing: "easeOutCubic"
			});
			
			
			
			setTimeout(() => scrollButtonExists = true, Site.opacityAnimationTime * 4);
			
			try {Page.Load.HoverEvents.addWithScale(document.querySelector("#scroll-button"), 1.1);}
			catch(ex) {}
		}, 100);
		
		document.querySelector("#banner-cover").remove();
	}
	
	catch(ex) {}
}

export function setScrollButtonExists(newScrollButtonExists)
{
	scrollButtonExists = newScrollButtonExists;
}