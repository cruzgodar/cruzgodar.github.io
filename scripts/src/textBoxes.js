import anime from "../anime.js";
import { Checkbox } from "./checkboxes.js";
import { addHoverEventWithScale } from "./hoverEvents.js";
import { InputElement } from "./inputElement.js";
import { $$, addTemporaryListener, pageElement } from "./main.js";
import { siteSettings } from "./settings.js";

let uncapEverything = false;

export class TextBox extends InputElement
{
	defaultValue;
	valueTypeIsString = false;
	affectedByResMult = false;

	constructor({
		element,
		name,
		value,
		maxValue = Infinity,
		minValue = -Infinity,
		onInput = () => {},
		onEnter = () => {},
	}) {
		super({ element, name });
		this.value = value;
		this.defaultValue = this.value;
		this.onInput = onInput;
		this.onEnter = onEnter;
		this.maxValue = maxValue;
		this.minValue = minValue;
		
		this.element.value = this.value;
		this.element.nextElementSibling.textContent = this.name;

		if (typeof this.value === "string")
		{
			this.valueTypeIsString = true;
		}

		this.element.addEventListener("input", () => this.inputCallback());

		this.element.addEventListener("focusout", () =>
		{
			if (this.element.value === "")
			{
				this.element.value = this.defaultValue;
				
				this.value = this.valueTypeIsString
					? this.element.value
					: parseFloat(this.element.value);
			}

			this.updateCaps();
		});

		this.element.addEventListener("keydown", (e) =>
		{
			if (e.key === "Enter" && !this.disabled)
			{
				if (this.element.value === "")
				{
					this.element.value = this.defaultValue;
					
					this.value = this.valueTypeIsString
						? this.element.value
						: parseFloat(this.element.value);
				}
				
				this.updateCaps();
				
				this.onEnter();
			}
		});

		if (!this.valueTypeIsString)
		{
			this.setCap();
		}

		if (
			this.name.toLowerCase().includes("resolution")
			&& siteSettings.resolutionMultiplier !== 1
		) {
			setTimeout(() => this.onInput());
		}
	}

	inputCallback()
	{
		if (this.disabled)
		{
			return;
		}

		this.value = this.valueTypeIsString
			? this.element.value || this.defaultValue
			: parseFloat(this.element.value || this.defaultValue);

		if (!this.valueTypeIsString)
		{
			if (this.value > this.maxValue && !uncapEverything)
			{
				this.value = this.maxValue;
			}

			else if (this.value < this.minValue && !uncapEverything)
			{
				this.value = this.minValue;
			}

			else
			{
				this.element.parentNode.classList.remove("capped-input-max");
				this.element.parentNode.classList.remove("capped-input-min");
			}
		}

		this.onInput();
	}

	updateCaps()
	{
		if (this.valueTypeIsString || uncapEverything)
		{
			return;
		}

		if (this.value >= this.maxValue)
		{
			this.value = this.maxValue;

			this.element.value = this.value;

			this.element.parentNode.classList.remove("capped-input-min");
			this.element.parentNode.classList.add("capped-input-max");
		}

		else if (this.value <= this.minValue)
		{
			this.value = this.minValue;

			this.element.value = this.value;

			this.element.parentNode.classList.remove("capped-input-max");
			this.element.parentNode.classList.add("capped-input-min");
		}

		else
		{
			this.element.parentNode.classList.remove("capped-input-max");
			this.element.parentNode.classList.remove("capped-input-min");
		}
	}

	setValue(newValue, callOnInput = false)
	{
		this.value = newValue;
		this.element.value = this.value;

		if (callOnInput)
		{
			this.inputCallback();
		}
	}

	setCap()
	{
		// Find the words on the last line.
		const words = this.element.nextElementSibling.innerHTML.split(" ");

		const wordElement = document.createElement("p");
		wordElement.classList.add("body-text");
		wordElement.style.position = "fixed";
		wordElement.style.opacity = 0;
		wordElement.style.top = "-100vh";
		wordElement.style.width = "fit-content";
		wordElement.textContent = "";
		pageElement.appendChild(wordElement);



		let startIndex = 0;

		for (let i = 0; i < words.length; i++)
		{
			wordElement.textContent = `${wordElement.textContent}${i === startIndex ? "" : " "}${words[i]}`;

			const width = wordElement.getBoundingClientRect().width;

			if (width >= 100)
			{
				startIndex = i;
				i--;
				wordElement.textContent = "";
			}
		}

		wordElement.remove();

		if (startIndex === 0)
		{
			this.element.nextElementSibling.innerHTML = /* html */`<span style="white-space: nowrap">${words.slice(startIndex).join(" ")}<span class="triangle">&#x25BC;</span></span>`;
		}
		else
		{
			this.element.nextElementSibling.innerHTML = /* html */`<span>${words.slice(0, startIndex).join(" ")}</span> <span style="white-space: nowrap">${words.slice(startIndex).join(" ")}<span class="triangle">&#x25BC;</span></span>`;
		}



		this.element.nextElementSibling.addEventListener("click", () =>
		{
			if (this.element.parentNode.classList.contains("capped-input-max"))
			{
				hideAllCapDialogs();

				this.showCapDialog();
			}

			else if (this.element.parentNode.classList.contains("capped-input-min"))
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
				onInput: removeCaps
			});

			function removeCaps()
			{
				uncapEverything = checkbox.checked;

				if (uncapEverything)
				{
					$$(".capped-input-max, .capped-input-min").forEach(cappedInputElement =>
					{
						cappedInputElement.classList.remove("capped-input-max");
						cappedInputElement.classList.remove("capped-input-min");
					});
				}
			}
		
			addHoverEventWithScale({
				element: checkbox.element.parentNode,
				scale: 1.1,
				addBounceOnTouch: false
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
		const rect = this.element.nextElementSibling.getBoundingClientRect();
		const dialogRect = dialog.getBoundingClientRect();

		dialog.style.top = `${window.scrollY + rect.top + rect.height + 4}px`;

		dialog.style.left = `${Math.min(Math.max(rect.left - (dialogRect.width + 12 - rect.width) / 2, 12), window.innerWidth - 12 - dialogRect.width)}px`;
	}
}



function hideAllCapDialogs()
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
				dialogs.forEach(dialog => dialog.remove());
			}
		});
	}
}