import { FlagOverlap } from "./class.js";
import {
	countriesByName,
	countryNameList,
	countryNames,
	largestAreaCountries,
	largestPopulationCountries,
	possibleAnswers,
	unMembers
} from "./countryData.js";
import { Button } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { addHoverEvent, addHoverEventWithScale } from "/scripts/src/hoverEvents.js";
import { $, $$, addStyle, addTemporaryListener } from "/scripts/src/main.js";
import { animate, fuzzySearch, sleep } from "/scripts/src/utils.js";

export default async function()
{
	const guessSelectorInput = $("#guess-selector-input");
	const countryList = $("#country-list");

	let preventOpeningCountryList = false;

	const applet = new FlagOverlap({
		canvas: $("#output-canvas"),
		overlayCanvas: $("#overlay-canvas"),
		guessCanvases: Array.from($$(".guess-canvas")),
		overlayCanvases: Array.from($$(".overlay-canvas")),
		progressBars: Array.from($$(".progress-bar")),
		progressBarTexts: Array.from($$(".progress-bar-text")),
		overlapCheckboxes: Array.from($$(".guess-overlap-checkbox")),
		winOverlay: $("#win-overlay"),
		viewFlagButtonContainer: $("#view-flag-button").parentElement
	});

	new Button({
		element: $("#replay-button"),
		name: "Play Again",
		onClick: () =>
		{
			applet.replay();
			preventOpeningCountryList = true;
			guessSelectorInput.focus();
		}
	});

	new Button({
		element: $("#view-flag-button"),
		name: "View Flag",
		onClick: () => applet.wilsonOverlay.enterFullscreen()
	});

	const hideFlagIconsCheckbox = new Checkbox({
		element: $("#hide-flag-icons-checkbox"),
		name: "Hide flags in list",
		onInput: () =>
		{
			setTimeout(() =>
			{
				countryList.classList.toggle("hard-mode", hideFlagIconsCheckbox.checked);
			}, 100);
		}
	});

	const unMembersOnlyCheckbox = new Checkbox({
		element: $("#un-members-only-checkbox"),
		name: "UN members only",
		onInput: onCheckboxInput
	});

	const largeAreaOnlyCheckbox = new Checkbox({
		element: $("#large-area-only-checkbox"),
		name: "Large area countries only",
		onInput: onCheckboxInput
	});

	const largePopulationOnlyCheckbox = new Checkbox({
		element: $("#large-population-only-checkbox"),
		name: "Large population countries only",
		onInput: onCheckboxInput
	});

	const possibleFlagsDropdown = new Dropdown({
		element: $("#possible-flags-dropdown"),
		name: "Possible Secret Flags",
		options: {
			all: "All Countries and Territories",
			americas: "The Americas",
			europe: "Europe",
			africa: "Africa",
			asiaAndPacific: "Asia and the Pacific"
		},
		onInput: onCheckboxInput
	});

	possibleFlagsDropdown.loaded.then(() =>
	{
		applet.possibleFlags = possibleAnswers[possibleFlagsDropdown.value || "all"];
	});

	let lastGuessFlagId = undefined;



	for (const [index, checkbox] of applet.overlapCheckboxes.entries())
	{
		addHoverEventWithScale({
			element: checkbox,
			scale: 1.1,
			addBounceOnTouch: () => true,
		});

		checkbox.addEventListener("click", () =>
		{
			checkbox.classList.toggle("checked");

			applet.setShowDiffs(checkbox.classList.contains("checked"), index);
		});
	}

	// Prevents a gross loading bug
	addStyle(/* css */`
		.cap-background
		{
			transition: opacity .125s ease-out;
		}
	`);



	let guessSelectorFocused = false;

	// Quick flag to prevent the selected item from moving when we type.
	let preventFocusWithMouse = false;

	// This is the *apparent* index of the currently selected item,
	// which is dependent on the ordering.
	let selectedItemApparentIndex = undefined;

	// An ordered array of country codes shown in the dropdown.
	let currentResults = possibleAnswers.all;

	// For example, the 2nd element of this array is the actual index of the
	// 2nd element shown in the dropdown.
	let apparentToDomOrder = Array.from({ length: possibleAnswers.all.length }, (_, i) => i);

	let domToApparentOrder = [...apparentToDomOrder];

	for (const [index, countryCode] of currentResults.entries())
	{
		const option = document.createElement("div");
		option.classList.add("country-list-item");
		option.innerHTML = /* html */`
			<img src="/applets/flag-overlap/graphics/thumbnails/${countryCode}.webp">
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

			setTimeout(() => applet.guessFlag(countryCode), 50);
			lastGuessFlagId = countryCode;
		});
	}

	const noResultsElement = document.createElement("div");
	noResultsElement.classList.add("country-list-item");
	noResultsElement.innerHTML = /* html */`
		<p class="body-text" style="text-align: center; opacity: 0.5">No results</p>
	`;
	noResultsElement.style.order = countryList.children.length;
	noResultsElement.style.cursor = "default";
	noResultsElement.style.display = "none";

	countryList.appendChild(noResultsElement);



	function selectItem(apparentIndex)
	{
		const oldSelectedItemDomIndex = selectedItemApparentIndex === undefined
			? undefined
			: apparentToDomOrder[selectedItemApparentIndex];
		
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

	async function showCountryList()
	{
		if (preventOpeningCountryList)
		{
			preventOpeningCountryList = false;
			return;
		}
		
		guessSelectorFocused = true;

		onResize();

		countryList.scrollTo(0, 0);

		selectItem(0);

		await sleep(20);

		if (countryList.style.display !== "flex")
		{
			countryList.style.display = "flex";

			await animate((t) =>
			{
				countryList.style.transform = `scale(${.975 + t * .025})`;
				countryList.style.opacity = t;
			}, 125, "easeOutQuad");
		}
	}

	async function hideCountryList()
	{
		await animate((t) =>
		{
			countryList.style.transform = `scale(${1 - t * .025})`;
			countryList.style.opacity = 1 - t;
		}, 125, "easeOutQuad");

		countryList.style.display = "none";
		selectedItemApparentIndex = undefined;
		updateCountryListEntries();
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

			selectedItemApparentIndex = undefined;

			noResultsElement.style.display = "none";

			return;
		}
		


		// Remove all entries that have been guessed.
		currentResults = Array.from(
			new Set(
				fuzzySearch(guessSelectorInput.value, countryNameList)
					.map(name => countriesByName[name])
			)
		);

		console.log(currentResults);


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

		countryList.scrollTo(0, 0);

		noResultsElement.style.display = currentResults.length === 0
			? "block"
			: "none";
	}



	guessSelectorInput.addEventListener("focus", showCountryList);
	guessSelectorInput.addEventListener("click", showCountryList);

	guessSelectorInput.addEventListener("blur", () =>
	{
		guessSelectorFocused = false;
		hideCountryList();
	});

	guessSelectorInput.addEventListener("input", () =>
	{
		updateCountryListEntries();
		showCountryList();
	});
	
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
				hideCountryList();
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
					if (applet.gameOver)
					{
						applet.replay();
						return;
					}

					else if (
						guessSelectorInput.value.length === 0
						&& lastGuessFlagId
						&& applet.guesses.length === 0
						&& selectedItemApparentIndex === undefined
					) {
						applet.guessFlag(lastGuessFlagId);
					}

					if (selectedItemApparentIndex !== undefined)
					{
						const selectedItemDomIndex = apparentToDomOrder[selectedItemApparentIndex];
						
						hideCountryList();
						setTimeout(() => countryList.children[selectedItemDomIndex].click(), 50);
					}
				}
			}

			else if (e.key.length === 1)
			{
				guessSelectorInput.focus();
				// guessSelectorInput.value += e.key;
			}
		}
	});

	async function onCheckboxInput()
	{
		await Promise.all([
			unMembersOnlyCheckbox.loaded,
			largeAreaOnlyCheckbox.loaded,
			largePopulationOnlyCheckbox.loaded,
			possibleFlagsDropdown.loaded
		]);

		applet.possibleFlags = possibleAnswers[possibleFlagsDropdown.value || "all"]
			.filter(country =>
				!unMembersOnlyCheckbox.checked
				|| unMembers.includes(country)
			)
			.filter(country =>
				!largeAreaOnlyCheckbox.checked
				|| largestAreaCountries.includes(country)
			)
			.filter(country =>
				!largePopulationOnlyCheckbox.checked
				|| largestPopulationCountries.includes(country)
			);
	}
}