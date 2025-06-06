import { FlagOverlap } from "./class.js";
import { countriesByName, countryNameList, countryNames, possibleAnswers } from "./countryData.js";
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

	const replayButton = new Button({
		element: $("#replay-button"),
		name: "Play Again",
		onClick: () => applet.replay()
	});



	let guessSelectorFocused = false;
	let selectedItemIndex = 0;
	let currentResults = possibleAnswers.all;

	const guessSelectorInput = $("#guess-selector-input");
	const countryList = $("#country-list");

	for (const [index, countryCode] of currentResults.entries())
	{
		const option = document.createElement("div");
		option.classList.add("country-list-item");
		// TODO: add thumbnails
		option.innerHTML = /* html */`
			<img src="graphics/${countryCode}.png">
			<p class="body-text">${countryNames[countryCode]}</p>
		`;
		option.style.order = index;

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

			guessSelectorInput.value = "";

			applet.guessFlag(countryCode);
		});
	}

	

	function onResize()
	{
		const guessSelectorTop = guessSelectorInput.getBoundingClientRect().top;
		
		const maxHeight = Math.min(window.innerHeight - guessSelectorTop - 100, 500);

		countryList.style.maxHeight = `${maxHeight}px`;
	}

	function showCountryList()
	{
		guessSelectorFocused = true;

		countryList.style.display = "flex";
		onResize();

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
		if (guessSelectorInput.value.length === 0)
		{
			for (const option of countryList.children)
			{
				option.style.display = "flex";
				option.style.order = 0;
			}

			return;
		}

		// Remove all entries that have been guessed.
		currentResults = fuzzySearch(guessSelectorInput.value, countryNameList)
			.map(name => countriesByName[name]);

		for (const option of countryList.children)
		{
			option.style.display = "none";
		}

		for (const [resultIndex, code] of currentResults.entries())
		{
			const index = possibleAnswers.all.indexOf(code);
			const option = countryList.children[index];
			option.style.display = "flex";
			option.style.order = resultIndex;
		}

		showCountryList();
	}



	guessSelectorInput.addEventListener("focus", showCountryList);
	guessSelectorInput.addEventListener("blur", hideCountryList);
	guessSelectorInput.addEventListener("input", updateCountryListEntries);
	
	addTemporaryListener({
		object: window,
		event: "resize",
		callback: onResize
	});

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
				if (guessSelectorFocused)
				{
					countryList.children[selectedItemIndex].click();
					hideCountryList();
				}
			}
		}
	});



	await applet.loadPromise;

	function onCheckboxInput()
	{
		applet.setShowDiffs(showDiffsCheckbox.checked);
	}
}