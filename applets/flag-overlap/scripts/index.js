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

	applet.possibleFlags = possibleAnswers.all;



	let guessSelectorFocused = false;

	// Quick flag to prevent the selected item from moving when we type.
	let preventFocusWithMouse = false;

	// This is the *apparent* index of the currently selected item,
	// which is dependent on the ordering.
	let selectedItemApparentIndex = 0;

	// An ordered array of country codes shown in the dropdown.
	let currentResults = possibleAnswers.all;

	// For example, the 2nd element of this array is the actual index of the
	// 2nd element shown in the dropdown.
	let apparentToDomOrder = Array.from({ length: possibleAnswers.all.length }, (_, i) => i);

	let domToApparentOrder = [...apparentToDomOrder];

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
			scale: 1.05,
			callback: (isHovering) =>
			{
				if (isHovering && preventFocusWithMouse)
				{
					if (option.style.order !== "0")
					{
						option.classList.remove("hover");
					}

					selectItem(selectedItemApparentIndex);
					
					return;
				}

				if (isHovering)
				{
					if (selectedItemApparentIndex !== domToApparentOrder[index])
					{
						const oldSelectedItemDomIndex =
							apparentToDomOrder[selectedItemApparentIndex];
						
						countryList.children[oldSelectedItemDomIndex].classList.remove("hover");
					}

					selectedItemApparentIndex = domToApparentOrder[index];
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



	function selectItem(apparentIndex)
	{
		const oldSelectedItemDomIndex =
			apparentToDomOrder[selectedItemApparentIndex];
		
		if (oldSelectedItemDomIndex !== undefined)
		{
			countryList.children[oldSelectedItemDomIndex].classList.remove("hover");
		}

		selectedItemApparentIndex = apparentIndex;

		const selectedItemDomIndex = apparentToDomOrder[selectedItemApparentIndex];

		if (countryList.children.length > 0 && selectedItemDomIndex !== undefined)
		{
			countryList.children[selectedItemDomIndex].classList.add("hover");
		}
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

		selectItem(0);
		
		requestAnimationFrame(() =>
		{
			countryList.style.transform = "scale(1)";
			countryList.style.opacity = 1;
		});
	}

	function hideCountryList()
	{
		countryList.style.transform = "scale(0.975)";
		countryList.style.opacity = 0;

		setTimeout(() => countryList.style.display = "none", 125);
	}

	function navigateCountryListUp()
	{
		if (selectedItemApparentIndex > 0)
		{
			selectItem(selectedItemApparentIndex - 1);
		}
	}

	function navigateCountryListDown()
	{
		if (selectedItemApparentIndex < currentResults.length - 1)
		{
			selectItem(selectedItemApparentIndex + 1);
		}
	}

	function updateCountryListEntries()
	{
		preventFocusWithMouse = true;
		setTimeout(() => preventFocusWithMouse = false, 100);

		if (guessSelectorInput.value.length === 0)
		{
			apparentToDomOrder = Array.from({ length: possibleAnswers.all.length }, (_, i) => i);
			domToApparentOrder = [...apparentToDomOrder];

			for (const option of countryList.children)
			{
				option.style.display = "flex";
				option.classList.remove("hover");
				// 1 and not 0 fixes an obscure double-select bug.
				option.style.order = 1;
			}

			selectItem(0);

			return;
		}
		


		// Remove all entries that have been guessed.
		currentResults = Array.from(
			new Set(
				fuzzySearch(guessSelectorInput.value, countryNameList)
					.map(name => countriesByName[name])
			)
		);


		apparentToDomOrder = new Array(currentResults.length);

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
			option.classList.remove("hover");

			apparentToDomOrder[resultIndex] = index;
			domToApparentOrder[index] = resultIndex;
		}

		showCountryList();
	}



	guessSelectorInput.addEventListener("focus", showCountryList);

	guessSelectorInput.addEventListener("blur", () =>
	{
		guessSelectorFocused = false;
		hideCountryList();
	});

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
				guessSelectorFocused = false;
			}

			else if (e.key === "ArrowDown")
			{
				e.preventDefault();

				navigateCountryListDown();
			}

			else if (e.key === "ArrowUp")
			{
				e.preventDefault();

				navigateCountryListUp();
			}

			else if (e.key === "Enter")
			{
				if (guessSelectorFocused)
				{
					if (applet.won)
					{
						applet.replay();
						return;
					}

					else if (
						guessSelectorInput.value.length === 0
						&& this.lastGuessFlagId
					) {
						applet.guessFlag(this.lastGuessFlagId);
					}
					
					const selectedItemDomIndex = apparentToDomOrder[selectedItemApparentIndex];

					countryList.children[selectedItemDomIndex].click();
					hideCountryList();
				}
			}
		}
	});



	function onCheckboxInput()
	{
		applet.setShowDiffs(showDiffsCheckbox.checked);
	}
}