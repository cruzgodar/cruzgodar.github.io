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
	boundClose;

	constructor({
		element,
		name,
		appletControlElement
	}) {
		super({ element, name });

		this.appletControlElement = appletControlElement;

		this.boundClose = () => this.close();

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



	async open(animationTime = 150)
	{
		if (this.isOpen)
		{
			return;
		}

		this.isOpen = true;

		this.appletControlElement.classList.add("expanded");
		this.appletControlElement.classList.add("no-hover");


		const computed = getComputedStyle(this.appletControlElement);

		// The computed style is live, so these need to be captured before they're overwritten.
		// This includes any in-progress hover scale transition.
		const originalTransform = computed.transform;
		const originalScale = computed.scale;

		// Stop a pending changeScale from resetting the transition mid-animation.
		clearTimeout(this.appletControlElement.getAttribute("data-scale-timeout-id"));

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
			{ left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`, transform: originalTransform, scale: originalScale },
			{ left: "0px", width: `${screenWidth}px`, height: `${finalHeight}px`, transform: "none", scale: "none" }
		], { duration: animationTime, easing: "cubic-bezier(0.5, 1, 0.89, 1)" }).finished;

		document.documentElement.addEventListener("click", this.boundClose);
	}

	async close()
	{
		if (this.isOpen)
		{
			if (document.startViewTransition && siteSettings.reduceMotion)
			{
				document.startViewTransition(() => this.#close(0));
			}

			else
			{
				this.#close();
			}
		}
	}

	async #close(animationTime = 150)
	{
		const expandedData = expandedElements.get(this.appletControlElement);

		if (!expandedData)
		{
			return;
		}

		// Removing this immediately prevents a second close from starting mid-animation.
		expandedElements.delete(this.appletControlElement);

		const { placeholder, originalCssText } = expandedData;

		// The placeholder is still in the original grid cell, so it's the destination
		// even if the page has scrolled or reflowed since opening.
		const startRect = this.appletControlElement.getBoundingClientRect();
		const endRect = placeholder.getBoundingClientRect();

		const animation = this.appletControlElement.animate([
			{
				top: `${startRect.top + window.scrollY}px`,
				left: `${startRect.left}px`,
				width: `${startRect.width}px`,
				height: `${startRect.height}px`
			},
			{
				top: `${endRect.top + window.scrollY}px`,
				left: `${endRect.left}px`,
				width: `${endRect.width}px`,
				height: `${endRect.height}px`
			}
		], {
			duration: animationTime,
			easing: "cubic-bezier(0.5, 1, 0.89, 1)",
			// Holds the final frame until the inline styles are restored, so there's no flash.
			fill: "forwards"
		});

		await animation.finished;

		// The original inline styles include any hover scale it had when it was opened,
		// so that's cleared to return it at scale 1.
		this.appletControlElement.style.cssText = originalCssText;
		this.appletControlElement.style.transform = "";
		this.appletControlElement.style.scale = "";
		this.appletControlElement.style.transition = "";

		this.appletControlElement.classList.remove(
			"expanded",
			"no-hover",
			"hover",
			"hover-reduce-motion"
		);

		placeholder.remove();
		animation.cancel();

		this.isOpen = false;

		document.documentElement.removeEventListener("click", this.boundClose);
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