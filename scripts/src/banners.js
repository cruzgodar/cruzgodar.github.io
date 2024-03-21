import { changeOpacity, opacityAnimationTime } from "./animation.js";
import { cardIsAnimating, cardIsOpen } from "./cards.js";
import {
	$,
	addStyle,
	pageElement,
	pageUrl
} from "./main.js";
import anime from "/scripts/anime.js";

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



let scrollButtonElement;

export let scrollButtonOpacity = 1;

export let scrollButtonExists = false;

export function setScrollButtonExists(newScrollButtonExists)
{
	scrollButtonExists = newScrollButtonExists;
}



// The banner opacity cannot be changed more than a certain amount each frame
// to account for sudden changes in viewport height. This function handles that animation.

export let bannerOpacity = 1;

let lastBannerOpacityTimestamp = -1;

let cardWasAnimating = 0;

export function updateBannerOpacity(timestamp)
{
	const timeElapsed = timestamp - lastBannerOpacityTimestamp;

	if (
		!bannerElement
		|| !contentElement
		|| timestamp === lastBannerOpacityTimestamp
		|| lastBannerOpacityTimestamp === -1
	) {
		lastBannerOpacityTimestamp = timestamp;

		window.requestAnimationFrame(updateBannerOpacity);

		return;
	}

	lastBannerOpacityTimestamp = timestamp;

	const newBannerOpacity = 1 - window.scrollY / bannerMaxScroll;
	
	const maxSingleFrameChange = .085 * timeElapsed / 6.944;

	bannerOpacity = Math.min(
		Math.max(
			Math.max(bannerOpacity - maxSingleFrameChange, 0),
			newBannerOpacity
		),
		Math.min(bannerOpacity + maxSingleFrameChange, 1)
	);

	if (bannerElement)
	{
		bannerElement.style.opacity = bannerOpacity;
	}

	if (contentElement && !cardIsOpen && !cardIsAnimating)
	{
		if (cardWasAnimating)
		{
			cardWasAnimating--;
		}

		else
		{
			contentElement.style.opacity = 1 - bannerOpacity;
		}
	}

	else
	{
		cardWasAnimating = 50;
	}

	scrollButtonOpacity = Math.min(Math.max(1 - window.scrollY / (bannerMaxScroll / 2.5), 0), 1);

	if (scrollButtonExists)
	{
		scrollButtonElement.style.opacity = scrollButtonOpacity;

		if (scrollButtonOpacity === 0)
		{
			scrollButtonExists = false;

			scrollButtonElement.remove();
		}
	}

	window.requestAnimationFrame(updateBannerOpacity);
}

window.requestAnimationFrame(updateBannerOpacity);



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



export function insertScrollButton()
{
	if (window.scrollY > bannerMaxScroll / 2.5)
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