import anime from "../anime.js";
import { changeOpacity } from "./animation.js";
import { headerElement } from "./header.js";
import { onResize, pageWidth, viewportHeight } from "./layout.js";
import {
	$,
	addStyle,
	pageUrl
} from "./main.js";
import { siteSettings } from "./settings.js";

export let bannerElement;

export let contentElement;



let bannerMaxScroll;

export function setBannerMaxScroll(newBannerMaxScroll)
{
	bannerMaxScroll = newBannerMaxScroll;
}



export let nameTextOpacity = 1;

let lastBannerChangeTimestamp = -1;

let lastT = 0;

function easeInOutQuad(x)
{
	return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function updateBanner(timestamp)
{
	if (
		!bannerElement
		|| !contentElement
		|| timestamp === lastBannerChangeTimestamp
		|| lastBannerChangeTimestamp === -1
	) {
		lastBannerChangeTimestamp = timestamp;

		requestAnimationFrame(updateBanner);

		return;
	}

	lastBannerChangeTimestamp = timestamp;

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
	const t0 = Math.min(Math.max(window.scrollY / bannerMaxScroll * 1.3, 0), 1);
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
			const dummy = { t: 0 };

			anime({
				targets: dummy,
				t: 1,
				duration: 300,
				easing: "easeInOutSine",
				update: () =>
				{
					bannerElement.style.opacity = 1 - dummy.t;
					nameTextOpacity = 1 - dummy.t;
					contentElement.style.boxShadow = `0px 0px 16px 4px rgba(0, 0, 0, ${(1 - dummy.t) * .35})`;
				}
			});
		}

		else if (t < .8 && lastT >= .8)
		{
			const dummy = { t: 0 };

			anime({
				targets: dummy,
				t: 1,
				duration: 300,
				easing: "easeInOutSine",
				update: () =>
				{
					bannerElement.style.opacity = dummy.t;
					nameTextOpacity = dummy.t;
					contentElement.style.boxShadow = `0px 0px 16px 4px rgba(0, 0, 0, ${(dummy.t) * .35})`;
				}
			});
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

		setTimeout(() => onResize(), 16);
	}

	else
	{
		contentElement.parentElement.style.marginBottom = 0;
	}



	lastT = t;

	requestAnimationFrame(updateBanner);
}

requestAnimationFrame(updateBanner);



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
		currentBanner: Math.floor(Math.random() * 10) + 1,
		numBanners: 10
	}
};



export async function loadBanner({
	url,
	large = false
}) {
	// Only do banner things if the banner things are in the standard places.
	if (!(bannerPages.includes(url)))
	{
		return;
	}

	bannerElement = $("#banner");
	contentElement = $("#content");

	// contentElement.parentElement.style.marginTop
	// = `calc(100vh - ${likelyWindowChromeHeight + 40}px)`;

	bannerFilename = `${large ? "large" : "small"}.webp`;
	bannerFilepath = url + "banners/";

	if (url in multibannerPages)
	{
		bannerFilepath += multibannerPages[url].currentBanner + "/";
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

	await new Promise(resolve =>
	{
		const imageLoadElement = document.createElement("img");
		imageLoadElement.onload = () =>
		{
			resolve();
		};

		setTimeout(() => imageLoadElement.src = bannerFilepath + bannerFilename, 0);
	});
}



// The function called by pageLoad to load a small banner that fades into a large one when ready.
export function initBanner()
{
	if (bannerPages.includes(pageUrl))
	{
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
}