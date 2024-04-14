import { changeOpacity } from "./animation.js";
import {
	$,
	addStyle,
	pageElement,
	pageUrl
} from "./main.js";

export let bannerElement;

export function setBannerElement(newBannerElement)
{
	bannerElement = newBannerElement;
}



export let contentElement;

export function setContentElement(newContentElement)
{
	contentElement = newContentElement;
}



export let bannerMaxScroll;

export function setBannerMaxScroll(newBannerMaxScroll)
{
	bannerMaxScroll = newBannerMaxScroll;
}



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