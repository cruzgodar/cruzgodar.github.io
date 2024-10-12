import { disableLinks, showPage } from "../../scripts/src/loadPage.js";
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

	showPage();
}