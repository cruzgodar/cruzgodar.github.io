import { disableLinks } from "../../scripts/src/loadPage.js";
import { fadeLeft, opacityAnimationTime } from "/scripts/src/animation.js";
import { nameTextOpacity } from "/scripts/src/banners.js";
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

		cruzTextElement.parentNode.style.opacity = nameTextOpacity;
		godarTextElement.parentNode.style.opacity = nameTextOpacity;

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