import { bannerOnScroll } from "./banners.mjs";
import { resizeCard } from "./cards.mjs";
import { headerElement } from "./load-page.mjs";
import { $, $$ } from "./main.mjs";
import { siteSettings } from "./settings.mjs";

export let aspectRatio = window.innerWidth / window.innerHeight;

export function onResize()
{
	setBannerMaxScroll(document.body.offsetHeight > window.innerHeight * 1.5 ? window.innerHeight / 2 : document.body.offsetHeight - window.innerHeight);
	
	Site.navigationAnimationDistanceVertical = Math.min(window.innerHeight / 20, 25);
	Site.navigationAnimationDistanceHorizontal = Math.min(window.innerWidth / 20, 25);
	
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
	
	
	
	//Fix the logo cause Firefox is dumb.
	try
	{
		const element = headerElement.children[0].children[0];
		element.style.width = `${element.getBoundingClientRect().height}px`;
	}
	
	catch(ex) {}



	//Handle single image link rows.
	$$(".one-image-link").forEach(element =>
	{
		const childRect = element.children[0].getBoundingClientRect();

		element.style.margin = 0;

		if (window.innerWidth > 330)
		{
			element.style.marginLeft = `${(window.innerWidth - childRect.width) / 2}px`;
		}
	});
	
	
	
	bannerOnScroll(0);
}

window.addEventListener("resize", onResize);



let appletColumnsAreEqualized = false;
	
export function equalizeAppletColumns()
{
	if (siteSettings.condensedApplets || aspectRatio < 1)
	{
		return;
	}
	
	let leftColumn = null;
	let rightColumn = null;
	
	try
	{
		leftColumn = $("#canvas-landscape-left");
		rightColumn = $("#canvas-landscape-right");
	}
	
	catch(ex) {}
	
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
	
	
	
	//Find the midpoint.
	
	let minHeightDifference = Infinity;
	
	let midpointIndex = 0;
	
	if (elements.length > 1)
	{
		for (let i = 0; i < elements.length; i++)
		{
			const heightDifference = Math.abs(heightSums[i] - (heightSums[heightSums.length - 1] - heightSums[i]));
			
			if (heightDifference < minHeightDifference)
			{
				minHeightDifference = heightDifference;
				
				midpointIndex = i + 1;
			}
		}
	}
	
	
	
	//Move elements around.
	if (midpointIndex < numLeftChildren)
	{
		for (let i = midpointIndex; i < numLeftChildren; i++)
		{
			leftColumn.children[i].classList.add("move-to-right");
		}
		
		const elementsToMove = $$(".move-to-right");
		
		for (let i = elementsToMove.length - 1; i >= 0; i--)
		{
			rightColumn.insertBefore(elementsToMove[i], rightColumn.firstElementChild);
		}
	}
	
	else
	{
		for (let i = 0; i < midpointIndex - numLeftChildren; i++)
		{
			rightColumn.children[i].classList.add("move-to-left");
		}
		
		const elementsToMove = $$(".move-to-left");
		
		for (let i = 0; i < elementsToMove.length; i++)
		{
			leftColumn.appendChild(elementsToMove[i]);
		}
	}
	
	
	
	appletColumnsAreEqualized = true;
}

function destroyAppletColumns()
{
	let leftColumn = null;
	let rightColumn = null;
	
	try
	{
		leftColumn = $("#canvas-landscape-left");
		rightColumn = $("#canvas-landscape-right");
	}
	
	catch(ex) {}
	
	if (!leftColumn || !rightColumn)
	{
		return;
	}
	
	
	
	const elementsToMove = $$(".move-to-left");
	
	for (let i = elementsToMove.length - 1; i >= 0; i--)
	{
		rightColumn.insertBefore(elementsToMove[i], rightColumn.firstElementChild);
		
		elementsToMove[i].classList.remove("move-to-left");
	}
	
	
	
	elementsToMove = $$(".move-to-right");
	
	for (let i = 0; i < elementsToMove.length; i++)
	{
		leftColumn.appendChild(elementsToMove[i]);
		
		elementsToMove[i].classList.remove("move-to-right");
	}
	
	
	
	appletColumnsAreEqualized = false;
}