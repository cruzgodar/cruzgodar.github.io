import { disableLinks, showPage } from "../../scripts/src/loadPage.js";
import { fadeIn, fadeLeft, opacityAnimationTime } from "/scripts/src/animation.js";
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
		cruzTextElement.parentNode.style.opacity = nameTextOpacity;
		godarTextElement.parentNode.style.opacity = nameTextOpacity;

		requestAnimationFrame(updateNameTextOpacity);
	}

	updateNameTextOpacity();

	if (siteSettings.reduceMotion)
	{
		cruzTextElement.style.transform = "translateX(0px)";
		godarTextElement.style.transform = "translateX(0px)";

		setTimeout(() =>
		{
			fadeIn({ element: cruzTextElement });

			setTimeout(() => fadeIn({ element: godarTextElement }), opacityAnimationTime);
		}, opacityAnimationTime);
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

	showPage();
}