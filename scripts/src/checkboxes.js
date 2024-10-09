import { InputElement } from "./inputElement.js";

export class Checkbox extends InputElement
{
	checked;

	constructor({
		element,
		name,
		checked = false,
		onInput = () => {},
	}) {
		super({ element, name });

		this.checked = checked;
		this.onInput = onInput;
		
		this.element.parentNode.nextElementSibling.firstElementChild.textContent = this.name;

		this.element.checked = this.checked;

		this.element.addEventListener("input", () =>
		{
			this.element.blur();
			this.checked = this.element.checked;

			if (!this.disabled)
			{
				this.onInput();
			}
		});

		this.element.parentNode.addEventListener("click", () =>
		{
			// This is only satisfied when we click on the border.
			if (this.checked === this.element.checked)
			{
				this.element.click();
			}
		});
	}

	setChecked(newChecked, callOnInput = false)
	{
		this.element.checked = newChecked;
		this.checked = newChecked;

		if (callOnInput)
		{
			this.onInput();
		}
	}
}