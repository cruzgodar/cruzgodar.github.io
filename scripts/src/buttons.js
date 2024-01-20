import anime from "../anime.js";
import { opacityAnimationTime } from "./animation.js";
import { headerElement } from "./header.js";
import { addHoverEvent } from "./hover-events.js";
import {
	$$,
	addTemporaryListener,
	pageUrl
} from "./main.js";
import { redirect } from "./navigation.js";
import { sitemap } from "./sitemap.js";

export function setUpTextButtons()
{
	addTemporaryListener({
		object: window,
		event: "resize",
		callback: equalizeTextButtons
	});

	setTimeout(equalizeTextButtons, 50);
	setTimeout(equalizeTextButtons, 500);
}

//Makes linked text buttons have the same width and height.
export function equalizeTextButtons()
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
	const parent = sitemap[pageUrl].parent;

	if (!parent)
	{
		return;
	}

	const list = sitemap[sitemap[pageUrl].parent].children;
	const index = list.indexOf(pageUrl);

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
		element.addEventListener("click", () => redirect({ url: sitemap[pageUrl].parent }));
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

function setUpDropdown(selectElement)
{
	let dropdownOpen = false;

	let selectedItem = 0;

	let scale = 1;

	const buttonElement = selectElement.previousElementSibling;

	buttonElement.innerHTML = "";

	buttonElement.parentNode.parentNode.style.gridTemplateColumns = "repeat(auto-fit, 100%)";

	const flexElement = document.createElement("div");

	flexElement.classList.add("option-container");

	buttonElement.appendChild(flexElement);

	const optionElements = [];

	const selectOptionElements = [];
	
	selectElement.querySelectorAll("option").forEach((option, index) =>
	{
		const optionElement = document.createElement("div");

		optionElement.textContent = option.textContent;
		optionElement.setAttribute("data-option-index", index);
		optionElements.push(optionElement);
		flexElement.appendChild(optionElement);

		selectOptionElements.push(option);
	});

	setTimeout(() =>
	{
		optionElements.slice(1).forEach(element =>
		{
			addHoverEvent(element);
		});

		optionElements[0].innerHTML +=
			" <span style=\"font-size: 12px; margin-right: -2px\">&#x25BC;</span>";
		
		// The 24 accounts for the padding and border.
		buttonElement.style.height = (
			optionElements[selectedItem].getBoundingClientRect().height * 1.075
		) + "px";

		buttonElement.style.width = (
			optionElements[selectedItem].getBoundingClientRect().width + 16
		) + "px";

		buttonElement.parentNode.parentNode.style.height = (
			optionElements[selectedItem].getBoundingClientRect().height * 1.075
		) + "px";

		buttonElement.parentNode.parentNode.style.width = (
			optionElements[selectedItem].getBoundingClientRect().width + 16
		) + "px";

		flexElement.style.transform = "translateY(-10px)";
	}, 16);



	async function openDropdown()
	{
		dropdownOpen = true;

		buttonElement.classList.add("expanded");

		let maxWidth = 0;
		optionElements.forEach(element =>
		{
			maxWidth = Math.max(maxWidth, element.getBoundingClientRect().width);
		});

		const openHeight = flexElement.getBoundingClientRect().height + 4;
		const headerHeight = headerElement.getBoundingClientRect().height;
		const totalUsableHeight = window.innerHeight - headerHeight - 20;

		scale = Math.min(totalUsableHeight / openHeight, 1);

		const effectiveOpenHeight = openHeight * scale;

		const rect = buttonElement.getBoundingClientRect();
		const topWhenOpen = (rect.top + rect.height / 2) - effectiveOpenHeight / 2;
		const bottomWhenOpen = (rect.bottom - rect.height / 2) + effectiveOpenHeight / 2;

		let translateY = 0;

		if (bottomWhenOpen > window.innerHeight - 10)
		{
			translateY = window.innerHeight - 10 - bottomWhenOpen;
		}

		else if (topWhenOpen < 10 + headerHeight)
		{
			translateY = 10 + headerHeight - topWhenOpen;
		}

		await Promise.all([
			anime({
				targets: buttonElement,
				//The +4 is for the border.
				height: openHeight,
				width: maxWidth + 29.75,
				translateY,
				scale,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,

			anime({
				targets: flexElement,
				translateY: 0,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,
		]);

		document.documentElement.addEventListener("click", closeDropdown);
	}



	async function closeDropdown(e)
	{
		document.documentElement.removeEventListener("click", closeDropdown);

		dropdownOpen = false;

		buttonElement.classList.remove("expanded");

		// Using || rather than ?? handles both the case where we click the background
		// and clicking the title option.
		const oldSelectedItem = selectedItem;
		
		let element = document.elementFromPoint(e.clientX, e.clientY);

		while (!element.hasAttribute("data-option-index") && element.tagName !== "HTML")
		{
			element = element.parentNode;
		}

		selectedItem = parseInt(
			element.getAttribute("data-option-index") ?? selectedItem
		) || selectedItem;

		selectElement.value = selectOptionElements[selectedItem].value;

		if (oldSelectedItem !== selectedItem)
		{
			selectElement.dispatchEvent(new Event("input"));
		}

		const otherElementHeights = optionElements
			.slice(0, selectedItem)
			.map(element => element.getBoundingClientRect().height / scale);
		
		let translateY = 0;
		otherElementHeights.forEach(height => translateY -= height);

		translateY -= 10;

		await Promise.all([
			anime({
				targets: [buttonElement, buttonElement.parentNode.parentNode],
				height: optionElements[selectedItem].getBoundingClientRect().height / scale + 4,
				width: (optionElements[selectedItem].getBoundingClientRect().width / scale + 16),
				translateY: 0,
				scale: 1,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,

			anime({
				targets: flexElement,
				translateY,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,
		]);
	}

	buttonElement.addEventListener("click", () =>
	{
		if (!dropdownOpen)
		{
			openDropdown();
		}
	});
}

export function setUpDropdowns()
{
	$$("select").forEach(element => setUpDropdown(element));
}