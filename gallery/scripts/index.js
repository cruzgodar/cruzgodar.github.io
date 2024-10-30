 
import { showPage } from "../../scripts/src/loadPage.js";
import { galleryImageData } from "./imageData.js";
import { showCard } from "/scripts/src/cards.js";
import { addHoverEvent } from "/scripts/src/hoverEvents.js";
import { $, $$ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { redirect } from "/scripts/src/navigation.js";

export default function()
{
	const titleElement = $("#high-res-viewer-card h1");
	const descriptionTextElement = $("#description-text");
	const featuredTextElement = $("#featured-text");
	const appletLinkElement = $("#applet-link");
	const fullResLinkElement = $("#full-res-link");

	let currentId = "";

	function showGalleryCard({ id, fromElement })
	{
		currentId = id;

		titleElement.innerHTML = galleryImageData[id].title;



		if (galleryImageData[id].parameters)
		{
			descriptionTextElement.innerHTML = galleryImageData[id].parameters;

			descriptionTextElement.parentElement.style.display = "block";
		}

		else
		{
			descriptionTextElement.parentElement.style.display = "none";
		}



		if (galleryImageData[id].featured)
		{
			featuredTextElement.innerHTML = galleryImageData[id].featured;

			featuredTextElement.parentElement.style.display = "block";

			setTimeout(() =>
			{
				const links = featuredTextElement.querySelectorAll("a");

				for (const element of Array.from(links))
				{
					addHoverEvent({ element });
				}
			}, 10);
		}

		else
		{
			featuredTextElement.parentElement.style.display = "none";
		}



		appletLinkElement.setAttribute("href", galleryImageData[id].appletLink);

		fullResLinkElement.setAttribute("href", `https://drive.google.com/uc?id=${galleryImageData[id].driveId}&export=download`);



		const highResImageElement = document.createElement("img");

		const element = $("#high-res-viewer-card img");
		element.parentNode.insertBefore(highResImageElement, element);
		element.remove();

		typesetMath();

		highResImageElement.onload = () =>
		{
			setTimeout(() => showCard({
				id: "high-res-viewer",
				fromElement
			}), 10);
		};

		highResImageElement.src = `/gallery/high-res/${id}.webp`;

		typesetMath();
	}



	$$(".gallery-image-1-1 img, .gallery-image-2-2 img, .gallery-image-3-3 img").forEach(element =>
	{
		element.addEventListener(
			"click",
			e => showGalleryCard({
				id: e.target.getAttribute("data-image-id"),
				fromElement: element
			})
		);
	});

	appletLinkElement.addEventListener("click", () =>
	{
		redirect({ url: galleryImageData[currentId].appletLink });
	});

	fullResLinkElement.addEventListener("click", () =>
	{
		redirect({ url: `https://drive.google.com/uc?id=${galleryImageData[currentId].driveId}&export=download`, inNewTab: true });
	});

	showPage();
}