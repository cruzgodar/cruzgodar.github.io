import anime from "../anime.js";
import { changeOpacity } from "./animation.js";
import { headerElement } from "./header.js";
import { likelyWindowChromeHeight, onResize, pageWidth, viewportHeight } from "./layout.js";
import {
	$,
	addStyle,
	asyncFetch,
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

let lastT = 0;



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
	const t0 = Math.min(Math.max(window.scrollY / bannerMaxScroll * 1.35, 0), 1);

	const t = 0.5 + 0.5 * Math.sin(Math.PI * (Math.pow(t0, 0.5) - 0.5));



	if (window.reduceMotion)
	{
		contentElement.style.paddingLeft = `${minPadding}px`;
		contentElement.style.paddingRight = `${minPadding}px`;
		contentElement.style.paddingTop = `${minPadding}px`;

		contentElement.parentElement.style.marginLeft = 0;
		contentElement.parentElement.style.marginRight = 0;

		if (t >= 1 && lastT < 1)
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
				}
			});
		}

		else if (t < 1 && lastT >= 1)
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

	contentElement.style.boxShadow = `0px 0px 16px 4px rgba(0, 0, 0, ${(1 - t) * .35})`;



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



export async function loadBanner(large = false)
{
	// Only do banner things if the banner things are in the standard places.
	if (!(bannerPages.includes(pageUrl)))
	{
		return;
	}

	bannerElement = $("#banner");
	contentElement = $("#content");

	contentElement.parentElement.style.marginTop = `calc(100vh - ${likelyWindowChromeHeight + 40}px)`;

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
	
	await asyncFetch(bannerFilepath + bannerFilename);

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
export function initBanner()
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
}