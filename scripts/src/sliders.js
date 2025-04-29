import { addHoverEventWithScale } from "./hoverEvents.js";
import { InputElement } from "./inputElement.js";
import { currentlyTouchDevice } from "./interaction.js";
import { addTemporaryListener, addTemporaryParam, pageUrl } from "./main.js";

export class Slider extends InputElement
{
	trackElement;
	subtextElement;
	valueElement;
	value;
	displayValue;

	lastValueElementTextContent;

	min;
	max;
	logMin;
	logMax;

	snapPoints;
	snapThreshhold;
	precision;
	logarithmic;
	integer;
	persistState;
	thumbSize;
	currentlyDragging = false;
	dragOffset;
	onInput;

	constructor({
		element,
		name,
		value,
		min,
		max,
		snapThreshhold = 1 / 50,
		snapPoints = [],
		logarithmic = false,
		integer = false,
		persistState = true,
		onInput = () => {}
	}) {
		super({ element, name });
		this.subtextElement = this.element.nextElementSibling;
		this.trackElement = this.element.previousElementSibling;

		this.logarithmic = logarithmic;
		this.integer = integer;

		this.value = parseFloat(value);
		this.min = parseFloat(min);
		this.max = parseFloat(max);
		this.logMin = Math.log(this.min);
		this.logMax = Math.log(this.max);
		this.snapPoints = snapPoints;
		this.snapThreshhold = snapThreshhold;

		this.persistState = persistState;
		this.onInput = onInput;

		// The number of decimal places to round to to get 4 significant figures.
		this.precision = Math.max(
			0,
			3 - Math.floor(
				Math.log10(this.max - this.min)
			)
		);

		this.value = this.integer
			? Math.round(this.value)
			: this.value;

		this.displayValue = this.integer
			? this.value
			: this.value.toFixed(this.precision);

		this.subtextElement.textContent = `${name}: `;
		this.valueElement = document.createElement("span");
		this.valueElement.textContent = this.displayValue;
		this.lastValueElementTextContent = this.valueElement.textContent;
		this.valueElement.setAttribute("contenteditable", "true");
		this.subtextElement.appendChild(this.valueElement);

		this.valueElement.addEventListener("input", () =>
		{
			const offset = getCaretCharacterOffsetWithin(this.valueElement);
			let offsetAdjustment = 0;

			this.valueElement.textContent = this.valueElement.textContent
				.replaceAll(/[^0-9.-]/g, (match) =>
				{
					offsetAdjustment -= match.length;
					return "";
				});

			this.lastValueElementTextContent = this.valueElement.textContent;

			setCaretPosition(this.valueElement, offset + offsetAdjustment);

			this.setValue(parseFloat(this.valueElement.textContent), true, false);
		});

		this.value = parseFloat(this.value);

		

		this.thumbSize = currentlyTouchDevice ? 26 : 18;
		this.element.style.width = `${this.thumbSize}px`;
		this.element.style.height = `${this.thumbSize}px`;
		this.element.style.top = `-${this.thumbSize / 2 + 2.5 / 2}px`;

		this.subtextElement.style.marginTop = currentlyTouchDevice ? "16px" : "12px";

		addHoverEventWithScale({
			element: this.element,
			scale: 1.1,
		});

		this.element.addEventListener("pointerdown", (e) =>
		{
			this.currentlyDragging = true;
			this.dragOffset = e.clientX - this.element.getBoundingClientRect().left - 2.5 / 2;
		});

		addTemporaryListener({
			object: document.documentElement,
			event: "touchend",
			callback: this.onEndDrag.bind(this)
		});
		addTemporaryListener({
			object: document.documentElement,
			event: "mouseup",
			callback: this.onEndDrag.bind(this)
		});

		addTemporaryListener({
			object: document.documentElement,
			event: "mousemove",
			callback: (e) =>
			{
				if (this.currentlyDragging)
				{
					e.preventDefault();
					
					const trackRect = this.trackElement.getBoundingClientRect();
					const x = e.clientX - trackRect.left - this.dragOffset;
					const maxX = trackRect.width - this.thumbSize - 2.5 * 2;
					const clampedX = Math.min(Math.max(x, 0), maxX);
					this.element.style.left = `${clampedX}px`;

					this.setRawValue(clampedX / maxX);
				}
			},
			options: { passive: false }
		});

		addTemporaryListener({
			object: document.documentElement,
			event: "touchmove",
			callback: (e) =>
			{
				if (this.currentlyDragging)
				{
					e.preventDefault();
					
					const trackRect = this.trackElement.getBoundingClientRect();
					const x = e.touches[0].clientX - trackRect.left - this.dragOffset;
					const maxX = trackRect.width - this.thumbSize - 2.5 * 2;
					const clampedX = Math.min(Math.max(x, 0), maxX);
					this.element.style.left = `${clampedX}px`;

					this.setRawValue(clampedX / maxX);
				}
			},
			options: { passive: false }
		});

		setTimeout(() =>
		{
			if (this.persistState)
			{
				const value = new URLSearchParams(window.location.search).get(this.element.id);
				
				if (value)
				{
					this.setValue(parseFloat(decodeURIComponent(value)), true);
				}

				else
				{
					this.setValue(this.value);
				}

				addTemporaryParam(this.element.id);
			}

			else
			{
				this.setValue(this.value);
			}

			this.loadResolve();
		}, 10);
	}



	onEndDrag()
	{
		if (this.currentlyDragging)
		{
			this.currentlyDragging = false;

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
		}
	}

	// Sets the value using a proportion between 0 and 1.
	setRawValue(newValue)
	{
		const oldValue = this.value;

		this.value = this.logarithmic
			? Math.exp(parseFloat(this.logMin + newValue * (this.logMax - this.logMin)))
			: parseFloat(this.min + newValue * (this.max - this.min));

		for (let i = 0; i < this.snapPoints.length; i++)
		{
			const snapPointProportion = this.logarithmic
				? (Math.log(this.snapPoints[i]) - this.logMin) / (this.logMax - this.logMin)
				: (this.snapPoints[i] - this.min) / (this.max - this.min);

			const distanceToSnapPoint = Math.abs(snapPointProportion - newValue);

			if (distanceToSnapPoint < this.snapThreshhold)
			{
				this.value = this.snapPoints[i];
				break;
			}
		}

		this.value = this.integer
			? Math.round(this.value)
			: this.value;

		this.displayValue = this.integer
			? this.value
			: this.value.toFixed(this.precision);

		this.valueElement.textContent = this.displayValue;

		this.value = parseFloat(this.value);
		
		this.setValue(this.value, oldValue !== this.value);
	}

	setValue(newValue, callOnInput = false, updateValueElement = true)
	{
		this.value = newValue;

		const sliderProportion = this.logarithmic
			? (Math.log(this.value) - this.logMin) / (this.logMax - this.logMin)
			: (this.value - this.min) / (this.max - this.min);

		const clampedSliderProportion = Math.min(Math.max(sliderProportion, 0), 1);

		const trackRect = this.trackElement.getBoundingClientRect();
		const maxX = trackRect.width - this.thumbSize - 2.5 * 2;
		this.element.style.left = `${clampedSliderProportion * maxX}px`;

		this.displayValue = this.integer
			? this.value
			: this.value.toFixed(this.precision);
		
		if (updateValueElement)
		{
			this.valueElement.textContent = this.displayValue;
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

		this.logMin = Math.log(this.min);
		this.logMax = Math.log(this.max);

		this.precision = Math.max(
			0,
			3 - Math.floor(
				Math.log10(this.max - this.min)
			)
		);

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

function getCaretCharacterOffsetWithin(el) {
	const sel = window.getSelection();
	let charCount = 0;
	if (sel.anchorNode && el.contains(sel.anchorNode)) {
		const range = sel.getRangeAt(0);
		const preRange = range.cloneRange();
		preRange.selectNodeContents(el);
		preRange.setEnd(range.startContainer, range.startOffset);
		charCount = preRange.toString().length;
	}
	return charCount;
}

function setCaretPosition(el, offset) {
	const range = document.createRange();
	const sel = window.getSelection();
	let charCount = 0;

	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
	let node;
	while ((node = walker.nextNode())) {
		const nextCharCount = charCount + node.length;
		if (offset <= nextCharCount) {
			range.setStart(node, offset - charCount);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
			return;
		}
		charCount = nextCharCount;
	}
}