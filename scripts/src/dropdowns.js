import anime from "../anime.js";
import { opacityAnimationTime } from "./animation.js";
import { headerElement } from "./header.js";
import { addHoverEvent } from "./hoverEvents.js";
import { InputElement } from "./inputElement.js";

const maxSingleColumnOptions = 7;

export class Dropdown extends InputElement
{
	value;
	options;
	onInput;

	buttonElement;
	optionContainerElement;
	optionElements;

	isOpen = false;
	selectedItem = 0;
	scale = 1;
	boundClose;

	// options is an object with id keys and name values.
	constructor({
		element,
		name,
		options,
		onInput = () => {}
	})
	{
		super({ element, name });

		this.options = Object.assign({ "": this.name }, options);
		this.onInput = onInput;
		this.value = "";

		this.buttonElement = this.element.previousElementSibling;

		this.boundClose = this.close.bind(this);

		const numItems = Object.keys(this.options).length;

		this.buttonElement.textContent = this.name;

		this.selectOptionElements = [];

		for (const key in this.options)
		{
			const selectOptionElement = document.createElement("option");

			selectOptionElement.value = key;
			selectOptionElement.textContent = this.options[key];

			this.element.appendChild(selectOptionElement);

			this.selectOptionElements.push(selectOptionElement);
		}

		this.buttonElement.innerHTML = "";

		this.buttonElement.parentNode.parentNode.style.gridTemplateColumns
			= "repeat(auto-fit, 100%)";

		this.optionContainerElement = document.createElement("div");

		this.optionContainerElement.classList.add("option-container");

		if (numItems > maxSingleColumnOptions)
		{
			this.optionContainerElement.classList.add("two-column");
		}

		this.buttonElement.appendChild(this.optionContainerElement);

		this.optionElements = [];
		
		this.selectOptionElements.forEach((option, index) =>
		{
			const optionElement = document.createElement("div");

			optionElement.textContent = option.textContent;
			optionElement.setAttribute("data-option-name", option.getAttribute("value"));
			optionElement.setAttribute("data-option-index", index);
			this.optionElements.push(optionElement);
			this.optionContainerElement.appendChild(optionElement);
		});

		setTimeout(() =>
		{
			this.optionElements.slice(1).forEach(element =>
			{
				addHoverEvent(element);
			});

			this.optionElements[0].innerHTML +=
				" <span style=\"font-size: 12px; margin-right: -2px\">&#x25BC;</span>";
			
			this.buttonElement.style.height = (
				this.optionElements[this.selectedItem].getBoundingClientRect().height * 1.075
			) + "px";

			this.buttonElement.style.width = (
				this.optionElements[this.selectedItem].getBoundingClientRect().width + 16
			) + "px";

			this.buttonElement.parentNode.parentNode.style.height = (
				this.optionElements[this.selectedItem].getBoundingClientRect().height * 1.075
			) + "px";

			this.buttonElement.parentNode.parentNode.style.width = (
				this.optionElements[this.selectedItem].getBoundingClientRect().width + 16
			) + "px";

			this.optionContainerElement.style.transform = "translateY(-10px)";

			this.buttonElement.addEventListener("click", () =>
			{
				if (!this.isOpen)
				{
					this.open();
				}
			});
		}, 16);
	}

	async open()
	{
		this.isOpen = true;

		this.buttonElement.classList.add("expanded");

		let titleWidth = 0;
		let maxWidth1 = 0;
		let maxWidth2 = 0;
		this.optionElements.forEach((element, index) =>
		{
			if (index === 0)
			{
				titleWidth = element.getBoundingClientRect().width;
			}

			else if (index % 2 === 0)
			{
				maxWidth1 = Math.max(maxWidth1, element.getBoundingClientRect().width);
			}

			else
			{
				maxWidth2 = Math.max(maxWidth2, element.getBoundingClientRect().width);
			}
		});

		const maxWidth = Math.max(
			this.optionContainerElement.classList.contains("two-column")
				? maxWidth1 + maxWidth2
				: Math.max(maxWidth1, maxWidth2),
			titleWidth
		);

		const openHeight = this.optionContainerElement.getBoundingClientRect().height + 4;
		const headerHeight = headerElement.getBoundingClientRect().height;
		const totalUsableHeight = window.innerHeight - headerHeight - 20;

		const openWidth = maxWidth + 24;
		const totalUsableWidth = window.innerWidth - 20;

		this.scale = Math.min(
			totalUsableWidth / openWidth,
			Math.min(totalUsableHeight / openHeight, 1)
		);

		const effectiveOpenHeight = openHeight * this.scale;
		const effectiveOpenWidth = openWidth * this.scale;

		const rect = this.buttonElement.getBoundingClientRect();
		
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
				targets: this.buttonElement,
				height: openHeight,
				width: openWidth,
				translateY,
				translateX,
				scale: this.scale,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,

			anime({
				targets: this.optionContainerElement,
				translateY: 0,
				translateX: 0,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,
		]);

		document.documentElement.addEventListener("click", this.boundClose);
	}

	async close(e)
	{
		let element = document.elementFromPoint(e.clientX, e.clientY);

		while (!element.hasAttribute("data-option-index") && element.tagName !== "HTML")
		{
			element = element.parentNode;
		}

		await this.setValue(element.getAttribute("data-option-name"));
	}

	async setValue(newValue)
	{
		document.documentElement.removeEventListener("click", this.boundClose);

		this.isOpen = false;

		this.buttonElement.classList.remove("expanded");

		const oldSelectedItem = this.selectedItem;
		
		const element = this.element.querySelector(`[data-option-name=${newValue}]`);

		// Using || rather than ?? handles both the case where we click the background
		// and clicking the title option.
		this.selectedItem = parseInt(
			element.getAttribute("data-option-index") ?? this.selectedItem
		) || this.selectedItem;

		this.element.value = this.selectOptionElements[this.selectedItem].value;
		this.value = this.element.value;

		if (oldSelectedItem !== this.selectedItem)
		{
			this.onInput();
		}
		
		const titleRect = this.optionContainerElement.children[0].getBoundingClientRect();
		const selectedElementRect = this.optionContainerElement.children[this.selectedItem]
			.getBoundingClientRect();
		
		const translateY = (titleRect.top - selectedElementRect.top) / this.scale - 10;

		const translateX = -(
			-titleRect.width / 2
			+ selectedElementRect.left - titleRect.left
			+ selectedElementRect.width / 2
		) / this.scale;

		await Promise.all([
			anime({
				targets: [this.buttonElement, this.buttonElement.parentNode.parentNode],
				height: this.optionElements[this.selectedItem].getBoundingClientRect().height
					/ this.scale + 4,
				width: (this.optionElements[this.selectedItem].getBoundingClientRect().width
					/ this.scale + 16),
				translateY: 0,
				translateX: 0,
				scale: 1,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,

			anime({
				targets: this.optionContainerElement,
				translateY,
				translateX,
				easing: "easeOutQuad",
				duration: opacityAnimationTime
			}).finished,
		]);
	}
}