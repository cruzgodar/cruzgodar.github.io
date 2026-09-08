import { changeOpacity } from "./animation.js";
import { headerElement } from "./header.js";
import { likelyWindowChromeHeight, pageWidth, viewportHeight } from "./layout.js";
import {
	$,
	addStyle,
	pageUrl
} from "./main.js";
import { siteSettings } from "./settings.js";
import { animate, clamp } from "./utils.js";

export let bannerElement;

export let contentElement;



let bannerMaxScroll;

export function setBannerMaxScroll(newBannerMaxScroll)
{
	bannerMaxScroll = newBannerMaxScroll;
}



export let nameTextOpacity = 1;

// startBannerLoop() is the only way into the loop, and it no-ops while one is
// already running. Keeping exactly one loop used to be done by comparing frame
// timestamps instead, which was subtly wrong: a call arriving in a frame that
// another call had already claimed returned *without* rescheduling. loadBanner
// is called twice per navigation, so whenever those landed in the same frame --
// a warm cache, or a backgrounded tab releasing its queued callbacks at once --
// both bailed and the loop never started, leaving the banner stuck at full
// opacity and the content unexpanded for the life of the page.
let bannerLoopRunning = false;

let lastT = 0;

function easeInOutQuad(x)
{
	return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function startBannerLoop()
{
	if (bannerLoopRunning)
	{
		return;
	}

	bannerLoopRunning = true;

	requestAnimationFrame(updateBanner);
}

function updateBanner()
{
	// The banner is gone because we've navigated to a page without one, so let
	// the loop stop. The next loadBanner() starts it back up.
	if (!bannerElement || !contentElement)
	{
		bannerLoopRunning = false;

		return;
	}

	if (!bannerMaxScroll)
	{
		requestAnimationFrame(updateBanner);
		return;
	}

	const minPadding = window.innerWidth <= 500 ? 8 : 16;

	const additionalPadding = Math.min(
		Math.max(
			(window.innerWidth - pageWidth - minPadding * 2) / 2,
			minPadding
		),
		16
	);

	// This denominator accounts for the total distance the content needs to scroll
	// and the header's height.
	const t0 = clamp(window.scrollY / bannerMaxScroll * 1.3, 0, 1);
	const t = easeInOutQuad(t0);



	if (siteSettings.reduceMotion)
	{
		const maxPadding = minPadding + additionalPadding;

		contentElement.style.paddingLeft = `${maxPadding}px`;
		contentElement.style.paddingRight = `${maxPadding}px`;
		contentElement.style.paddingTop = `${maxPadding}px`;

		contentElement.parentElement.style.marginLeft = `-${maxPadding}px`;
		contentElement.parentElement.style.marginRight = `-${maxPadding}px`;

		if (t >= .8 && lastT < .8)
		{
			animate((t) =>
			{
				bannerElement.style.opacity = 1 - t;
				nameTextOpacity = 1 - t;
				contentElement.style.boxShadow = `0px 0px 16px 4px rgba(0, 0, 0, ${(1 - t) * .35})`;
			}, 300, "easeInOutSine");
		}

		else if (t < .8 && lastT >= .8)
		{
			animate((t) =>
			{
				bannerElement.style.opacity = t;
				nameTextOpacity = t;
				contentElement.style.boxShadow = `0px 0px 16px 4px rgba(0, 0, 0, ${(t) * .35})`;
			}, 300, "easeInOutSine");
		}
	}

	

	else
	{
		contentElement.style.paddingLeft = `${minPadding + t * additionalPadding}px`;
		contentElement.style.paddingRight = `${minPadding + t * additionalPadding}px`;
		contentElement.style.paddingTop = `${minPadding + t * minPadding}px`;

		contentElement.parentElement.style.marginLeft = `-${minPadding + additionalPadding * t}px`;
		contentElement.parentElement.style.marginRight = `-${minPadding + additionalPadding * t}px`;

		contentElement.style.boxShadow = `0px 0px 16px 4px rgba(0, 0, 0, ${(1 - t) * .35})`;

		bannerElement.style.opacity = 1 - t;
		nameTextOpacity = 1 - Math.min(t * 1.5, 1);
	}



	if (contentElement.offsetHeight < viewportHeight - headerElement.offsetHeight - 32)
	{
		contentElement.parentElement.style.marginBottom =
			`${(viewportHeight - headerElement.offsetHeight - contentElement.offsetHeight) / 2}px`;

		// setTimeout(() => onResize(), 16);
	}

	else
	{
		contentElement.parentElement.style.marginBottom = 0;
	}



	lastT = t;

	requestAnimationFrame(updateBanner);
}



let bannerFilename = "";
let bannerFilepath = "";

export const bannerPages =
[
	"/home",

	"/about",

	"/writing/mist",
	"/writing/desolation-point",

	"/debug/htmdl-test"
];

export const multibannerPages =
{
	"/home":
	{
		currentBanner: Math.floor(Math.random() * 12) + 1,
		numBanners: 12
	}
};



function setBannerFilepath(url, large = false)
{
	bannerFilename = `${large ? "large" : "small"}.webp`;
	bannerFilepath = url + "/banners/";

	if (url in multibannerPages)
	{
		bannerFilepath += multibannerPages[url].currentBanner + "/";
	}
}

function loadBannerImage()
{
	return new Promise(resolve =>
	{
		const imageLoadElement = document.createElement("img");
		imageLoadElement.onload = () =>
		{
			resolve();
		};

		setTimeout(() => imageLoadElement.src = bannerFilepath + bannerFilename, 0);
	});
}



export async function preloadBanner(url)
{
	if (!(bannerPages.includes(url)))
	{
		return;
	}

	setBannerFilepath(url);

	await loadBannerImage();
}



async function loadBanner({
	url,
	large = false
}) {
	// Only do banner things if the banner things are in the standard places.
	if (!(bannerPages.includes(url)))
	{
		bannerElement = null;
		contentElement = null;

		return;
	}

	bannerElement = $("#banner");
	contentElement = $("#content");

	if (contentElement?.parentElement)
	{
		contentElement.parentElement.style.marginTop
			= `calc(100vh - ${likelyWindowChromeHeight + 40}px)`;
	}

	setBannerFilepath(url, large);

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

	startBannerLoop();

	await loadBannerImage();
}



// The function called by pageLoad to load a small banner that fades into a large one when ready.
export function initBanner()
{
	// This page has no banner, so drop the outgoing page's elements -- they've
	// just been removed from the dom -- and let the loop stop. This has to
	// happen here rather than at the start of the transition: fadeOutPage still
	// needs bannerElement to fade the outgoing banner, and the error path in
	// redirect() needs it to fade that banner back in if the swap throws.
	if (!bannerPages.includes(pageUrl))
	{
		bannerElement = null;
		contentElement = null;

		return;
	}

	loadBanner({ url: pageUrl, large: true })
		.then(() =>
		{
			changeOpacity({
				element: $("#banner-small"),
				opacity: 0,
				duration: 700
			})
				.then(() => $("#banner-small").remove());
		});
}