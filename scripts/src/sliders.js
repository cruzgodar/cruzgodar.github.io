import { InputElement } from "./inputElement.js";

export class Slider extends InputElement
{
	subtextElement;
	valueElement;
	value;
	min;
	max;
	precision;
	logarithmic;
	integer;
	onInput;

	constructor({
		element,
		name,
		value,
		min,
		max,
		logarithmic = false,
		integer = false,
		onInput = () => {}
	})
	{
		super({ element, name });
		this.subtextElement = this.element.nextElementSibling.firstElementChild;

		this.logarithmic = logarithmic;
		this.integer = integer;

		this.value = parseFloat(value);
		this.min = parseFloat(min);
		this.max = parseFloat(max);

		if (this.logarithmic)
		{
			this.value = Math.log10(this.value);
			this.min = Math.log10(this.min);
			this.max = Math.log10(this.max);
		}

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

		this.element.addEventListener("input", () =>
		{
			this.value = this.logarithmic
				? 10 ** parseFloat(this.element.value)
				: parseFloat(this.element.value);
			this.value = this.integer
				? Math.round(this.value)
				: this.value.toFixed(this.precision);
			this.valueElement.textContent = this.value;

			this.onInput();
		});
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

		if (callOnInput)
		{
			this.onInput();
		}
	}

	setBounds({ min = this.min, max = this.max })
	{
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
	}
}