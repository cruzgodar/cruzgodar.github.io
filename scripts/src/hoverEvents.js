import { changeScale } from "./animation.js";
import { currentlyTouchDevice } from "./interaction.js";
import { $$ } from "./main.js";
import { prefetchPage } from "./navigation.js";
import { siteSettings } from "./settings.js";

const elementSelectors = [
	["a", 1, () => false],
	[".carousel-dot", 1, () => false]
];

// These elements need to have their scale increased when hovered.
const elementSelectorsWithScale =
{
	"#logo img": {
		scale: 1.035,
		addBounceOnTouch: () => false,
		preventScaleWithIncreasedContrast: false
	},
	".text-button:not(.dropdown, .nav-button)": {
		scale: 1.075,
		addBounceOnTouch: () => true,
		preventScaleWithIncreasedContrast: false
	},
	".text-button.dropdown": {
		scale: 1.075,
		addBounceOnTouch: () => false,
		preventScaleWithIncreasedContrast: false
	},
	".text-button.nav-button": {
		scale: 1.075,
		addBounceOnTouch: () => false,
		preventScaleWithIncreasedContrast: false
	},
	".checkbox-container": {
		scale: 1.1,
		addBounceOnTouch: () => true,
		preventScaleWithIncreasedContrast: false
	},
	".image-link a[data-card-id] img": {
		scale: 1.035,
		addBounceOnTouch: () => true,
		preventScaleWithIncreasedContrast: false
	},
	".image-link a:not([data-card-id]) img": {
		scale: 1.035,
		addBounceOnTouch: () => false,
		preventScaleWithIncreasedContrast: false
	},
	".gallery-image-1-1 img": {
		scale: 1.075,
		addBounceOnTouch: () => true,
		preventScaleWithIncreasedContrast: true
	},
	".gallery-image-2-2 img": {
		scale: 1.0375,
		addBounceOnTouch: () => true,
		preventScaleWithIncreasedContrast: true
	},
	".gallery-image-3-3 img": {
		scale: 1.025,
		addBounceOnTouch: () => true,
		preventScaleWithIncreasedContrast: true
	},
};


// Adds a listener to every element that needs a hover event.
export function initHoverEvents()
{
	for (const selector of elementSelectors)
	{
		for (const element of $$(selector[0]))
		{
			addHoverEventWithScale({
				element,
				scale: selector[1],
				addBounceOnTouch: selector[2]
			});
		}
	}
	
	for (const [selector, options] of Object.entries(elementSelectorsWithScale))
	{
		for (const element of $$(selector))
		{
			addHoverEventWithScale({
				element,
				scale: options.scale,
				addBounceOnTouch: options.addBounceOnTouch,
				preventScaleWithIncreasedContrast:
					options.preventScaleWithIncreasedContrast
			});
		}
	}

	for (const element of $$("a"))
	{
		element.addEventListener("mouseenter", () =>
		{
			if (element.href[0] === "/")
			{
				prefetchPage(element.href);
			}
		});
	}
}

export function addHoverEvent({
	element,
	scale = 1.1,
	addBounceOnTouch = () => false,
	// eslint-disable-next-line no-unused-vars
	callback = (isHovering) => {}
}) {
	element.addEventListener("mouseenter", () =>
	{
		if (!currentlyTouchDevice && !element.classList.contains("no-hover"))
		{
			element.classList.add("hover");

			if (element.tagName === "SELECT")
			{
				element.previousElementSibling.classList.add("hover");
			}

			else if (element.classList.contains("dropdown-container"))
			{
				element.firstElementChild.classList.add("hover");
			}

			callback(true);
		}
	});

	element.addEventListener("mouseleave", () =>
	{
		if (!currentlyTouchDevice && !element.classList.contains("no-hover"))
		{
			element.classList.remove("hover");

			if (element.tagName === "SELECT")
			{
				element.previousElementSibling.classList.remove("hover");
			}

			else if (element.classList.contains("dropdown-container"))
			{
				element.firstElementChild.classList.remove("hover");
			}

			else
			{
				element.blur();
			}

			callback(false);
		}
	});

	element.addEventListener("touchstart", async () =>
	{
		if (
			addBounceOnTouch()
				&& !siteSettings.reduceMotion
				&& !element.classList.contains("no-hover")
		) {
			await changeScale({ element, scale, duration: 100 });
			changeScale({ element, scale: 1, duration: 100 });
		}
	});
}

export function addHoverEventWithScale({
	element,
	scale,
	addBounceOnTouch = () => false,
	preventScaleWithIncreasedContrast = false,
	// eslint-disable-next-line no-unused-vars
	callback = (isHovering) => {}
}) {
	element.addEventListener("mouseenter", () =>
	{
		if (!currentlyTouchDevice && !element.classList.contains("no-hover"))
		{
			if (element.tagName === "SELECT")
			{
				element = element.previousElementSibling;
			}

			element.classList.add("hover");

			callback(true);

			if (siteSettings.reduceMotion)
			{
				element.classList.add("hover-reduce-motion");

				return;
			}

			if (siteSettings.increaseContrast && preventScaleWithIncreasedContrast)
			{
				return;
			}

			changeScale({ element, scale });
		}
	});

	element.addEventListener("mouseleave", () =>
	{
		if (!currentlyTouchDevice && !element.classList.contains("no-hover"))
		{
			if (element.tagName === "SELECT")
			{
				element = element.previousElementSibling;
			}

			element.classList.remove("hover");
			element.classList.remove("hover-reduce-motion");

			callback(false);

			changeScale({ element, scale: 1 });
		}
	});

	element.addEventListener("touchstart", async () =>
	{
		if (
			addBounceOnTouch()
				&& !siteSettings.reduceMotion
				&& !element.classList.contains("no-hover")
		) {
			await changeScale({ element, scale, duration: 100 });
			changeScale({ element, scale: 1, duration: 100 });
		}
	});
}

export function removeHoverEvents()
{
	const globalSelector = elementSelectors.map(selector => selector[0])
		.concat(Object.keys(elementSelectorsWithScale))
		.join(",");

	for (const element of $$(globalSelector))
	{
		element.classList.remove("hover");
	}
}

export function initFocusEvents()
{
	for (const element of $$(".focus-on-child"))
	{
		element.addEventListener("focus", () =>
		{
			element.children[0].focus();
		});
	}
}