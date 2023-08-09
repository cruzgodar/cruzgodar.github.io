import { redirect } from "./navigation.min.min.mjs"

export function setUpTextButtons()
{
	window.addEventListener("resize", equalizeTextButtons);
	Page.temporaryHandlers["resize"].push(equalizeTextButtons);
	
	setTimeout(equalizeTextButtons, 50);
	setTimeout(equalizeTextButtons, 500);
}



//Makes linked text buttons have the same width and height.
function equalizeTextButtons()
{
	$$(".text-button").forEach(textButton => textButton.parentNode.style.margin = "0 auto");
	
	const heights = [];
	let maxHeight = 0;

	const widths = [];
	let maxWidth = 0;
	
	const elements = $$(".linked-text-button");
	
	elements.forEach((element, index) =>
	{
		element.style.height = "fit-content";
		element.style.width = "fit-content";
		
		heights.push(element.offsetHeight);
		
		if (heights[index] > maxHeight)
		{
			maxHeight = heights[index];
		}
		
		widths.push(element.offsetWidth);
		
		if (widths[index] > maxWidth)
		{
			maxWidth = widths[index];
		}
	});
	
	elements.forEach((element, index) =>
	{
		if (heights[index] < maxHeight)
		{
			element.style.height = maxHeight + "px";
		}
		
		else
		{
			element.style.height = "fit-content";
		}
		
		if (widths[index] < maxWidth)
		{
			element.style.width = maxWidth + "px";
		}
		
		else
		{
			element.style.width = "fit-content";
		}
		
		element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, ${maxWidth}px`;
	});
}

export function setUpNavButtons()
{
	const list = Site.sitemap[Site.sitemap[Page.url].parent].children;
	const index = list.indexOf(Page.url);
	
	if (index === -1)
	{
		console.error("Page not found in page list!");
		
		return;
	}
	
	if (index > 0)
	{
		$$(".previous-nav-button").forEach(element =>
		{
			element.addEventListener("click", () => redirect({ url: list[index - 1] }));
		});
	}
	
	else
	{
		$$(".previous-nav-button").forEach(element => element.parentNode.remove());
	}
	
	
	
	$$(".home-nav-button").forEach(element => 
	{
		element.addEventListener("click", () => redirect({ url: Site.sitemap[Page.url].parent }));
	});
	
	
	
	if (index < list.length - 1)
	{
		$$(".next-nav-button").forEach(element =>
		{
			element.addEventListener("click", () => redirect({ url: list[index + 1] }));
		});
	}
	
	else
	{
		$$(".next-nav-button").forEach(element => element.parentNode.remove());
	}
}

export function setUpDropdowns()
{
	$$("select").forEach(element =>
	{
		const buttonElement = element.previousElementSibling;
		
		buttonElement.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		
		buttonElement.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, 100%)`;
		
		element.addEventListener("input", () =>
		{
			buttonElement.innerHTML = `${element.querySelector(`[value=${element.value}]`).textContent}  <span style="font-size: 12px">&#x25BC;</span>`;
		});
	});
}