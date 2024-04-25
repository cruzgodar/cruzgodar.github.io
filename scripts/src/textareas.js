import { InputElement } from "./inputElement.js";

export class Textarea extends InputElement
{
	defaultValue;

	constructor({
		element,
		name,
		value = "",
		allowEnter = false,
		onInput = () => {},
		onEnter = () => {},
	}) {
		super({ element, name });
		this.value = value;
		this.allowEnter = allowEnter;
		this.onInput = onInput;
		this.onEnter = onEnter;
		
		this.element.value = this.value;

		this.element.addEventListener("input", () => this.inputCallback());

		this.element.addEventListener("keydown", (e) =>
		{
			if (e.key === "Enter")
			{
				if (this.allowEnter && !(e.shiftKey || e.metaKey || e.ctrlKey))
				{
					return;
				}
				
				e.preventDefault();
				
				if (!this.disabled)
				{
					this.onEnter();
				}
			}
		});
	}

	inputCallback()
	{
		if (this.disabled)
		{
			return;
		}

		this.value = this.element.value;

		this.onInput();
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
}