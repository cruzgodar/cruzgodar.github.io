import { setBannerMaxScroll } from "./banners.js";
import { currentCard, resizeCard } from "./cards.js";
import { headerElement } from "./header.js";
import {
	$,
	$$,
	pageElement
} from "./main.js";
import { siteSettings } from "./settings.js";

export let aspectRatio = window.innerWidth / window.innerHeight;
export let navigationAnimationDistanceVertical = Math.min(window.innerHeight / 20, 25);
export let navigationAnimationDistanceHorizontal = Math.min(window.innerWidth / 20, 25);

let appletColumnsAreEqualized = false;

// A somewhat hack to make the content not have wildly varying margins
// between e.g. desktop Chrome and iOS Safari.
const heightMeasurerElement = document.body.querySelector("#height-measurer");

export let viewportHeight = heightMeasurerElement
	? 100 * heightMeasurerElement.getBoundingClientRect().height
	: window.innerHeight;

export const likelyWindowChromeHeight = viewportHeight - window.innerHeight;

export function onResize()
{
	viewportHeight = heightMeasurerElement
		? 100 * heightMeasurerElement.getBoundingClientRect().height - likelyWindowChromeHeight
		: window.innerHeight;
		
	setBannerMaxScroll(
		Math.min(
			viewportHeight - 40 - (headerElement ? headerElement.offsetHeight : 0),
			document.body.offsetHeight - window.innerHeight
		)
	);

	navigationAnimationDistanceVertical = Math.min(window.innerHeight / 20, 25);
	navigationAnimationDistanceHorizontal = Math.min(window.innerWidth / 20, 25);

	aspectRatio = window.innerWidth / window.innerHeight;



	if (aspectRatio > 1 && !appletColumnsAreEqualized)
	{
		equalizeAppletColumns();
	}

	else if (aspectRatio <= 1 && appletColumnsAreEqualized)
	{
		destroyAppletColumns();
	}

	resizeCard();



	// Fix the logo cause Firefox is dumb.
	const element = headerElement?.children[0]?.children[0];

	if (element)
	{
		element.style.width = `${element.getBoundingClientRect().height}px`;
	}



	// Handle single image link rows.
	const oneImageLinkElements = $$(".one-image-link .image-link");

	let imageLinkElement = $(".image-links:not(.one-image-link) .image-link");

	if (!imageLinkElement)
	{
		const element = document.createElement("div");

		element.classList.add("image-links");
		element.style.opacity = 0;
		element.style.marginTop = 0;

		pageElement.appendChild(element);

		imageLinkElement = document.createElement("div");

		imageLinkElement.classList.add("image-link");

		element.appendChild(imageLinkElement);
	}
	
	if (oneImageLinkElements.length)
	{
		const oneImageLinkWidth = $(".image-links:not(.one-image-link) .image-link")
			.getBoundingClientRect().width;

		oneImageLinkElements.forEach(element =>
		{
			element.style.width = `${oneImageLinkWidth}px`;
		});
	}



	// Handle images in cards.

	if (currentCard)
	{
		const image = currentCard?.querySelector("img");

		if (image)
		{
			const rectHeight = currentCard.getBoundingClientRect().height;
			const imageHeight = image.getBoundingClientRect().height;
			const margin = window.innerWidth <= 500 ? 8 : 16;

			image.style.maxHeight = `calc(100vh - ${rectHeight - imageHeight + 2 * margin}px)`;
		}
	}
}

export function setUpOnResize()
{
	window.addEventListener("resize", onResize);
}



export function equalizeAppletColumns()
{
	if (siteSettings.condensedApplets || aspectRatio < 1 || window.innerWidth < 750)
	{
		return;
	}

	const leftColumn = $("#canvas-landscape-left");
	const rightColumn = $("#canvas-landscape-right");

	if (!leftColumn || !rightColumn)
	{
		return;
	}



	const elements = [];

	const numLeftChildren = leftColumn.children.length;
	const numRightChildren = rightColumn.children.length;

	for (let i = 0; i < numLeftChildren; i++)
	{
		elements.push(leftColumn.children[i]);
	}

	for (let i = 0; i < numRightChildren; i++)
	{
		elements.push(rightColumn.children[i]);
	}



	const heightSums = [elements[0].clientHeight];

	for (let i = 1; i < elements.length; i++)
	{
		heightSums.push(heightSums[i - 1] + elements[i].clientHeight);
	}



	// Find the midpoint.

	let minHeightDifference = Infinity;

	let midpointIndex = 0;

	if (elements.length > 1)
	{
		for (let i = 0; i < elements.length; i++)
		{
			const heightDifference = Math.abs(
				heightSums[i] - (heightSums[heightSums.length - 1] - heightSums[i])
			);

			if (heightDifference < minHeightDifference)
			{
				minHeightDifference = heightDifference;

				midpointIndex = i + 1;
			}
		}
	}



	// Move elements around.
	if (midpointIndex < numLeftChildren)
	{
		const elementsToMove = [];

		for (let i = midpointIndex; i < numLeftChildren; i++)
		{
			leftColumn.children[i].classList.add("moved-to-right");
			elementsToMove.push(leftColumn.children[i]);
		}

		for (let i = elementsToMove.length - 1; i >= 0; i--)
		{
			rightColumn.insertBefore(elementsToMove[i], rightColumn.firstElementChild);
		}
	}

	else
	{
		const elementsToMove = [];

		for (let i = 0; i < midpointIndex - numLeftChildren; i++)
		{
			rightColumn.children[i].classList.add("moved-to-left");
			elementsToMove.push(rightColumn.children[i]);
		}

		for (let i = 0; i < elementsToMove.length; i++)
		{
			leftColumn.appendChild(elementsToMove[i]);
		}
	}



	appletColumnsAreEqualized = true;
}

function destroyAppletColumns()
{
	const leftColumn = $("#canvas-landscape-left");
	const rightColumn = $("#canvas-landscape-right");

	if (!leftColumn || !rightColumn)
	{
		return;
	}



	let elementsToMove = $$(".moved-to-left");

	for (let i = elementsToMove.length - 1; i >= 0; i--)
	{
		rightColumn.insertBefore(elementsToMove[i], rightColumn.firstElementChild);

		elementsToMove[i].classList.remove("moved-to-left");
	}



	elementsToMove = $$(".moved-to-right");

	for (let i = 0; i < elementsToMove.length; i++)
	{
		leftColumn.appendChild(elementsToMove[i]);

		elementsToMove[i].classList.remove("moved-to-right");
	}



	appletColumnsAreEqualized = false;
}