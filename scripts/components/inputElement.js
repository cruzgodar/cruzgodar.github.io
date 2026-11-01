import { siteSettings } from "../src/settings.js";

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
	isOpen = false;

	constructor({
		element,
		name,
		appletControlElement
	}) {
		super({ element, name });

		this.appletControlElement = appletControlElement;

		this.appletControlElement.addEventListener("click", () =>
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
	}



	async open(animationTime = 1500)
	{
		if (this.isOpen)
		{
			return;
		}

		this.isOpen = true;

		console.log("hi");

		this.appletControlElement.classList.add("expanded");
		this.appletControlElement.classList.add("no-hover");


		const computed = getComputedStyle(this.appletControlElement);
		const originalTransform = computed.transform;
		const originalScale = computed.scale;
		const rect = getLayoutRect(this.appletControlElement);
		

		// Holds the element's grid cell and row height so nothing reflows.
		const placeholder = document.createElement("div");
		placeholder.style.gridColumn = computed.gridColumn;
		placeholder.style.gridRow = computed.gridRow;
		placeholder.style.height = `${rect.height}px`;
		placeholder.style.visibility = "hidden";
		this.appletControlElement.before(placeholder);

		expandedElements.set(this.appletControlElement, {
			placeholder,
			originalCssText: this.appletControlElement.style.cssText,
		});

		const screenWidth = document.documentElement.clientWidth;

		Object.assign(this.appletControlElement.style, {
			position: "absolute",
			top: `${rect.top + window.scrollY}px`,
			left: "0px",
			width: `${screenWidth}px`,
			maxWidth: "none",
			height: "auto",
			margin: "0",
			boxSizing: "border-box",
			zIndex: "1000",
			transition: "none",
			transform: "none",
			scale: "none"
		});

		// Natural height at full width.
		const finalHeight = this.appletControlElement.getBoundingClientRect().height;

		await this.appletControlElement.animate([
			{ left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`, transform: "none", scale: "none" },
			{ left: "0px", width: `${screenWidth}px`, height: `${finalHeight}px`, transform: "none", scale: "none" }
		], { duration: animationTime, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }).finished;

		// document.documentElement.addEventListener("click", this.boundClose);
	}
}



function getLayoutRect(element)
{
	const { transform, scale, transition } = element.style;

	element.style.transition = "none";
	element.style.transform = "none";
	element.style.scale = "none";

	const rect = element.getBoundingClientRect();

	element.style.transform = transform;
	element.style.scale = scale;
	element.style.transition = transition;

	return rect;
}