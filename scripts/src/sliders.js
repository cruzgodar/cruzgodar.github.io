import { CappedInputElement, uncapEverything } from "./cappedInputElement.js";
import { addHoverEventWithScale } from "./hoverEvents.js";
import { addStyle, addTemporaryListener, addTemporaryParam, pageUrl } from "./main.js";
import { clamp } from "./utils.js";

const trackWidth = 170;
const thumbWidth = 24;

export class Slider extends CappedInputElement
{
	trackElement;
	subtextElement;
	valueElement;
	tickElements = [];

	value;
	defaultValue;
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
		super({
			element,
			name,
			max: parseFloat(max),
			min: parseFloat(min),
			labelElement: element.nextElementSibling,
			capClassElement: element.parentElement
		});

		this.subtextElement = this.element.nextElementSibling;
		this.trackElement = this.element.previousElementSibling;

		this.logarithmic = logarithmic;
		this.integer = integer;

		this.value = parseFloat(value);
		this.defaultValue = this.value;
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
		this.valueElement.classList.add("slider-value");
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

			this.updatePersistedState();
		});

		this.valueElement.addEventListener("blur", () =>
		{
			if (this.valueElement.textContent === "")
			{
				this.setValue(this.defaultValue, true);

				this.updatePersistedState();
			}

			this.updateCaps();
		});

		this.setCap();

		

		addHoverEventWithScale({
			element: this.element,
			scale: 1.1,
		});

		this.element.addEventListener("pointerdown", (e) =>
		{
			this.onGrabThumb();

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
					const maxX = trackRect.width - thumbWidth - 2.5 * 2;
					const clampedX = clamp(x, 0, maxX);
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
					const maxX = trackRect.width - thumbWidth - 2.5 * 2;
					const clampedX = clamp(x, 0, maxX);
					this.element.style.left = `${clampedX}px`;

					this.setRawValue(clampedX / maxX);
				}
			},
			options: { passive: false }
		});

		this.addTickMarks();



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



	addTickMarks()
	{
		for (const tick of this.tickElements)
		{
			tick.remove();
		}

		const ticks = this.snapPoints.length
			? this.snapPoints
			: this.integer && this.max - this.min < 10
				? Array.from({ length: this.max - this.min + 1 }, (_, i) => this.min + i)
				: [];

		const usableWidth = trackWidth - (thumbWidth + 5);

		for (const tick of ticks)
		{
			const tickElement = document.createElement("div");
			tickElement.classList.add("slider-tick");

			const proportion = this.logarithmic
				? (Math.log(tick) - this.logMin) / (this.logMax - this.logMin)
				: (tick - this.min) / (this.max - this.min);

			const left = proportion * usableWidth + (thumbWidth + 5) / 2 - 2.5 / 2;
			tickElement.style.left = `${left}px`;
			this.element.parentElement.appendChild(tickElement);

			this.tickElements.push(tickElement);
		}
	}

	onGrabThumb()
	{
		this.currentlyDragging = true;

		this.temporaryStyleElement = addStyle(`
			*
			{
				user-select: none;
				-webkit-user-select: none;
				cursor: pointer;
			}
		`);

		for (const tickElement of this.tickElements)
		{
			tickElement.style.top = "-2.5px";
			tickElement.style.height = "7.5px";
		}
	}

	onReleaseThumb()
	{
		this.currentlyDragging = false;

		this.temporaryStyleElement.remove();

		for (const tickElement of this.tickElements)
		{
			tickElement.style.top = "0px";
			tickElement.style.height = "2.5px";
		}
	}

	onEndDrag()
	{
		if (this.currentlyDragging)
		{
			this.onReleaseThumb();

			this.updatePersistedState();
		}
	}

	updatePersistedState()
	{
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

		const sliderProportion = this.logarithmic
			? (Math.log(this.value) - this.logMin) / (this.logMax - this.logMin)
			: (this.value - this.min) / (this.max - this.min);

		const clampedSliderProportion = clamp(sliderProportion, 0, 1);

		void(this.trackElement.offsetWidth);

		const maxX = trackWidth - thumbWidth - 2.5 * 2;
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

		this.setValue(clamp(this.value, this.min, this.max), callOnInput);

		this.addTickMarks();
	}
}

function getCaretCharacterOffsetWithin(el)
{
	const sel = window.getSelection();

	let charCount = 0;

	if (sel.anchorNode && el.contains(sel.anchorNode))
	{
		const range = sel.getRangeAt(0);
		const preRange = range.cloneRange();
		preRange.selectNodeContents(el);
		preRange.setEnd(range.startContainer, range.startOffset);
		charCount = preRange.toString().length;
	}

	return charCount;
}

function setCaretPosition(el, offset)
{
	const range = document.createRange();
	const sel = window.getSelection();
	let charCount = 0;

	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);

	let node;

	while ((node = walker.nextNode()))
	{
		const nextCharCount = charCount + node.length;

		if (offset <= nextCharCount)
		{
			range.setStart(node, offset - charCount);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
			return;
		}
		
		charCount = nextCharCount;
	}
}