import { addTemporaryParam, pageUrl } from "../src/main.js";
import { siteSettings } from "../src/settings.js";
import { CappedInputElement, uncapEverything } from "./cappedInputElement.js";



export class TextBox extends CappedInputElement
{
	defaultValue;
	valueTypeIsString = false;
	persistState;

	constructor({
		element,
		name,
		value,
		maxValue = Infinity,
		minValue = -Infinity,
		persistState = true,
		onInput = () => {},
		onEnter = () => {},
	}) {
		super({
			element,
			name,
			max: maxValue,
			min: minValue,
			labelElement: element.nextElementSibling,
			capClassElement: element
		});

		this.value = value;
		this.defaultValue = this.value;
		this.onInput = onInput;
		this.onEnter = onEnter;
		this.persistState = persistState;
		
		this.element.value = this.value;
		this.element.nextElementSibling.textContent = this.name;

		if (typeof this.value === "string")
		{
			this.valueTypeIsString = true;
			this.disableCaps = true;
		}

		this.element.addEventListener("input", () => this.setValue(this.element.value, true));

		this.element.addEventListener("focusout", () =>
		{
			if (this.element.value === "")
			{
				this.setValue(this.defaultValue, false);
			}

			this.updateCaps();
		});

		this.element.addEventListener("keydown", (e) =>
		{
			if (e.key === "Enter" && !this.disabled)
			{
				if (this.element.value === "")
				{
					this.setValue(this.defaultValue, false);
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

		if (this.persistState)
		{
			const value = new URLSearchParams(window.location.search).get(this.element.id);
			
			if (value)
			{
				setTimeout(() =>
				{
					this.setValue(decodeURIComponent(value), true);
					this.updateCaps();
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

	

	setValue(newValue, callOnInput = false)
	{
		if (this.disabled)
		{
			return;
		}

		this.element.value = newValue;

		this.value = this.valueTypeIsString
			? newValue || this.defaultValue
			: parseFloat(newValue || this.defaultValue);

		if (isNaN(this.value))
		{
			this.value = this.defaultValue;
		}

		if (!this.valueTypeIsString)
		{
			if (this.value >= this.max && !uncapEverything)
			{
				this.value = this.max;
			}

			else if (this.value <= this.min && !uncapEverything)
			{
				this.value = this.min;
			}

			else
			{
				this.capClassElement.classList.remove("capped-input-max");
				this.capClassElement.classList.remove("capped-input-min");
			}
		}

		if (this.persistState)
		{
			const searchParams = new URLSearchParams(window.location.search);

			if (this.value !== undefined)
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