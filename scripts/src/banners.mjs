import { changeOpacity, opacityAnimationTime } from "./animation.mjs";
import { $, addStyle, pageElement, pageScroll, pageUrl, setPageScroll } from "./main.mjs";
import anime from "/scripts/anime.js";

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



//The banner opacity cannot be changed more than a certain amount each frame
//to account for sudden changes in viewport height. This function handles that animation.

export let bannerOpacity = 1;

let bannerOpacityChange = 0;

const maxSingleFrameChange = .05;

export function setBannerOpacity(newBannerOpacity)
{
	bannerOpacityChange += newBannerOpacity - bannerOpacity;

	const singleFrameChange = Math.min(Math.max(
		bannerOpacityChange, -maxSingleFrameChange), maxSingleFrameChange
	);

	bannerOpacity = Math.min(Math.max(bannerOpacity + singleFrameChange, 0), 1);

	if (bannerElement)
	{
		bannerElement.style.opacity = bannerOpacity;
	}

	if (contentElement)
	{
		contentElement.style.opacity = 1 - bannerOpacity;
	}

	bannerOpacityChange -= singleFrameChange;

	if (Math.abs(bannerOpacityChange) > .001)
	{
		window.requestAnimationFrame(() => setBannerOpacity(bannerOpacity));
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
		currentBanner: Math.floor(Math.random() * 11) + 1,
		numBanners: 11
	}
};

let scrollButtonElement;

export let scrollButtonOpacity = 0;

export let scrollButtonExists = false;

export function setScrollButtonExists(newScrollButtonExists)
{
	scrollButtonExists = newScrollButtonExists;
}



export async function loadBanner(large = false)
{
	//Only do banner things if the banner things are in the standard places.
	if (!(bannerPages.includes(pageUrl)))
	{
		return;
	}

	bannerElement = $("#banner");
	contentElement = $("#content");

	bannerFilename = `${large ? "large" : "small"}.webp`;

	bannerFilepath = pageUrl + "banners/";

	if (pageUrl in multibannerPages)
	{
		bannerFilepath += multibannerPages[pageUrl].currentBanner + "/";
	}

	addStyle(`
		#banner-small
		{
			background: url(${bannerFilepath}small.webp) no-repeat center center;
			background-size: cover;
		}
		
		#banner-large
		{
			background: url(${bannerFilepath}large.webp) no-repeat center center;
			background-size: cover;
		}
	`);


	
	await fetch(bannerFilepath + bannerFilename);

	const img = new Image();

	const promise = new Promise(resolve =>
	{
		img.onload = () =>
		{
			img.remove();

			if (!large)
			{
				setTimeout(() => insertScrollButton(), 2000);
			}

			resolve();
		};
	});

	img.style.opacity = 0;
	img.style.position = "fixed";
	img.style.top = "-100vh";
	img.style.left = "-100vw";

	pageElement.appendChild(img);

	setTimeout(() =>
	{
		img.src = bannerFilepath + bannerFilename;
	}, 20);

	await promise;
}



//The function called by pageLoad to load a small banner that fades into a large one when ready.
export function setUpBanner()
{
	if (bannerPages.includes(pageUrl))
	{
		loadBanner(true)
			.then(() =>
			{
				changeOpacity($("#banner-small"), 0, 700)
					.then(() => $("#banner-small").remove());
			});
	}

	else
	{
		bannerElement = null;
	}
}



export function bannerOnScroll(scrollPositionOverride)
{
	if (scrollPositionOverride === 0)
	{
		setPageScroll(window.scrollY);
	}

	else
	{
		setPageScroll(scrollPositionOverride);
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
	if (!bannerElement || !contentElement)
	{
		return;
	}

	setBannerOpacity(1 - pageScroll / bannerMaxScroll);

	bannerElement.style.opacity = bannerOpacity;
	contentElement.style.opacity = 1 - bannerOpacity;



	scrollButtonOpacity = Math.min(Math.max(1 - pageScroll / (bannerMaxScroll / 2.5), 0), 1);

	if (scrollButtonExists)
	{
		scrollButtonElement.style.opacity = scrollButtonOpacity;

		if (scrollButtonOpacity === 0)
		{
			scrollButtonExists = false;

			scrollButtonElement.remove();
		}
	}
}



export function insertScrollButton()
{
	if (pageScroll > bannerMaxScroll / 2.5)
	{
		return;
	}

	const bannerCoverElement = document.querySelector("#banner-cover");

	if (!bannerCoverElement)
	{
		return;
	}

	bannerCoverElement.insertAdjacentHTML("beforebegin", `
		<div id="new-banner-cover">
			<input type="image" id="scroll-button" src="/graphics/general-icons/chevron-down.png" style="opacity: 0" alt="Scroll down">
		</div>
	`);

	setTimeout(() =>
	{
		const newBannerCoverElement = $("#new-banner-cover");

		if (!newBannerCoverElement)
		{
			return;
		}

		scrollButtonElement = $("#scroll-button");

		newBannerCoverElement.style.opacity = 0;
		newBannerCoverElement.style.transform = "translateY(-100px)";

		anime({
			targets: newBannerCoverElement,
			opacity: 1,
			translateY: 0,
			duration: opacityAnimationTime * 4,
			easing: "easeOutCubic"
		});

		anime({
			targets: scrollButtonElement,
			opacity: scrollButtonOpacity,
			duration: opacityAnimationTime * 4,
			easing: "easeOutCubic"
		});

		setTimeout(() => scrollButtonExists = true, opacityAnimationTime * 4);
	}, 100);

	document.querySelector("#banner-cover").remove();
}