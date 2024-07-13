import { InputElement } from "./inputElement.js";
import { addTemporaryParam, pageUrl } from "./main.js";

export class Textarea extends InputElement
{
	defaultValue;

	constructor({
		element,
		name,
		value = "",
		persistState = true,
		allowEnter = false,
		onInput = () => {},
		onEnter = () => {},
	}) {
		super({ element, name });
		this.element.nextElementSibling.textContent = this.name;
		this.value = value;
		this.persistState = persistState;
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

		if (this.persistState)
		{
			const value = new URLSearchParams(window.location.search).get(this.element.id);
			
			if (value)
			{
				this.setValue(decodeURIComponent(value));
			}

			addTemporaryParam(this.element.id);
		}
	}

	inputCallback()
	{
		if (this.disabled)
		{
			return;
		}

		this.setValue(this.element.value, true);
	}

	setValue(newValue, callOnInput = false)
	{
		this.value = newValue;
		this.element.value = this.value;

		if (this.persistState)
		{
			const searchParams = new URLSearchParams(window.location.search);

			if (this.value)
			{
				searchParams.set(
					this.element.id,
					encodeURIComponent(this.value)
				);
			}

			const string = searchParams.toString();

			window.history.replaceState(
				{ url: pageUrl },
				"",
				pageUrl.replace(/\/home\//, "/") + (string ? `?${string}` : "")
			);
		}

		if (callOnInput)
		{
			this.onInput();
		}
	}
}