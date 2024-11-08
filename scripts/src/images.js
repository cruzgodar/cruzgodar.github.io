import anime from "../anime.js";
import { pageShown } from "./loadPage.js";
import { pageElement } from "./main.js";

export function loadImages()
{
	const images = pageElement.querySelectorAll("img[data-src]");

	for (const image of images)
	{
		image.style.opacity = 0;
		image.src = image.getAttribute("data-src");

		const imageLoadElement = document.createElement("img");
		imageLoadElement.onload = () =>
		{
			anime({
				targets: image,
				opacity: 1,
				duration: pageShown ? 200 : 10,
				delay: pageShown ? 0 : 25,
				easing: "easeInOutQuad"
			});
		};

		imageLoadElement.src = image.getAttribute("data-src");
	}
}