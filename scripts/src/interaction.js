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



	// Remove focus when moving the mouse or touching anything.
	document.documentElement.addEventListener("pointerdown", () =>
	{
		if (!(
			document.activeElement.tagName === "INPUT"
			&& document.activeElement.type !== "range"
			|| document.activeElement.tagName === "TEXTAREA"
		)
		) {
			document.activeElement.blur();
		}
	});

	document.documentElement.addEventListener("pointerup", () =>
	{
		if (!(
			document.activeElement.tagName === "INPUT"
			&& document.activeElement.type !== "range"
			|| document.activeElement.tagName === "TEXTAREA"
		)
		) {
			document.activeElement.blur();
		}
	});
}

function handleTouchEvent()
{
	if (
		document.activeElement.tagName !== "INPUT"
		&& document.activeElement.tagName !== "TEXTAREA"
		&& document.activeElement.tagName !== "SELECT"
	) {
		document.activeElement.blur();
	}

	if (!currentlyTouchDevice)
	{
		removeHoverEvents();

		currentlyTouchDevice = true;
	}
}

export function listenForFullscreenKey()
{
	addTemporaryListener({
		object: document.documentElement,
		event: "keydown",
		callback: e =>
		{
			if (
				e.key === "f"
				&& document.activeElement.tagName !== "INPUT"
				&& document.activeElement.tagName !== "TEXTAREA"
			) {
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
					
					if (wilson.fullscreen.currentlyFullscreen)
					{
						wilson.fullscreen.switchFullscreen();
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

				const wilson = currentlyLoadedApplets[minIndex].wilsonForFullscreen
					?? currentlyLoadedApplets[minIndex].wilson;

				wilson.fullscreen.switchFullscreen();
			}
		}
	});
}