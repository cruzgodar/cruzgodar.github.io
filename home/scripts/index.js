import { disableLinks, showPage } from "../../scripts/src/loadPage.js";
import { fadeLeft, opacityAnimationTime } from "/scripts/src/animation.js";
import {
	$,
	addTemporaryListener,
	setVisitedHomepage,
	visitedHomepage
} from "/scripts/src/main.js";

// On large screens, make the content be centered at the bottom of the page.
function centerContent()
{
	const contentHeight = $("main").getBoundingClientRect().height;
	const marginBottom = Math.max(128, (window.innerHeight - contentHeight) / 2);
	$("section:last-of-type").style.marginBottom = `${marginBottom}px`;
}

export function load()
{
	if (visitedHomepage)
	{
		$("#return-scroll-to").scrollIntoView();
	}

	setVisitedHomepage(true);

	addTemporaryListener({
		object: window,
		event: "resize",
		callback: centerContent
	});

	centerContent();



	const cruzTextElement = $("#cruz-text");
	const godarTextElement = $("#godar-text");

	function onScroll()
	{
		window.requestAnimationFrame(() =>
		{
			// cruzTextElement.parentNode.style.opacity = scrollButtonOpacity;
			// godarTextElement.parentNode.style.opacity = scrollButtonOpacity;
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