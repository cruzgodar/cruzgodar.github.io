import { headerElement } from "../src/header.js";
import { addTemporaryListener } from "../src/main.js";
import { siteSettings } from "../src/settings.js";
import { clamp } from "../src/utils.js";

// Includes both input elements and buttons
export class AppletControl
{
	element;
	name;
	disabled = false;
	loaded;
	loadResolve;

	constructor({ element, name })
	{
		this.element = element;
		this.name = name;
		this.loaded = new Promise(resolve => this.loadResolve = resolve);
	}
}

const expandedControlBoxShadow = "0px 0px 16px 0px rgba(0, 0, 0, .25)";

const valueElementBoxShadow = "0px 0px 4px 0px inset rgba(0, 0, 0, calc(1 - var(--theme)))";
const valueElementBoxShadowOff = "0px 0px 4px 0px inset rgba(0, 0, 0, 0)";
const valueElementOutline = "1px solid rgba(255, 255, 255, var(--theme))";
const valueElementOutlineOff = "1px solid rgba(255, 255, 255, 0)";

export const appletControlEasing = "cubic-bezier(0.5, 1, 0.89, 1)";

// The base class for number, string, boolean, and dropdown inputs. Those all handle the specifics
// of what elements they put in, what events they listen for, etc. This class handles the resizing.

const expandedElements = new Map();

export function resetExpandedAppletControls()
{
	expandedElements.clear();
}

export class AppletInputControl extends AppletControl
{
	appletControlElement;

	nameElement;
	valueElement;
	nameValueElement;

	value;
	defaultValue;
	#isExpanded = false;
	#boundOnPointerdown;
	#boundOnKeydown;
	onInput;

	constructor({
		element,
		name,
		value,
		onInput = () => {},
		appletControlElement
	}) {
		super({ element, name });

		this.appletControlElement = appletControlElement;
		this.valueElement = this.appletControlElement.querySelector(".applet-input-control-value");
		this.nameElement = this.appletControlElement.querySelector(".applet-input-control-name");

		this.nameValueElement = this.appletControlElement.querySelector(".name-value");

		if (!this.valueElement || !this.nameElement)
		{
			throw new Error("Cannot initialize an input control without a name and value");
		}

		this.nameElement.innerHTML = name;

		this.value = value;
		this.defaultValue = value;
		this.setValue({
			value: this.value,
			callOnInput: false,
		});

		this.#boundOnPointerdown = (e) =>
		{
			if (!e.composedPath().includes(this.appletControlElement))
			{
				this.contract();
			}
		};

		this.#boundOnKeydown = (e) =>
		{
			if (e.key === "Escape")
			{
				this.contract();
			}

			else if (e.key === "Enter" && e.composedPath().includes(this.valueElement))
			{
				e.preventDefault();
				this.contract();
			}
		};

		this.appletControlElement.addEventListener("click", (e) =>
		{
			if (!this.#isExpanded)
			{
				if (document.startViewTransition && siteSettings.reduceMotion)
				{
					document.startViewTransition(() => this.expand(e.pointerType === "mouse", 0));
				}

				else
				{
					this.expand(e.pointerType === "mouse");
				}
			}
		});

		addTemporaryListener({
			object: window,
			event: "resize",
			callback: () => this.onResize()
		});
	}



	setValue({
		value,
		callOnInput = true
	}) {
		this.value = value;

		if (isNaN(this.value))
		{
			this.value = this.defaultValue;
		}

		// const sliderProportion = this.logarithmic
		// 	? (Math.log(this.value) - this.logMin) / (this.logMax - this.logMin)
		// 	: (this.value - this.min) / (this.max - this.min);

		// const clampedSliderProportion = clamp(sliderProportion, 0, 1);

		// void(this.trackElement.offsetWidth);

		// const trackRect = this.trackElement.getBoundingClientRect();
		// const maxX = trackRect.width - thumbWidth - 2.5 * 2;
		// this.element.style.left = `${clampedSliderProportion * maxX}px`;

		this.updateDisplayValue();

		this.valueElement.textContent = this.displayValue;
	}

	// Overridden by subclasses if they need to edit the displayed value.
	updateDisplayValue()
	{
		this.displayValue = this.value;
	}



	async expand(focus = false, animationTime = 200)
	{
		if (this.#isExpanded || expandedElements.size > 0)
		{
			return;
		}

		this.#isExpanded = true;

		this.beforeExpand();



		this.appletControlElement.classList.add("expanded");
		this.appletControlElement.classList.add("no-hover");
		this.valueElement.setAttribute("contenteditable", "true");

		if (focus)
		{
			this.valueElement.focus();

			const range = document.createRange();
			range.selectNodeContents(this.valueElement);

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}


		// Cache any current tranform
		const computed = getComputedStyle(this.appletControlElement);
		const originalTransform = computed.transform;
		const originalScale = computed.scale;

		this.appletControlElement.style.transition = "none";
		this.appletControlElement.style.transform = "none";
		this.appletControlElement.style.scale = "none";

		// Stop a pending changeScale from resetting the transition mid-animation.
		clearTimeout(this.appletControlElement.getAttribute("data-scale-timeout-id"));

		const appletControlRect = this.appletControlElement.getBoundingClientRect();
		const nameValueElementLeft = this.nameValueElement.getBoundingClientRect().left
			- appletControlRect.left;
		

		// Holds the element's grid cell and row height so nothing reflows.
		const placeholder = document.createElement("div");
		placeholder.style.gridColumn = computed.gridColumn;
		placeholder.style.gridRow = computed.gridRow;
		placeholder.style.height = `${appletControlRect.height}px`;
		placeholder.style.visibility = "hidden";
		this.appletControlElement.before(placeholder);

		expandedElements.set(this.appletControlElement, {
			placeholder,
			originalCssText: this.appletControlElement.style.cssText,
		});


		// Now find the expanded rect.
		const controlContainerRect = this.appletControlElement.parentElement
			.getBoundingClientRect();

		Object.assign(this.appletControlElement.style, {
			position: "absolute",
			top: `${appletControlRect.top + window.scrollY}px`,
			left: `${controlContainerRect.left}px`,
			width: `${controlContainerRect.width}px`,
			maxWidth: "none",
			height: "auto",
			margin: "0",
			boxSizing: "border-box",
			zIndex: 51,
			justifyContent: "flex-start",
			boxShadow: expandedControlBoxShadow,
			transition: "none",
			transform: "none",
			scale: "none",
		});

		Object.assign(this.valueElement.style, {
			boxShadow: valueElementBoxShadow,
			outline: valueElementOutline,
			paddingLeft: "4px",
			paddingRight: "4px",
			paddingTop: "2px",
			paddingBottom: "2px",
		});

		this.resetToExpandedState();

		// Natural height at full width.
		const expandedAppletControlHeight = this.appletControlElement
			.getBoundingClientRect().height;

		// Move the expanded rect above the rest of the controls, including the 8px padding.
		const expandedAppletControlTop = controlContainerRect.top + window.scrollY
			- expandedAppletControlHeight - 8;

		// Move the name-value element to its final position.

		const nameValueElementFinalLeft = this.nameValueElement.getBoundingClientRect().left
			- controlContainerRect.left;

		const nameValueElementDistance = nameValueElementLeft - nameValueElementFinalLeft;

		this.appletControlElement.style.pointerEvents = "none";



		// Account for the header to guarantee the expanded element is on-screen.
		const headerHeight = headerElement.getBoundingClientRect().height;

		const expandedAppletControlTopClamped = clamp(
			expandedAppletControlTop,
			window.scrollY + headerHeight + 8,
			window.scrollY + window.innerHeight - 8
		);

		this.appletControlElement.style.top = `${expandedAppletControlTopClamped}px`;
		
		

		const expandAppletControlAnimation = this.appletControlElement.animate([
			{
				top: `${appletControlRect.top + window.scrollY}px`,
				left: `${appletControlRect.left}px`,
				width: `${appletControlRect.width}px`,
				height: `${appletControlRect.height}px`,
				boxShadow: "none",
				transform: originalTransform,
				scale: originalScale
			},
			{
				top: `${expandedAppletControlTopClamped}px`,
				left: `${controlContainerRect.left}px`,
				width: `${controlContainerRect.width}px`,
				height: `${expandedAppletControlHeight}px`,
				boxShadow: expandedControlBoxShadow,
				transform: "none",
				scale: "none"
			}
		], { duration: animationTime, easing: appletControlEasing, fill: "forwards" });

		const moveNameValueElementAnimation = this.nameValueElement.animate([
			{ transform: `translateX(${nameValueElementDistance}px)` },
			{ transform: "translateX(0)" }
		], { duration: animationTime, easing: appletControlEasing, fill: "forwards" });

		const expandValueElementAnimation = this.valueElement.animate([
			{
				boxShadow: valueElementBoxShadowOff,
				outline: valueElementOutlineOff,
				paddingLeft: "0",
				paddingRight: "0",
				paddingTop: "0",
				paddingBottom: "0",
			},
			{
				boxShadow: valueElementBoxShadow,
				outline: valueElementOutline,
				paddingLeft: "4px",
				paddingRight: "4px",
				paddingTop: "2px",
				paddingBottom: "2px",
			},
		], { duration: animationTime, easing: appletControlEasing, fill: "forwards" });

		await Promise.all([
			expandAppletControlAnimation.finished,
			moveNameValueElementAnimation.finished,
			expandValueElementAnimation.finished,
			this.onExpand(animationTime, nameValueElementDistance),
		]);

		expandAppletControlAnimation.cancel();
		moveNameValueElementAnimation.cancel();
		expandValueElementAnimation.cancel();

		this.afterExpand();

		this.appletControlElement.style.pointerEvents = "auto";

		document.documentElement.addEventListener("pointerdown", this.#boundOnPointerdown);
		document.documentElement.addEventListener("keydown", this.#boundOnKeydown);
	}



	async contract()
	{
		if (this.#isExpanded)
		{
			if (document.startViewTransition && siteSettings.reduceMotion)
			{
				document.startViewTransition(() => this.#contract(0));
			}

			else
			{
				this.#contract();
			}
		}
	}

	async #contract(animationTime = 200)
	{
		const expandedData = expandedElements.get(this.appletControlElement);

		if (!expandedData)
		{
			return;
		}

		this.beforeContract();



		// Removing this immediately prevents a second close from starting mid-animation.
		expandedElements.delete(this.appletControlElement);

		const appletControlRect = this.appletControlElement.getBoundingClientRect();
		const nameValueElementLeft = this.nameValueElement.getBoundingClientRect().left
			- appletControlRect.left;

		const { placeholder, originalCssText } = expandedData;

		// First measure where everything should go.
		placeholder.remove();

		const cssText = this.appletControlElement.style.cssText;

		this.appletControlElement.style.cssText = originalCssText;
		this.appletControlElement.style.transform = "";
		this.appletControlElement.style.scale = "";
		this.appletControlElement.style.transition = "";

		Object.assign(this.valueElement.style, {
			boxShadow: valueElementBoxShadowOff,
			outline: valueElementOutlineOff,
			paddingLeft: "0",
			paddingRight: "0",
			paddingTop: "0",
			paddingBottom: "0",
		});

		this.valueElement.setAttribute("contenteditable", "false");

		this.resetToContractedState();



		const appletControlFinalRect = this.appletControlElement.getBoundingClientRect();
		const nameValueElementFinalLeft = this.nameValueElement.getBoundingClientRect().left
			- appletControlFinalRect.left;

		const nameValueElementDistance = nameValueElementFinalLeft - nameValueElementLeft;

		// Now put it all back so the animation works.
		this.appletControlElement.style.cssText = cssText;
		this.appletControlElement.before(placeholder);

		this.appletControlElement.style.pointerEvents = "none";
		this.appletControlElement.style.zIndex = 50;

		const contractAppletControlAnimation = this.appletControlElement.animate([
			{
				top: `${appletControlRect.top + window.scrollY}px`,
				left: `${appletControlRect.left}px`,
				width: `${appletControlRect.width}px`,
				boxShadow: expandedControlBoxShadow,
			},
			{
				top: `${appletControlFinalRect.top + window.scrollY}px`,
				left: `${appletControlFinalRect.left}px`,
				width: `${appletControlFinalRect.width}px`,
				boxShadow: "none",
			}
		], {
			duration: animationTime,
			easing: appletControlEasing,
			fill: "forwards"
		});

		const moveNameValueElementAnimation = this.nameValueElement.animate([
			{ transform: "translateX(0)" },
			{ transform: `translateX(${nameValueElementDistance}px)` }
		], { duration: animationTime, easing: appletControlEasing, fill: "forwards" });

		const contractValueElementAnimation = this.valueElement.animate([
			{
				boxShadow: valueElementBoxShadow,
				outline: valueElementOutline,
				paddingLeft: "4px",
				paddingRight: "4px",
				paddingTop: "2px",
				paddingBottom: "2px",
			},
			{
				boxShadow: valueElementBoxShadowOff,
				outline: valueElementOutlineOff,
				paddingLeft: "0",
				paddingRight: "0",
				paddingTop: "0",
				paddingBottom: "0",
			}
		], { duration: animationTime, easing: appletControlEasing, fill: "forwards" });

		await Promise.all([
			contractAppletControlAnimation.finished,
			moveNameValueElementAnimation.finished,
			contractValueElementAnimation.finished,
			this.onContract(animationTime, nameValueElementDistance)
		]);

		// And finally restore the inline styles.
		this.appletControlElement.style.cssText = originalCssText;
		placeholder.remove();

		this.appletControlElement.classList.remove(
			"expanded",
			"no-hover",
			"hover",
			"hover-reduce-motion"
		);

		
		contractAppletControlAnimation.cancel();
		moveNameValueElementAnimation.cancel();
		contractValueElementAnimation.cancel();

		this.#isExpanded = false;

		this.afterContract();

		document.documentElement.removeEventListener("pointerdown", this.#boundOnPointerdown);
		document.documentElement.removeEventListener("keydown", this.#boundOnKeydown);
	}

	// Classes that extend this can use these to add additional logic before/after the animation,
	// or additional animations entirely.

	beforeExpand() {}
	resetToExpandedState() {}
	async onExpand(_animationTime, _nameValueElementDistance) {}
	afterExpand() {}

	beforeContract() {}
	resetToContractedState() {}
	async onContract(_animationTime, _nameValueElementDistance) {}
	afterContract() {}

	onResize()
	{
		if (!this.#isExpanded)
		{
			return;
		}

		const controlContainerRect = this.appletControlElement.parentElement
			.getBoundingClientRect();

		Object.assign(this.appletControlElement.style, {
			left: `${controlContainerRect.left}px`,
			width: `${controlContainerRect.width}px`,
			height: "auto",
		});

		const expandedAppletControlHeight = this.appletControlElement
			.getBoundingClientRect().height;

		const finalTop = controlContainerRect.top + window.scrollY
			- expandedAppletControlHeight - 8;
		this.appletControlElement.style.top = `${finalTop}px`;
	}
}