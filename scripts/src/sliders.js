import { InputElement } from "./inputElement.js";
import { addTemporaryParam, pageUrl } from "./main.js";

export class Slider extends InputElement
{
	subtextElement;
	valueElement;
	value;
	min;
	max;
	snapPoints;
	snapThreshhold;
	precision;
	logarithmic;
	integer;
	persistState;
	onInput;

	constructor({
		element,
		name,
		value,
		min,
		max,
		snapThreshhold = (max - min) / 80,
		snapPoints = [],
		logarithmic = false,
		integer = false,
		persistState = true,
		onInput = () => {}
	}) {
		super({ element, name });
		this.subtextElement = this.element.nextElementSibling.firstElementChild;

		this.logarithmic = logarithmic;
		this.integer = integer;

		this.value = parseFloat(value);
		this.min = parseFloat(min);
		this.max = parseFloat(max);
		this.snapPoints = snapPoints;
		this.snapThreshhold = snapThreshhold;

		if (this.logarithmic)
		{
			this.value = Math.log10(this.value);
			this.min = Math.log10(this.min);
			this.max = Math.log10(this.max);
		}

		this.persistState = persistState;
		this.onInput = onInput;

		// The number of decimal places to round to to get 4 significant figures.
		this.precision = Math.max(
			0,
			3 - Math.floor(
				Math.log10(
					(this.logarithmic ? 10 ** this.max : this.max)
						- (this.logarithmic ? 10 ** this.min : this.min)
				)
			)
		);

		this.value = (this.logarithmic ? 10 ** this.value : this.value);

		this.value = this.integer
			? Math.round(this.value)
			: this.value.toFixed(this.precision);
		
		this.element.setAttribute("min", this.min);
		this.element.setAttribute("max", this.max);

		// This isn't this.value since we don't want to apply log / int stuff
		this.element.setAttribute("value", this.logarithmic ? Math.log10(value) : value);

		this.subtextElement.textContent = `${name}: `;
		this.valueElement = document.createElement("span");
		this.valueElement.textContent = this.value;
		this.subtextElement.appendChild(this.valueElement);

		this.value = parseFloat(this.value);

		this.element.addEventListener("input", () =>
		{
			const oldValue = this.value;

			this.value = this.logarithmic
				? 10 ** parseFloat(this.element.value)
				: parseFloat(this.element.value);

			for (let i = 0; i < this.snapPoints.length; i++)
			{
				const distanceToSnapPoint = Math.abs(this.value - this.snapPoints[i]);

				if (distanceToSnapPoint < this.snapThreshhold)
				{
					this.value = this.snapPoints[i];
				}
			}

			this.value = this.integer
				? Math.round(this.value)
				: this.value.toFixed(this.precision);

			this.valueElement.textContent = this.value;

			this.value = parseFloat(this.value);
			
			if (oldValue !== this.value)
			{
				this.onInput();
			}
		});

		this.element.addEventListener("pointerup", () =>
		{
			if (this.persistState)
			{
				const searchParams = new URLSearchParams(window.location.search);

				if (this.element.value !== undefined)
				{
					searchParams.set(
						this.element.id,
						encodeURIComponent(this.element.value)
					);
				}

				const string = searchParams.toString();

				window.history.replaceState(
					{ url: pageUrl },
					"",
					pageUrl.replace(/\/home\//, "/") + (string ? `?${string}` : "")
				);
			}
		});

		if (this.persistState)
		{
			const value = new URLSearchParams(window.location.search).get(this.element.id);
			
			if (value)
			{
				setTimeout(() => this.setValue(parseFloat(decodeURIComponent(value)), true), 10);
			}

			addTemporaryParam(this.element.id);
		}
	}

	setValue(newValue, callOnInput = false)
	{
		this.element.value = newValue;

		this.value = this.logarithmic
			? 10 ** parseFloat(this.element.value)
			: parseFloat(this.element.value);

		this.value = this.integer
			? Math.round(this.value)
			: this.value.toFixed(this.precision);

		this.valueElement.textContent = this.value;

		if (this.persistState)
		{
			const searchParams = new URLSearchParams(window.location.search);

			if (this.element.value !== undefined)
			{
				searchParams.set(
					this.element.id,
					encodeURIComponent(this.element.value)
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

	setBounds({
		min = this.min,
		max = this.max,
		callOnInput = false
	}) {
		if (min > max)
		{
			throw new Error(`Minimum slider value of ${min} is larger than maximum of ${max}!`);
		}

		this.min = min;
		this.max = max;

		this.precision = Math.max(
			0,
			3 - Math.floor(
				Math.log10(
					(this.logarithmic ? 10 ** this.max : this.max)
						- (this.logarithmic ? 10 ** this.min : this.min)
				)
			)
		);
		
		this.element.setAttribute("min", this.min);
		this.element.setAttribute("max", this.max);

		if (this.value > this.max)
		{
			this.setValue(this.max, callOnInput);
		}

		else if (this.value < this.min)
		{
			this.setValue(this.min, callOnInput);
		}
	}
}