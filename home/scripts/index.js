import { showPage } from "../../scripts/src/loadPage.js";
import { fadeUpIn } from "/scripts/src/animation.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const cruzTextElement = $("#cruz-text");
	const godarTextElement = $("#godar-text");

	setTimeout(() => fadeUpIn({ element: cruzTextElement }), 500);

	// if (visitedHomepage)
	// {
	// 	$("#return-scroll-to").scrollIntoView();
	// }

	// setVisitedHomepage(true);

	// addTemporaryListener({
	// 	object: window,
	// 	event: "resize",
	// 	callback: centerContent
	// });

	// centerContent();



	// const cruzTextElement = $("#cruz-text");
	// const godarTextElement = $("#godar-text");

	// function onScroll()
	// {
	// 	window.requestAnimationFrame(() =>
	// 	{
	// 		cruzTextElement.parentNode.style.opacity = scrollButtonOpacity;
	// 		godarTextElement.parentNode.style.opacity = scrollButtonOpacity;
	// 	});
	// }

	// setTimeout(() =>
	// {
	// 	fadeLeft(cruzTextElement);

	// 	setTimeout(() => fadeLeft(godarTextElement), opacityAnimationTime);
	// }, opacityAnimationTime);

	// setTimeout(() => onScroll(1), 100);

	// addTemporaryListener({
	// 	object: window,
	// 	event: "scroll",
	// 	callback: onScroll
	// });

	// disableLinks();

	showPage();
}