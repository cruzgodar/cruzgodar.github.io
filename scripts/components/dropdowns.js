import anime from "../anime.js";
import { opacityAnimationTime } from "../src/animation.js";
import { headerElement } from "../src/header.js";
import { addHoverEvent } from "../src/hoverEvents.js";
import { addTemporaryParam, pageUrl } from "../src/main.js";
import { siteSettings } from "../src/settings.js";
import { InputElement } from "./inputElement.js";

const maxSingleColumnOptions = 7;

export class Dropdown extends InputElement
{
	value;
	options;
	persistState;
	onInput;
	returnToTitleOnSelect;

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
		roundCorners = true,
		returnToTitleOnSelect = false,
		persistState = true,
		options,
		onInput = () => {}
	}) {
		super({ element, name });

		this.options = Object.assign({ "": this.name }, options);
		this.onInput = onInput;
		this.value = "";
		this.persistState = persistState;
		this.returnToTitleOnSelect = returnToTitleOnSelect;

		this.buttonElement = this.element.previousElementSibling;

		this.boundClose = this.close.bind(this);

		const numItems = Object.keys(this.options).length;

		this.buttonElement.textContent = this.name;

		if (!roundCorners)
		{
			this.buttonElement.style.borderRadius = "10px";
		}

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
		
		for (const [index, option] of this.selectOptionElements.entries())
		{
			const optionElement = document.createElement("div");

			optionElement.textContent = option.textContent;
			optionElement.setAttribute(
				"data-option-name",
				index === 0 ? "default" : option.getAttribute("value")
			);
			optionElement.setAttribute("data-option-index", index);
			this.optionElements.push(optionElement);
			this.optionContainerElement.appendChild(optionElement);
		}

		setTimeout(() =>
		{
			for (const element of this.optionElements.slice(1))
			{
				addHoverEvent({ element });
			}

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
					if (document.startViewTransition && siteSettings.reduceMotion)
					{
						document.startViewTransition(() => this.open(0));
					}

					else
					{
						this.open();
					}
				}
			});

			if (this.persistState)
			{
				const value = new URLSearchParams(window.location.search).get(this.element.id);
				
				if (value)
				{
					setTimeout(() =>
					{
						this.setValue({
							newValue: decodeURIComponent(value),
							instant: true,
						});
						this.loadResolve();
					}, 10);
				}

				else
				{
					this.loadResolve();
				}

				addTemporaryParam(this.element.id);
			}

			else
			{
				this.loadResolve();
			}
		}, 16);
	}

	async open(animationTime = opacityAnimationTime)
	{
		this.isOpen = true;

		this.buttonElement.classList.add("expanded");
		this.buttonElement.classList.add("no-hover");

		const buttonElementTransformStyle = getComputedStyle(this.buttonElement).transform;
		
		const buttonElementScale = buttonElementTransformStyle === "none" ? 1 : parseFloat(
			buttonElementTransformStyle.slice(
				buttonElementTransformStyle.indexOf("(") + 1,
				buttonElementTransformStyle.indexOf(",")
			)
		);

		let titleWidth = 0;
		let maxWidth1 = 0;
		let maxWidth2 = 0;

		for (const [index, element] of this.optionElements.entries())
		{
			if (index === 0)
			{
				titleWidth = element.getBoundingClientRect().width / buttonElementScale;
			}

			else if (index % 2 === 0)
			{
				maxWidth1 = Math.max(
					maxWidth1,
					element.getBoundingClientRect().width / buttonElementScale
				);
			}

			else
			{
				maxWidth2 = Math.max(
					maxWidth2,
					element.getBoundingClientRect().width / buttonElementScale
				);
			}
		}

		const maxWidth = Math.max(
			this.optionContainerElement.classList.contains("two-column")
				? maxWidth1 + maxWidth2
				: Math.max(maxWidth1, maxWidth2),
			titleWidth
		);

		const openHeight = this.optionContainerElement.getBoundingClientRect().height
			/ buttonElementScale + 4;
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
		
		const topWhenOpen = (rect.top + rect.height / buttonElementScale / 2)
			- effectiveOpenHeight / 2;
		const bottomWhenOpen = (rect.bottom - rect.height / buttonElementScale / 2)
			+ effectiveOpenHeight / 2;

		const leftWhenOpen = (rect.left + rect.width / buttonElementScale / 2)
			- effectiveOpenWidth / 2;
		const rightWhenOpen = (rect.right - rect.width / buttonElementScale / 2)
			+ effectiveOpenWidth / 2;

		

		const safeAreaInsetTop = parseFloat(
			window.getComputedStyle(document.documentElement)
				.getPropertyValue("--safe-area-inset-top")
				.slice(0, -2)
		);
		
		const safeAreaInsetBottom = parseFloat(
			window.getComputedStyle(document.documentElement)
				.getPropertyValue("--safe-area-inset-bottom")
				.slice(0, -2)
		);

		const safeAreaInsetLeft = parseFloat(
			window.getComputedStyle(document.documentElement)
				.getPropertyValue("--safe-area-inset-left")
				.slice(0, -2)
		);

		const safeAreaInsetRight = parseFloat(
			window.getComputedStyle(document.documentElement)
				.getPropertyValue("--safe-area-inset-right")
				.slice(0, -2)
		);

		let translateY = 0;

		if (bottomWhenOpen > window.innerHeight - 10 - safeAreaInsetBottom)
		{
			translateY = window.innerHeight - 10 - safeAreaInsetBottom - bottomWhenOpen;
		}

		else if (topWhenOpen < 10 + headerHeight + safeAreaInsetTop)
		{
			translateY = 10 + headerHeight + safeAreaInsetTop - topWhenOpen;
		}



		let translateX = 0;

		if (rightWhenOpen > window.innerWidth - 10 - safeAreaInsetRight)
		{
			translateX = window.innerWidth - 10 - safeAreaInsetRight - rightWhenOpen;
		}

		else if (leftWhenOpen < 10 + safeAreaInsetLeft)
		{
			translateX = 10 + safeAreaInsetLeft - leftWhenOpen;
		}

		if (!animationTime)
		{
			this.buttonElement.style.height = openHeight + "px";
			this.buttonElement.style.width = openWidth + "px";
			this.buttonElement.style.transform = `translateY(${translateY}px) translateX(${translateX}px) scale(${this.scale})`;

			this.optionContainerElement.style.transform = "translateX(0px) translateY(0px)";
		}

		else
		{
			await Promise.all([
				anime({
					targets: this.buttonElement,
					height: openHeight,
					width: openWidth,
					translateY,
					translateX,
					scale: this.scale,
					easing: "easeOutQuad",
					duration: animationTime
				}).finished,

				anime({
					targets: this.optionContainerElement,
					translateY: 0,
					translateX: 0,
					easing: "easeOutQuad",
					duration: animationTime
				}).finished,
			]);
		}

		document.documentElement.addEventListener("click", this.boundClose);
	}

	async close(e)
	{
		let element = document.elementFromPoint(e.clientX, e.clientY);

		while (!element.hasAttribute("data-option-index") && element.tagName !== "HTML")
		{
			element = element.parentNode;
		}

		await this.setValue({
			newValue: element.getAttribute("data-option-name"),
			fromOnClickHandler: true
		});
	}

	// Sets the value of the dropdown and closes it.
	// If it's open, it will animate to the new value, and otherwise it will change instantly.
	// Can pass null to reset to the default value.
	async setValue({
		newValue,
		instant = false,
		fromOnClickHandler = false
	}) {
		if (document.startViewTransition && siteSettings.reduceMotion)
		{
			document.startViewTransition(
				() => this.#setValue({ newValue, instant: true, fromOnClickHandler })
			);
		}

		else
		{
			this.#setValue({ newValue, instant, fromOnClickHandler });
		}
	}

	async #setValue({
		newValue,
		instant = false,
		fromOnClickHandler = false
	}) {
		document.documentElement.removeEventListener("click", this.boundClose);

		this.isOpen = false;

		const oldSelectedItem = this.selectedItem;
		
		if (newValue)
		{
			const element = this.optionContainerElement.querySelector(`[data-option-name="${newValue}"]`);

			// Using || rather than ?? handles both the case where we click the background
			// and clicking the title option.
			this.selectedItem = parseInt(
				element.getAttribute("data-option-index") ?? this.selectedItem
			);

			if (this.selectedItem === 0 && fromOnClickHandler)
			{
				this.selectedItem = oldSelectedItem;
			}
		}

		this.element.value = this.selectOptionElements[this.selectedItem].value;
		this.value = this.element.value;

		if (oldSelectedItem !== this.selectedItem && this.selectedItem)
		{
			try { this.onInput(fromOnClickHandler); }
			
			// eslint-disable-next-line no-unused-vars
			catch(_ex) { /* No onInput */ }
		}

		if (this.returnToTitleOnSelect)
		{
			this.selectedItem = 0;
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



		if (this.persistState)
		{
			const searchParams = new URLSearchParams(window.location.search);

			if (this.selectedItem !== 0)
			{
				searchParams.set(
					this.element.id,
					encodeURIComponent(
						this.optionElements[this.selectedItem].getAttribute("data-option-name")
					)
				);
			}

			else
			{
				searchParams.delete(this.element.id);
			}

			const string = searchParams.toString();

			window.history.replaceState(
				{ url: pageUrl },
				"",
				pageUrl.replace(/\/home/, "") + "/" + (string ? `?${string}` : "")
			);
		}
		


		this.buttonElement.classList.remove("expanded");

		if (instant)
		{
			for (const element of [this.buttonElement, this.buttonElement.parentNode.parentNode])
			{
				element.style.height = this.optionElements[this.selectedItem]
					.getBoundingClientRect().height / this.scale + 4 + "px";

				element.style.width = this.optionElements[this.selectedItem]
					.getBoundingClientRect().width + 16 + "px";

				element.style.transform = "translateY(0px) translateX(0px) scale(1)";
			}

			this.optionContainerElement.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
		}

		else
		{
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

		this.buttonElement.classList.remove("no-hover");
	}
}