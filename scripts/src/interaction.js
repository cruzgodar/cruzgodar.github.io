import { currentlyLoadedApplets } from "../applets/applet.js";
import { removeHoverEvents } from "./hoverEvents.js";
import { addTemporaryListener } from "./main.js";

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
	const boundFunction = handleTouchEvent.bind(this);

	document.documentElement.addEventListener("touchstart", boundFunction, false);
	document.documentElement.addEventListener("touchmove", boundFunction, false);

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
	let minDistance = Infinity;
	let minIndex = 0;

	for (let i = 0; i < currentlyLoadedApplets.length; i++)
	{
		const applet = currentlyLoadedApplets[i];

		if (!applet.allowFullscreenWithKeyboard)
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
		const center = rect.top + rect.height / 2;
		const distance = Math.abs(window.innerHeight / 2 - center);

		if (distance < minDistance)
		{
			minDistance = distance;
			minIndex = i;
		}
	}

	if (!currentlyLoadedApplets[minIndex].allowFullscreenWithKeyboard)
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

	if (!currentlyLoadedApplets[minIndex].allowResetWithKeyboard)
	{
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
				handleFullscreenButtonPress();
			}

			if (e.key === "r")
			{
				handleResetButtonPress();
			}
		}
	});
}