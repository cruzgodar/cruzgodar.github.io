import { FlagOverlap } from "./class.js";
import { countryNameList, countryNames, possibleAnswers } from "./countryData.js";
import { Button } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { addHoverEvent } from "/scripts/src/hoverEvents.js";
import { $, $$, addTemporaryListener } from "/scripts/src/main.js";
import { fuzzySearch } from "/scripts/src/utils.js";

export default async function()
{
	const applet = new FlagOverlap({
		canvas: $("#output-canvas"),
		overlayCanvas: $("#overlay-canvas"),
		guessCanvases: Array.from($$(".guess-canvas")),
		overlayCanvases: Array.from($$(".overlay-canvas")),
		progressBars: Array.from($$(".progress-bar")),
		winOverlay: $("#win-overlay")
	});

	const showDiffsCheckbox = new Checkbox({
		element: $("#show-diffs-checkbox"),
		name: "Show guess overlaps",
		onInput: onCheckboxInput,
		checked: true,
		persistState: false
	});



	let guessSelectorFocused = false;
	let selectedItemIndex = 0;

	const guessSelectorInput = $("#guess-selector-input");
	const countryList = $("#country-list");

	for (const [index, countryCode] of possibleAnswers.all.entries())
	{
		const option = document.createElement("div");
		option.classList.add("country-list-item");
		// TODO: add thumbnails
		option.innerHTML = /* html */`
			<img src="graphics/${countryCode}.png">
			<p class="body-text">${countryNames[countryCode]}</p>
		`;

		countryList.appendChild(option);

		addHoverEvent({
			element: option,
			addBounceOnTouch: () => true,
			callback: (isHovering) =>
			{
				if (isHovering)
				{
					if (
						countryList.children.length > selectedItemIndex
						&& selectedItemIndex !== index
					) {
						countryList.children[selectedItemIndex].classList.remove("hover");
					}

					selectedItemIndex = index;
				}
			}
		});

		option.addEventListener("click", async () =>
		{
			await applet.loadPromise;

			applet.guessFlag(countryCode);
		});
	}

	function showCountryList()
	{
		guessSelectorFocused = true;

		countryList.style.display = "flex";

		if (countryList.children.length > selectedItemIndex)
		{
			countryList.children[selectedItemIndex].classList.remove("hover");
		}

		selectedItemIndex = 0;

		if (countryList.children.length > 0)
		{
			countryList.children[0].classList.add("hover");
		}
		
		requestAnimationFrame(() =>
		{
			countryList.style.transform = "scale(1)";
			countryList.style.opacity = 1;
		});
	}

	function hideCountryList()
	{
		guessSelectorFocused = false;

		countryList.style.transform = "scale(0.975)";
		countryList.style.opacity = 0;

		setTimeout(() => countryList.style.display = "none", 125);
	}

	function navigateCountryListUp()
	{
		if (selectedItemIndex > 0)
		{
			countryList.children[selectedItemIndex].classList.remove("hover");
			selectedItemIndex--;
			countryList.children[selectedItemIndex].classList.add("hover");
		}
	}

	function navigateCountryListDown()
	{
		if (selectedItemIndex < countryList.children.length - 1)
		{
			countryList.children[selectedItemIndex].classList.remove("hover");
			selectedItemIndex++;
			countryList.children[selectedItemIndex].classList.add("hover");
		}
	}

	function updateCountryListEntries()
	{
		// Remove all entries that have been guessed.
		const results = fuzzySearch(guessSelectorInput.value, countryNameList);

		showCountryList();
	}

	guessSelectorInput.addEventListener("focus", showCountryList);
	guessSelectorInput.addEventListener("blur", hideCountryList);
	guessSelectorInput.addEventListener("input", updateCountryListEntries);

	addTemporaryListener({
		object: document.documentElement,
		event: "keydown",
		callback: (e) =>
		{
			if (e.key === "Escape" && guessSelectorFocused)
			{
				document.activeElement.blur();
			}

			else if (e.key === "ArrowDown")
			{
				navigateCountryListDown();
			}

			else if (e.key === "ArrowUp")
			{
				navigateCountryListUp();
			}

			else if (e.key === "Enter")
			{
				countryList.children[selectedItemIndex].click();
				hideCountryList();
			}
		}
	});



	const replayButton = new Button({
		element: $("#replay-button"),
		name: "Play Again",
		onClick: () => applet.replay()
	});

	await applet.loadPromise;

	function onCheckboxInput()
	{
		applet.setShowDiffs(showDiffsCheckbox.checked);
	}
}