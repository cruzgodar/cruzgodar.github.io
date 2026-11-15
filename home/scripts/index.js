import { disableLinks } from "../../scripts/src/loadPage.js";
import { fadeLeft, opacityAnimationTime } from "/scripts/src/animation.js";
import { bannerIsScrollDriven, nameTextOpacity } from "/scripts/src/banners.js";
import {
	$
} from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const cruzTextElement = $("#cruz-text");
	const godarTextElement = $("#godar-text");

	function updateNameTextOpacity()
	{
		// Navigating away removes the page element, and with it these two. That's
		// the loop's cue to stop -- without it, every visit to the homepage would
		// leave another copy of it running for the life of the tab.
		if (!cruzTextElement.isConnected)
		{
			return;
		}

		// When the banner is scroll-driven, so is the name text (see the
		// home page's stylesheet) -- setting it from here would lag behind
		// the scroll while the browser chrome animates.
		const scrollDriven = bannerIsScrollDriven();

		for (const element of [cruzTextElement, godarTextElement])
		{
			element.parentNode.classList.toggle("banner-scroll-driven", scrollDriven);

			if (!scrollDriven)
			{
				element.parentNode.style.opacity = nameTextOpacity;
			}
		}

		requestAnimationFrame(updateNameTextOpacity);
	}

	updateNameTextOpacity();

	if (siteSettings.reduceMotion)
	{
		cruzTextElement.style.transform = "translateX(0px)";
		godarTextElement.style.transform = "translateX(0px)";

		cruzTextElement.style.opacity = 1;
		godarTextElement.style.opacity = 1;
	}

	else
	{
		setTimeout(() =>
		{
			fadeLeft({ element: cruzTextElement });

			setTimeout(() => fadeLeft({ element: godarTextElement }), opacityAnimationTime);
		}, opacityAnimationTime);
	}

	disableLinks();
}