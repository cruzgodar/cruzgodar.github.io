import { disableLinks, showPage } from "../../scripts/src/loadPage.js";
import { fadeLeft, opacityAnimationTime } from "/scripts/src/animation.js";
import { nameTextOpacity } from "/scripts/src/banners.js";
import {
	$,
	addTemporaryListener,
	setVisitedHomepage,
	visitedHomepage
} from "/scripts/src/main.js";

export function load()
{
	if (visitedHomepage)
	{
		$("#return-scroll-to").scrollIntoView();
	}

	setVisitedHomepage(true);



	const cruzTextElement = $("#cruz-text");
	const godarTextElement = $("#godar-text");

	function onScroll()
	{
		window.requestAnimationFrame(() =>
		{
			cruzTextElement.parentNode.style.opacity = nameTextOpacity;
			godarTextElement.parentNode.style.opacity = nameTextOpacity;
		});
	}

	setTimeout(() =>
	{
		fadeLeft({ element: cruzTextElement });

		setTimeout(() => fadeLeft({ element: godarTextElement }), opacityAnimationTime);
	}, opacityAnimationTime);

	setTimeout(() => onScroll(1), 100);

	addTemporaryListener({
		object: window,
		event: "scroll",
		callback: onScroll
	});

	disableLinks();

	showPage();
}