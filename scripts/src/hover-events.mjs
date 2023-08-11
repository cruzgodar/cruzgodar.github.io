import { changeScale } from "./animation.mjs"
import { showTex } from "./math.mjs";
import { siteSettings } from "./settings.mjs";

const elementSelectors = `
	a
`;

//These elements need to have their scale increased when hovered.
const elementSelectorsWithScale =
[
	["#logo img", 1.05],
	["#scroll-button", 1.1],
	[".text-button:not(.dropdown)", 1.075],
	["select", 1.075],
	[".checkbox-container", 1.1],
	[".radio-button-container", 1.1],
	[".image-link img", 1.05],
	["#enter-fullscreen-button", 1.1],
	["#exit-fullscreen-button", 1.1],
	[".gallery-image-1-1 img", 1.075],
	[".gallery-image-2-2 img", 1.0375],
	[".gallery-image-3-3 img", 1.025],
];



//Adds a listener to every element that needs a hover event.
export function setUpHoverEvents()
{
	$$(elementSelectors).forEach(element => addHoverEvent(element));
	
	elementSelectorsWithScale.forEach(selector =>
	{
		$$(selector[0]).forEach(element => addHoverEventWithScale(element, selector[1]));
	});
	
	$$(".card .tex-holder").forEach(element =>
	{
		addHoverEventForTexHolder(element);
		
		element.addEventListener("click", () => showTex(element));
	});
}

export function addHoverEvent(element)
{
	element.addEventListener("mouseenter", () =>
	{
		if (!Site.Interaction.currentlyTouchDevice)
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
		if (!Site.Interaction.currentlyTouchDevice)
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

export function addHoverEventWithScale(element, scale, forceJs = false)
{
	element.addEventListener("mouseenter", () =>
	{
		if (!Site.Interaction.currentlyTouchDevice)
		{
			if (element.tagName === "SELECT")
			{
				element = element.previousElementSibling;
			}
			
			element.classList.add("hover");
			
			changeScale(element, scale, Site.buttonAnimationTime);
		}
	});
	
	element.addEventListener("mouseleave", () =>
	{
		if (!Site.Interaction.currentlyTouchDevice)
		{
			if (element.tagName === "SELECT")
			{
				element = element.previousElementSibling;
			}
			
			element.classList.remove("hover");
			
			changeScale(element, 1, Site.buttonAnimationTime);
		}
	});
}

function addHoverEventForTexHolder(element)
{
	element.classList.add("active");
	
	element.addEventListener("mouseenter", () =>
	{
		if (!Site.Interaction.currentlyTouchDevice && element.getAttribute("data-showing-tex") !== "1")
		{
			element.classList.add("hover");
			
			anime({
				targets: element,
				scale: 1.05,
				borderRadius: "8px",
				duration: Site.buttonAnimationTime,
				easing: "easeOutQuad",
			});
		}
	});
	
	element.addEventListener("mouseleave", () =>
	{
		if (!Site.Interaction.currentlyTouchDevice)
		{
			element.classList.remove("hover");
			
			anime({
				targets: element,
				scale: 1,
				borderRadius: "0px",
				duration: Site.buttonAnimationTime,
				easing: "easeInOutQuad",
			});
		}
	});
}

export function removeHoverEvents()
{
	$$(elementSelectors).forEach(element => element.classList.remove("hover"));
}

export function setUpFocusEvents()
{
	$$(".focus-on-child").forEach(element =>
	{
		element.addEventListener("focus", () =>
		{
			element.children[0].focus();
		});
	});
}