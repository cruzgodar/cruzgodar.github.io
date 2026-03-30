import { currentlyLoadedApplets } from "../applets/applet.js";
import { cardIsOpen, closeCard } from "./cards.js";
import { desmosGraphs, desmosGraphsDefaultState } from "./desmos.js";
import { exitFullscreen, getAnyFullscreenElement, isFullscreen } from "./fullscreen.js";
import { accessibilityDialogOpen, hideAccessibilityDialog } from "./header.js";
import { removeHoverEvents } from "./hoverEvents.js";
import { addTemporaryListener } from "./main.js";
import { contentsShown, hideContents } from "./pageContent.js";

// Whether this is a touchscreen device on the current page.
// It's assumed to be false on every page until a touchstart or touchmove
// event is detected, at which point it's set to true.
export let currentlyTouchDevice =
	"ontouchstart" in window
	|| navigator.maxTouchPoints > 0
	|| navigator.msMaxTouchPoints > 0;

let lastMousemoveEvent = 0;

export function initInteractionListeners()
{
	document.documentElement.addEventListener("touchstart", handleTouchEvent, false);
	document.documentElement.addEventListener("touchmove", handleTouchEvent, false);

	document.documentElement.addEventListener("mousemove", () =>
	{
		if (currentlyTouchDevice)
		{
			const timeBetweenMousemoves = Date.now() - lastMousemoveEvent;

			lastMousemoveEvent = Date.now();

			// Checking if it's >= 3 kinda sucks, but it seems like touch devices
			// like to fire two mousemoves in quick succession sometimes.
			// They also like to make that delay exactly 33.
			// Look, I hate this too, but it needs to be here.
			if (
				timeBetweenMousemoves >= 3
				&& timeBetweenMousemoves <= 50
				&& timeBetweenMousemoves !== 33
			) {
				currentlyTouchDevice = false;

				updateTapClickElements();
			}
		}
	});



	document.documentElement.addEventListener("keydown", (e) =>
	{
		if (e.key === "Escape")
		{
			const fullscreenEl = getAnyFullscreenElement();

			if (fullscreenEl)
			{
				e.preventDefault();
				exitFullscreen({ element: fullscreenEl });
			}

			else if (cardIsOpen)
			{
				e.preventDefault();
				closeCard();
			}

			else if (accessibilityDialogOpen)
			{
				e.preventDefault();
				hideAccessibilityDialog();
			}

			else if (contentsShown)
			{
				e.preventDefault();
				hideContents();
			}
		}

		// Click the focused element when the enter key is pressed.
		if (e.key === "Enter")
		{
			if (
				!(
					document.activeElement.tagName === "BUTTON"
					|| (
						document.activeElement.tagName === "INPUT"
						&& document.activeElement.getAttribute("type") !== "button"
					)
				)
			) {
				document.activeElement.click();
			}
		}
	});
}

function handleTouchEvent()
{
	if (
		document.activeElement.tagName !== "INPUT"
		&& document.activeElement.tagName !== "TEXTAREA"
		&& document.activeElement.tagName !== "SELECT"
		&& document.activeElement.getAttribute("contenteditable") !== "true"
	) {
		document.activeElement.blur();
	}

	if (!currentlyTouchDevice)
	{
		removeHoverEvents();

		currentlyTouchDevice = true;

		updateTapClickElements();
	}
}

export function updateTapClickElements()
{
	const tapClickElements = Array.from(document.body.querySelectorAll("span.click-tap"));

	for (const tapClickElement of tapClickElements)
	{
		if (currentlyTouchDevice)
		{
			tapClickElement.firstElementChild.style.display = "none";
			tapClickElement.lastElementChild.style.display = "inline";
		}

		else
		{
			tapClickElement.firstElementChild.style.display = "inline";
			tapClickElement.lastElementChild.style.display = "none";
		}
	}
}



function handleFullscreenButtonPress()
{
	const desmosFullscreenButtons = document.querySelectorAll(".desmos-fullscreen-button");

	// Check if any desmos graph is currently fullscreen.
	for (const button of desmosFullscreenButtons)
	{
		const border = button.closest(".desmos-border");

		if (isFullscreen(border))
		{
			button.click();
			return;
		}
	}

	let minDistance = Infinity;
	let minIndex = 0;

	for (let i = 0; i < currentlyLoadedApplets.length; i++)
	{
		const applet = currentlyLoadedApplets[i];

		if (!applet.allowFullscreenWithKeyboard || applet.destroyed)
		{
			continue;
		}

		const wilson = applet.wilsonForFullscreen ?? applet.wilson;

		if (wilson.currentlyFullscreen)
		{
			wilson.exitFullscreen();
			return;
		}

		const rect = applet.canvas.getBoundingClientRect();

		if (rect.bottom < 0 || rect.top > window.innerHeight)
		{
			continue;
		}

		const center = rect.top + rect.height / 2;
		const distance = Math.abs(window.innerHeight / 2 - center);

		if (distance < minDistance)
		{
			minDistance = distance;
			minIndex = i;
		}
	}

	// Check on-screen desmos graphs.
	let bestDesmosButton = null;

	for (const button of desmosFullscreenButtons)
	{
		const border = button.closest(".desmos-border");
		const rect = border.getBoundingClientRect();

		if (rect.bottom < 0 || rect.top > window.innerHeight)
		{
			continue;
		}

		const center = rect.top + rect.height / 2;
		const distance = Math.abs(window.innerHeight / 2 - center);

		if (distance < minDistance)
		{
			minDistance = distance;
			bestDesmosButton = button;
		}
	}

	// If a desmos graph is closer, click its fullscreen button.
	if (bestDesmosButton)
	{
		bestDesmosButton.click();
		return;
	}

	// Otherwise, use the closest applet (original logic).
	if (
		currentlyLoadedApplets.length === 0
		|| !currentlyLoadedApplets[minIndex]?.allowFullscreenWithKeyboard
	) {
		return;
	}

	const applet = currentlyLoadedApplets[minIndex];

	if (!applet.canvas || !document.body.contains(applet.canvas))
	{
		return;
	}

	const rect = applet.canvas.getBoundingClientRect();
	if (rect.bottom < 0 || rect.top > window.innerHeight)
	{
		return;
	}

	const wilson = currentlyLoadedApplets[minIndex].wilsonForFullscreen
		?? currentlyLoadedApplets[minIndex].wilson;

	wilson.enterFullscreen();
}

function handleResetButtonPress()
{
	let minDistance = Infinity;
	let minIndex = 0;

	for (let i = 0; i < currentlyLoadedApplets.length; i++)
	{
		const applet = currentlyLoadedApplets[i];

		if (!applet.allowResetWithKeyboard)
		{
			continue;
		}

		const rect = applet.canvas.getBoundingClientRect();
		const center = rect.top + rect.height / 2;
		const distance = Math.abs(window.innerHeight / 2 - center);

		if (distance < minDistance)
		{
			minDistance = distance;
			minIndex = i;
		}
	}

	// Check on-screen desmos graphs.
	let bestDesmosId = null;

	const desmosElements = document.querySelectorAll(".desmos-border");

	for (const border of desmosElements)
	{
		const graphElement = border.querySelector(".desmos-container");

		if (!graphElement || !desmosGraphs[graphElement.id])
		{
			continue;
		}

		const rect = border.getBoundingClientRect();

		if (rect.bottom < 0 || rect.top > window.innerHeight)
		{
			continue;
		}

		const center = rect.top + rect.height / 2;
		const distance = Math.abs(window.innerHeight / 2 - center);

		if (distance < minDistance)
		{
			minDistance = distance;
			bestDesmosId = graphElement.id;
		}
	}

	// If a desmos graph is closer, reset it.
	if (bestDesmosId)
	{
		desmosGraphs[bestDesmosId].setState(desmosGraphsDefaultState[bestDesmosId]);
		return;
	}

	// Otherwise, reset the closest applet.
	if (
		currentlyLoadedApplets.length === 0
		|| !currentlyLoadedApplets[minIndex]?.allowResetWithKeyboard
	) {
		return;
	}

	const wilson = currentlyLoadedApplets[minIndex].wilsonForReset
		?? currentlyLoadedApplets[minIndex].wilson;

	wilson.reset();
}

export function listenForWilsonButtons()
{
	addTemporaryListener({
		object: document.documentElement,
		event: "keydown",
		callback: e =>
		{
			if (
				e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
				|| document.activeElement.tagName === "INPUT"
				|| document.activeElement.tagName === "TEXTAREA"
			) {
				return;
			}

			if (e.key === "f")
			{
				setTimeout(() =>
				{
					if (!document.fullscreenElement)
					{
						handleFullscreenButtonPress();
					}
				}, 0);
			}

			if (e.key === "r")
			{
				handleResetButtonPress();
			}
		}
	});
}