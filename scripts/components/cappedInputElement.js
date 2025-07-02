import anime from "../anime.js";
import { addHoverEventWithScale } from "../src/hoverEvents.js";
import { $$, addTemporaryListener, pageElement } from "../src/main.js";
import { siteSettings } from "../src/settings.js";
import { clamp } from "../src/utils.js";
import { Checkbox } from "./checkboxes.js";
import { InputElement } from "./inputElement.js";

export let uncapEverything = false;

function splitHtmlBySpaces(element)
{
	const nodes = [];
	
	function processNode(node)
	{
		if (node.nodeType === Node.TEXT_NODE)
		{
			// Split text content by spaces and filter out empty strings
			const words = node.textContent.split(/\s+/).filter(word => word.length > 0);
			const textNodes = words.map(word => document.createTextNode(word));
			nodes.push(...textNodes);
		}
		
		else if (node.nodeType === Node.ELEMENT_NODE)
		{
			// For element nodes, add the entire element as one chunk
			nodes.push(node);
		}
	}
	
	// Process all child nodes
	for (let i = 0; i < element.childNodes.length; i++)
	{
		processNode(element.childNodes[i]);
	}
	
	return nodes;
}

export class CappedInputElement extends InputElement
{
	min;
	max;
	labelElement;
	// Where the max and min cap classes go.
	capClassElement;
	disableCaps = false;

	constructor({
		element,
		name,
		min,
		max,
		labelElement,
		capClassElement,
	}) {
		super({ element, name });
		this.min = min;
		this.max = max;
		this.labelElement = labelElement;
		this.capClassElement = capClassElement;
	}



	setCap()
	{
		// Find the words on the last line.
		const wordElement = document.createElement("p");
		wordElement.classList.add("body-text");
		wordElement.style.position = "fixed";
		wordElement.style.opacity = 0;
		wordElement.style.top = "-100vh";
		wordElement.style.width = "fit-content";
		wordElement.innerHTML = "";
		pageElement.appendChild(wordElement);

		const subNodes = splitHtmlBySpaces(this.labelElement);

		const labelElementWidth = this.labelElement.getBoundingClientRect().width;



		let startIndex = 0;

		for (let i = 0; i < subNodes.length; i++)
		{
			wordElement.appendChild(
				document.createTextNode(
					i === startIndex ? "" : " "
				)
			);

			// Subtlety! This should nominally use cloneNode,
			// since we're potentially adding it all over the place.
			// However, that messes up event listeners.
			// Thankfully, appendChild moves things when necessary,
			// so we can move around the original copy of the element.
			wordElement.appendChild(subNodes[i]);

			const width = wordElement.getBoundingClientRect().width;

			if (width >= labelElementWidth)
			{
				// We need to be careful here to avoid an infinite loop.
				// If i === startIndex, that means the ith element is singlehandedly too
				// big to fit on a line, so we give up and *don't* decrement i.
				if (i === startIndex)
				{
					// Okay, but if this is the last element, we don't change startIndex.
					// Otherwise, the triangle would be alone on the next line.
					startIndex = i === subNodes.length - 1 ? i : i + 1;
				}

				else
				{
					startIndex = i;
					i--;
				}
				
				wordElement.innerHTML = "";
			}
		}

		wordElement.remove();


		if (startIndex === 0)
		{
			const wrapper = document.createElement("span");
			wrapper.style.whiteSpace = "nowrap";
			
			for (let i = 0; i < subNodes.length; i++)
			{
				// No need to clone these since we're removing the original element anyway.
				wrapper.appendChild(subNodes[i]);

				if (i !== startIndex - 1)
				{
					wrapper.appendChild(document.createTextNode(" "));
				}
			}

			const triangle = document.createElement("span");
			triangle.classList.add("cap-triangle");
			triangle.innerHTML = "&#x25BC;";

			wrapper.appendChild(triangle);

			this.labelElement.innerHTML = "";
			this.labelElement.appendChild(wrapper);
		}

		else
		{
			const beforeModifiedLine = document.createElement("span");
			const afterModifiedLine = document.createElement("span");
			afterModifiedLine.style.whiteSpace = "nowrap";

			for (let i = 0; i < startIndex; i++)
			{
				// No need to clone these since we're removing the original element anyway.
				beforeModifiedLine.appendChild(subNodes[i]);

				if (i !== startIndex - 1)
				{
					beforeModifiedLine.appendChild(document.createTextNode(" "));
				}
			}

			for (let i = startIndex; i < subNodes.length; i++)
			{
				afterModifiedLine.appendChild(subNodes[i]);

				if (i !== subNodes.length - 1)
				{
					afterModifiedLine.appendChild(document.createTextNode(" "));
				}
			}

			const triangle = document.createElement("span");
			triangle.classList.add("cap-triangle");
			triangle.innerHTML = "&#x25BC;";

			afterModifiedLine.appendChild(triangle);

			this.labelElement.innerHTML = "";
			this.labelElement.appendChild(beforeModifiedLine);
			this.labelElement.appendChild(afterModifiedLine);
		}



		this.labelElement.addEventListener("click", (e) =>
		{
			// If we hit something content-editable, don't do anything.
			if (e.target.isContentEditable)
			{
				return;
			}

			if (this.capClassElement.classList.contains("capped-input-max"))
			{
				hideAllCapDialogs();

				this.showCapDialog();
			}

			else if (this.capClassElement.classList.contains("capped-input-min"))
			{
				hideAllCapDialogs();

				this.showCapDialog(true);
			}
		});



		const listener = (e) =>
		{
			if (!(e.target.classList.contains("keep-dialog-open")))
			{
				hideAllCapDialogs();
			}
		};

		const boundFunction = listener.bind(this);

		addTemporaryListener({
			object: document.documentElement,
			event: "pointerdown",
			callback: boundFunction,
		});
	}

	updateCaps()
	{
		if (this.disableCaps || uncapEverything)
		{
			return;
		}

		if (this.value >= this.max)
		{
			this.value = this.max;

			this.capClassElement.classList.remove("capped-input-min");
			this.capClassElement.classList.add("capped-input-max");
		}

		else if (this.value <= this.min)
		{
			this.value = this.min;

			this.capClassElement.classList.remove("capped-input-max");
			this.capClassElement.classList.add("capped-input-min");
		}

		else
		{
			this.capClassElement.classList.remove("capped-input-max");
			this.capClassElement.classList.remove("capped-input-min");
		}

		this.setValue(this.value);
	}

	showCapDialog(tooSmall = false)
	{
		const dialog = document.createElement("div");

		dialog.classList.add("input-cap-dialog");
		dialog.classList.add("keep-dialog-open");

		dialog.style.opacity = 0;
		dialog.style.transform = "scale(1)";

		if (tooSmall)
		{
			dialog.innerHTML = /* html */`Smaller values than this may cause unexpected results, break the intended functionality of the applet, or crash the tab or entire browser. Only continue if you know what you&#x2019;re doing!
			<div class="checkbox-row keep-dialog-open">
				<div class="checkbox-container keep-dialog-open" tabindex="1">
					<input type="checkbox" id="${this.element.id}-checkbox" class="uncap-inputs-checkbox keep-dialog-open">
					<div class="checkbox keep-dialog-open"></div>
				</div>
				
				<label for="${this.element.id}-checkbox" style="margin-left: 10px" class="keep-dialog-open">
					<p class="body-text checkbox-subtext keep-dialog-open"></p>
				</label>
			</div>`;
		}

		else
		{
			dialog.innerHTML = /* html */`Larger values than this may take an extremely long time to compute, cause substantial lag, or crash the tab or entire browser. Only continue if you know what you&#x2019;re doing!
			<div class="checkbox-row keep-dialog-open">
				<div class="checkbox-container keep-dialog-open" tabindex="1">
					<input type="checkbox" id="${this.element.id}-checkbox" class="uncap-inputs-checkbox keep-dialog-open">
					<div class="checkbox keep-dialog-open"></div>
				</div>
				
				<label for="${this.element.id}-checkbox" style="margin-left: 10px" class="keep-dialog-open">
					<p class="body-text checkbox-subtext keep-dialog-open"></p>
				</label>
			</div>`;
		}

		

		pageElement.appendChild(dialog);



		const boundFunction = () => this.updateCapDialogLocation(dialog);
		addTemporaryListener({
			object: window,
			event: "resize",
			callback: boundFunction
		});

		boundFunction();

		dialog.style.transform = siteSettings.reduceMotion ? "scale(1)" : "scale(.95)";



		setTimeout(() =>
		{
			const checkbox = new Checkbox({
				element: dialog.querySelector(".uncap-inputs-checkbox"),
				name: "Uncap all inputs",
				checked: uncapEverything,
				persistState: false,
				onInput: removeCaps
			});

			function removeCaps()
			{
				uncapEverything = checkbox.checked;

				if (uncapEverything)
				{
					for (const cappedInputElement of $$(".capped-input-max, .capped-input-min"))
					{
						cappedInputElement.classList.remove("capped-input-max");
						cappedInputElement.classList.remove("capped-input-min");
					}
				}
			}
		
			addHoverEventWithScale({
				element: checkbox.element.parentNode,
				scale: 1.1,
				addBounceOnTouch: () => true
			});

			anime({
				targets: dialog,
				opacity: 1,
				scale: 1,
				duration: 250,
				easing: "easeOutQuad"
			});
		}, 16);
	}

	updateCapDialogLocation(dialog)
	{
		const rect = this.labelElement.getBoundingClientRect();
		const dialogRect = dialog.getBoundingClientRect();

		dialog.style.top = `${window.scrollY + rect.top + rect.height + 4}px`;

		const left = clamp(
			rect.left - (dialogRect.width + 12 - rect.width) / 2,
			12,
			window.innerWidth - 12 - dialogRect.width
		);

		dialog.style.left = `${left}px`;
	}
}



export function hideAllCapDialogs()
{
	const dialogs = $$(".input-cap-dialog");

	if (dialogs)
	{
		anime({
			targets: dialogs,
			opacity: 0,
			scale: siteSettings.reduceMotion ? 1 : .95,
			duration: 250,
			easing: "easeOutQuad",
			complete: () =>
			{
				for (const dialog of dialogs)
				{
					dialog.remove();
				}
			}
		});
	}
}