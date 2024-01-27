import anime from "../anime.js";
import { opacityAnimationTime } from "./animation.js";
import { headerElement } from "./header.js";
import { addHoverEvent } from "./hover-events.js";
import { $$ } from "./main.js";

const maxSingleColumnOptions = 7;

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

	if (selectElement.querySelectorAll("option").length > maxSingleColumnOptions)
	{
		flexElement.classList.add("two-column");
	}

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

		if (flexElement.classList.contains("two-column"))
		{
			maxWidth *= 2;
		}

		const openHeight = flexElement.getBoundingClientRect().height + 4;
		const headerHeight = headerElement.getBoundingClientRect().height;
		const totalUsableHeight = window.innerHeight - headerHeight - 20;

		const openWidth = maxWidth + 29.75 - 14;
		const totalUsableWidth = window.innerWidth - 20;

		scale = Math.min(
			totalUsableWidth / openWidth,
			Math.min(totalUsableHeight / openHeight, 1)
		);

		const effectiveOpenHeight = openHeight * scale;
		const effectiveOpenWidth = openWidth * scale;

		const rect = buttonElement.getBoundingClientRect();
		
		const topWhenOpen = (rect.top + rect.height / 2) - effectiveOpenHeight / 2;
		const bottomWhenOpen = (rect.bottom - rect.height / 2) + effectiveOpenHeight / 2;

		const leftWhenOpen = (rect.left + rect.width / 2) - effectiveOpenWidth / 2;
		const rightWhenOpen = (rect.right - rect.width / 2) + effectiveOpenWidth / 2;



		let translateY = 0;

		if (bottomWhenOpen > window.innerHeight - 10)
		{
			translateY = window.innerHeight - 10 - bottomWhenOpen;
		}

		else if (topWhenOpen < 10 + headerHeight)
		{
			translateY = 10 + headerHeight - topWhenOpen;
		}



		let translateX = 0;

		if (rightWhenOpen > window.innerWidth - 10)
		{
			translateX = window.innerWidth - 10 - rightWhenOpen;
		}

		else if (leftWhenOpen < 10)
		{
			translateX = 10 - leftWhenOpen;
		}



		await Promise.all([
			anime({
				targets: buttonElement,
				height: openHeight,
				width: openWidth,
				translateY,
				translateX,
				scale,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,

			anime({
				targets: flexElement,
				translateY: 0,
				translateX: 0,
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
		
		const titleRect = flexElement.children[0].getBoundingClientRect();
		const selectedElementRect = flexElement.children[selectedItem].getBoundingClientRect();
		
		const translateX = -(
			-titleRect.width / 2
			+ selectedElementRect.left - titleRect.left
			+ selectedElementRect.width / 2
		);

		await Promise.all([
			anime({
				targets: [buttonElement, buttonElement.parentNode.parentNode],
				height: optionElements[selectedItem].getBoundingClientRect().height / scale + 4,
				width: (optionElements[selectedItem].getBoundingClientRect().width / scale + 16),
				translateY: 0,
				translateX: 0,
				scale: 1,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,

			anime({
				targets: flexElement,
				translateY: titleRect.top - selectedElementRect.top - 10,
				translateX,
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