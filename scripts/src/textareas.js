import { InputElement } from "./inputElement.js";
import { addTemporaryParam, pageUrl } from "./main.js";

export class Textarea extends InputElement
{
	defaultValue;
	overlayElement;

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
		this.element.parentElement.nextElementSibling.textContent = this.name;

		this.overlayElement = this.element.nextElementSibling;

		this.value = value;
		this.persistState = persistState;
		this.allowEnter = allowEnter;
		this.onInput = onInput;
		this.onEnter = onEnter;
		
		this.element.value = this.value;
		this.updateOverlayElement();

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

		// Whenever the textarea changes size, update the overlay's size and position.
		const observer = new ResizeObserver(() =>
		{
			this.updateOverlayElement();
		});

		observer.observe(this.element);

		if (this.persistState)
		{
			const value = new URLSearchParams(window.location.search).get(this.element.id);
			
			if (value)
			{
				setTimeout(() =>
				{
					this.setValue(decodeURIComponent(value));
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

	updateOverlayElement()
	{
		this.overlayElement.innerHTML = this.value
			.replaceAll(/</g, "&lt;");

		this.element.style.height = "fit-content";

		this.overlayElement.style.height = this.element.scrollHeight + "px";
		this.overlayElement.style.width = this.element.scrollWidth + "px";
		this.overlayElement.style.left = this.element.offsetLeft + "px";

		this.element.style.height = this.element.scrollHeight + "px";
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
		this.updateOverlayElement();

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
				pageUrl.replace(/\/home/, "") + "/" + (string ? `?${string}` : "")
			);
		}

		if (callOnInput)
		{
			this.onInput();
		}
	}
}