import { changeOpacity } from "./animation.js";
import { InputElement } from "./inputElement.js";
import { addTemporaryParam, pageUrl } from "./main.js";

export class Checkbox extends InputElement
{
	checked;
	persistState;
	checkboxElement;

	constructor({
		element,
		name,
		persistState = true,
		checked = false,
		onInput = () => {},
	}) {
		super({ element, name });

		this.checkboxElement = element.nextElementSibling;
		this.checked = checked;
		this.onInput = onInput;
		
		this.element.parentNode.nextElementSibling.firstElementChild.textContent = this.name;
		this.persistState = persistState;

		this.element.checked = this.checked;

		if (this.checked)
		{
			this.checkboxElement.style.opacity = 1;
		}

		this.element.addEventListener("input", () =>
		{
			this.element.blur();

			if (this.disabled)
			{
				this.element.checked = !this.element.checked;
				return;
			}

			this.setChecked({
				newChecked: this.element.checked,
				callOnInput: true
			});
		});

		this.element.parentNode.addEventListener("click", () =>
		{
			// This is only satisfied when we click on the border.
			if (this.checked === this.element.checked)
			{
				this.element.click();
			}
		});

		if (this.persistState)
		{
			const value = new URLSearchParams(window.location.search).get(this.element.id);
			
			if (value === "1")
			{
				setTimeout(() =>
				{
					this.setChecked({
						newChecked: true,
						callOnInput: true,
						animate: false
					});

					this.loadResolve();
				}, 10);
			}

			else if (value === "0")
			{
				setTimeout(() =>
				{
					this.setChecked({
						newChecked: false,
						callOnInput: true,
						animate: false
					});

					this.loadResolve();
				}, 10);
			}

			else
			{
				this.loadResolve();
			}

			addTemporaryParam(this.element.id);
		}

		else
		{
			this.loadResolve();
		}
	}

	setChecked({ newChecked, callOnInput = false, animate = true })
	{
		this.element.checked = newChecked;
		this.checked = newChecked;

		changeOpacity({
			element: this.checkboxElement,
			opacity: this.checked ? 1 : 0,
			duration: animate ? 125 : 0
		});

		if (callOnInput)
		{
			this.onInput();
		}

		if (this.persistState)
		{
			const searchParams = new URLSearchParams(window.location.search);
			
			searchParams.set(
				this.element.id,
				this.checked ? "1" : "0"
			);

			const string = searchParams.toString();

			window.history.replaceState(
				{ url: pageUrl },
				"",
				pageUrl.replace(/\/home/, "") + "/" + (string ? `?${string}` : "")
			);
		}
	}

	setDisabled(newDisabled)
	{
		this.disabled = newDisabled;

		if (this.disabled)
		{
			this.element.parentNode.parentNode.classList.add("disabled");
		}

		else
		{
			this.element.parentNode.parentNode.classList.remove("disabled");
		}
	}
}