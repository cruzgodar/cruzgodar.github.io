import anime from "../anime.js";
import { pageShown } from "./loadPage.js";
import { pageElement } from "./main.js";

export function loadImages()
{
	const images = pageElement.querySelectorAll("img[data-src]");

	for (const image of images)
	{
		image.style.opacity = 0;

		const imageLoadElement = document.createElement("img");
		imageLoadElement.onload = () =>
		{
			image.src = image.getAttribute("data-src");
			
			anime({
				targets: image,
				opacity: 1,
				duration: pageShown ? 250 : 0,
				easing: "easeInOutQuad"
			});
		};

		setTimeout(() => imageLoadElement.src = image.getAttribute("data-src"), 0);
	}
}