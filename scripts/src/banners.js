import { changeOpacity } from "./animation.js";
import { headerElement } from "./header.js";
import {
	$,
	addStyle,
	pageElement,
	pageUrl
} from "./main.js";

export let bannerElement;

export let contentElement;

let bannerMaxScroll;

export function setBannerMaxScroll(newBannerMaxScroll)
{
	bannerMaxScroll = newBannerMaxScroll;
}

export let nameTextOpacity = 1;

let lastBannerChangeTimestamp = -1;

export function updateBanner(timestamp)
{
	if (
		!bannerElement
		|| !contentElement
		|| timestamp === lastBannerChangeTimestamp
		|| lastBannerChangeTimestamp === -1
	) {
		lastBannerChangeTimestamp = timestamp;

		window.requestAnimationFrame(updateBanner);

		return;
	}

	lastBannerChangeTimestamp = timestamp;

	// This denominator accounts for the total distance the content needs to scroll
	// and the header's height.
	let t = Math.min(Math.max(window.scrollY / bannerMaxScroll, 0), 1);

	nameTextOpacity = 1 - Math.min(t * 1.5, 1);

	// If the screen is narrow enough for it not to be jarring,
	// we'll fade out the banner and zoom in the content element to fit
	// the window width.
	if (window.innerWidth <= 1200)
	{
		// This speeds up and smooths out the animation.
		t = Math.sqrt(Math.min(t, 1));

		const fullPadding = Math.max((window.innerWidth - 932) / 2, 16);
		
		contentElement.style.borderRadius = `${16 * (1 - t)}px`;

		contentElement.style.paddingLeft = `${16 + t * fullPadding}px`;
		contentElement.style.paddingRight = `${16 + t * fullPadding}px`;
		contentElement.style.paddingTop = `${16 + t * 16}px`;

		contentElement.parentElement.style.marginLeft = `-${16 * t}px`;
		contentElement.parentElement.style.marginRight = `-${16 * t}px`;
		contentElement.parentElement.style.marginBottom = 0;

		bannerElement.style.opacity = 1 - t;
	}

	else
	{
		// This speeds up and smooths out the animation.
		t = Math.sqrt(Math.min(t * 1.25, 1));

		// If the entire content element fits on screen,
		// then we'll just let it scroll normally and just expand its padding a little.
		contentElement.style.borderRadius = "16px";

		contentElement.style.padding = `${16 + t * 16}px`;

		contentElement.parentElement.style.marginLeft = 0;
		contentElement.parentElement.style.marginRight = 0;

		if (contentElement.offsetHeight < window.innerHeight - headerElement.offsetHeight - 32)
		{
			contentElement.parentElement.style.marginBottom =
				`${(window.innerHeight - headerElement.offsetHeight - contentElement.offsetHeight) / 2}px`;

			bannerElement.style.opacity = 1;
		}

		else
		{
			bannerElement.style.opacity = 1 - t;

			contentElement.parentElement.style.marginBottom = 0;
		}
	}

	window.requestAnimationFrame(updateBanner);
}

window.requestAnimationFrame(updateBanner);



let bannerFilename = "";
let bannerFilepath = "";

export const bannerPages =
[
	"/home/",

	"/about/",

	"/writing/mist/",
	"/writing/desolation-point/",

	"/debug/htmdl-test/"
];

export const multibannerPages =
{
	"/home/":
	{
		currentBanner: Math.floor(Math.random() * 11) + 1,
		numBanners: 11
	}
};



export async function loadBanner(large = false)
{
	// Only do banner things if the banner things are in the standard places.
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



// The function called by pageLoad to load a small banner that fades into a large one when ready.
export function setUpBanner()
{
	if (bannerPages.includes(pageUrl))
	{
		loadBanner(true)
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

	else
	{
		bannerElement;
	}
}