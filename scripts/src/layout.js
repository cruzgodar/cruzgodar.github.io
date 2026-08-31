import { setBannerMaxScroll } from "./banners.js";
import { currentCard, resizeCard } from "./cards.js";
import { headerElement } from "./header.js";
import {
	$,
	$$
} from "./main.js";

export const pageWidth = 1150;

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

	updateImageLinks();



	// Handle images in cards.

	if (currentCard)
	{
		const image = currentCard.querySelector("img.gallery-card-image");

		if (image)
		{
			const rectHeight = currentCard.getBoundingClientRect().height;
			const imageHeight = image.getBoundingClientRect().height;
			const margin = window.innerWidth <= 500 ? 8 : 16;

			image.style.maxHeight = `calc(100vh - ${rectHeight - imageHeight + 2 * margin}px)`;
		}
	}
}

export function initOnResize()
{
	window.addEventListener("resize", onResize);
}



function updateImageLinks()
{
	const mainWidth = window.innerWidth - (window.innerWidth <= 500 ? 32 : 64);
	const imageLinksWidth = Math.min(mainWidth, 6 * 175 + 5 * 16);
	const breakpoints = [289, 545, 711, 877, 1043];
	let numImageLinksPerRow = 1;
	let index = 0;

	while (window.innerWidth > breakpoints[index] && index < breakpoints.length)
	{
		numImageLinksPerRow++;
		index++;
	}

	const imageLinkWidth = (imageLinksWidth - 16 * (numImageLinksPerRow - 1)) / numImageLinksPerRow;



	for (const imageLinksElement of $$(".image-links"))
	{
		if (imageLinksElement.children.length <= numImageLinksPerRow)
		{
			imageLinksElement.style.gridTemplateColumns = `repeat(${imageLinksElement.children.length}, ${imageLinkWidth}px)`;
		}

		else
		{
			imageLinksElement.style.removeProperty("grid-template-columns");
		}
	}
}



export function equalizeAppletColumns()
{
	if (aspectRatio < 1 || window.innerWidth < 750)
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