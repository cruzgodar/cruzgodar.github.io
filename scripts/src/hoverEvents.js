import { changeScale } from "./animation.js";
import { currentlyTouchDevice } from "./interaction.js";
import { $$ } from "./main.js";
import { prefetchPage } from "./navigation.js";

const elementSelectors = `
	a,
	.carousel-dot
`;

// These elements need to have their scale increased when hovered.
const elementSelectorsWithScale =
[
	["#logo img", 1.05, false],
	[".text-button:not(.dropdown)", 1.075, true],
	[".checkbox-container", 1.1, false],
	[".radio-button-container", 1.1, false],
	[".image-link a[data-card-id] img", 1.05, true],
	[".image-link a:not([data-card-id]) img", 1.05, false],
	["#enter-fullscreen-button", 1.1, false],
	["#exit-fullscreen-button", 1.1, false],
	[".gallery-image-1-1 img", 1.075, true],
	[".gallery-image-2-2 img", 1.0375, true],
	[".gallery-image-3-3 img", 1.025, true],
];



// Adds a listener to every element that needs a hover event.
export function initHoverEvents()
{
	$$(elementSelectors).forEach(element => addHoverEvent(element));

	elementSelectorsWithScale.forEach(selector =>
	{
		$$(selector[0]).forEach(element =>
		{
			addHoverEventWithScale({
				element,
				scale: selector[1],
				addBounceOnTouch: selector[2]
			});
		});
	});

	$$("a").forEach(element =>
	{
		element.addEventListener("mouseenter", () =>
		{
			if (element.href[0] === "/")
			{
				prefetchPage(element.href);
			}
		});
	});
}

export function addHoverEvent(element)
{
	element.addEventListener("mouseenter", () =>
	{
		if (!currentlyTouchDevice)
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
		}
	});

	element.addEventListener("mouseleave", () =>
	{
		if (!currentlyTouchDevice)
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
		}
	});
}

export function addHoverEventWithScale({ element, scale, addBounceOnTouch = false })
{
	element.addEventListener("mouseenter", () =>
	{
		if (!currentlyTouchDevice)
		{
			if (element.tagName === "SELECT")
			{
				element = element.previousElementSibling;
			}

			element.classList.add("hover");

			changeScale({ element, scale });
		}
	});

	element.addEventListener("mouseleave", () =>
	{
		if (!currentlyTouchDevice)
		{
			if (element.tagName === "SELECT")
			{
				element = element.previousElementSibling;
			}

			element.classList.remove("hover");

			changeScale({ element, scale: 1 });
		}
	});

	if (addBounceOnTouch)
	{
		element.addEventListener("touchstart", async () =>
		{
			await changeScale({ element, scale, duration: 100 });
			changeScale({ element, scale: 1, duration: 100 });
		});
	}
}

export function removeHoverEvents()
{
	$$(elementSelectors).forEach(element => element.classList.remove("hover"));
}

export function initFocusEvents()
{
	$$(".focus-on-child").forEach(element =>
	{
		element.addEventListener("focus", () =>
		{
			element.children[0].focus();
		});
	});
}