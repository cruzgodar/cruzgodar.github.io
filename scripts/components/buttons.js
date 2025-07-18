import { changeOpacity } from "../src/animation.js";
import {
	$$,
	addTemporaryListener,
	addTemporaryParam,
	pageUrl
} from "../src/main.js";
import { redirect } from "../src/navigation.js";
import { sitemap } from "../src/sitemap.js";
import { Dropdown } from "./dropdowns.js";
import { InputElement } from "./inputElement.js";

export class Button extends InputElement
{
	linked;

	constructor({
		element,
		name,
		onClick,
		linked = true
	}) {
		super({ element, name });
		this.linked = linked;
		this.onClick = onClick;
		
		this.element.textContent = this.name;

		if (this.linked)
		{
			element.classList.add("linked-text-button");
		}

		this.element.addEventListener("click", (e) =>
		{
			if (!this.disabled)
			{
				this.onClick(e);
			}
		});

		equalizeTextButtons();
	}
}

export class GenerateButton extends Button
{
	constructor({
		element,
		onClick,
		linked = true
	}) {
		super({
			element,
			name: "Generate",
			onClick,
			linked
		});
	}
}

export class DownloadButton extends Button
{
	constructor({
		element,
		linked = true,
		applet,
		filename = () => {}
	}) {
		super({
			element,
			name: "Download",
			linked,
			onClick: () =>
			{
				if (applet.downloadFrame)
				{
					applet.downloadFrame(filename());
					return;
				}

				applet.wilson.downloadFrame(filename());
			},
		});
	}
}

export class DownloadHighResButton extends Dropdown
{
	constructor({
		element,
		applet,
		filename = () => {}
	}) {
		const options = {
			"current": "Current",
			"1k": "1K",
			"2k": "2K",
			"4k": "4K",
			"8k": "8K"
		};

		const resolutions = {
			"1k": 1024,
			"2k": 2048,
			"4k": 4096,
			"8k": 8128
		};

		function onInput()
		{
			const resolution = resolutions[this.value];

			if (applet.downloadHighResFrame)
			{
				applet.downloadHighResFrame(filename(), resolution);
				return;
			}

			applet.wilson.downloadHighResFrame(filename(), resolution);
		}

		super({
			element,
			name: "Download",
			options,
			roundCorners: false,
			returnToTitleOnSelect: true,
			onInput
		});
	}
}

// Starts on name0 and toggles when clicked.
export class ToggleButton extends Button
{
	state = false;
	persistState;
	name0;
	name1;
	// Both onClick methods have the signature (instant) => {}.
	onClick0;
	onClick1;
	currentlyAnimating = false;

	constructor({
		element,
		name0,
		name1,
		persistState = true,
		onClick0,
		onClick1,
		linked = true
	}) {
		const onClick = async () =>
		{
			if (this.currentlyAnimating)
			{
				return;
			}

			this.currentlyAnimating = true;

			(this.state ? this.onClick1 : this.onClick0)(false);

			this.state = !this.state;

			await changeOpacity({ element: this.element, opacity: 0 });

			this.element.textContent = this.state ? this.name1 : this.name0;

			if (this.persistState)
			{
				const searchParams = new URLSearchParams(window.location.search);
				
				searchParams.set(
					this.element.id,
					this.state ? "1" : "0"
				);

				const string = searchParams.toString();

				window.history.replaceState(
					{ url: pageUrl },
					"",
					pageUrl.replace(/\/home/, "") + "/" + (string ? `?${string}` : "")
				);
			}

			await changeOpacity({ element: this.element, opacity: 1 });

			this.currentlyAnimating = false;
		};

		super({
			element,
			name: name0,
			onClick,
			linked
		});

		this.name0 = name0;
		this.name1 = name1;
		this.persistState = persistState;
		this.onClick0 = onClick0;
		this.onClick1 = onClick1;

		if (this.persistState)
		{
			const value = new URLSearchParams(window.location.search).get(this.element.id);
			
			if (value === "1")
			{
				setTimeout(() =>
				{
					this.setState({
						newState: true,
						callOnInput: true
					});

					this.loadResolve();
				}, 10);
			}

			else if (value === "0")
			{
				setTimeout(() =>
				{
					this.setState({
						newState: false,
						callOnInput: true
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

	async setState({
		newState,
		callOnInput = false
	}) {
		if (this.state !== newState)
		{
			this.state = newState;

			if (callOnInput)
			{
				(this.state ? this.onClick1 : this.onClick0)(true);
			}

			if (this.persistState)
			{
				const searchParams = new URLSearchParams(window.location.search);
				
				searchParams.set(
					this.element.id,
					this.state ? "1" : "0"
				);

				const string = searchParams.toString();

				window.history.replaceState(
					{ url: pageUrl },
					"",
					pageUrl.replace(/\/home/, "") + "/" + (string ? `?${string}` : "")
				);
			}

			this.currentlyAnimating = true;

			await changeOpacity({ element: this.element, opacity: 0 });
			
			this.element.textContent = this.state ? this.name1 : this.name0;

			await changeOpacity({ element: this.element, opacity: 1 });

			this.currentlyAnimating = false;
		}
	}
}



export function initTextButtons()
{
	addTemporaryListener({
		object: window,
		event: "resize",
		callback: equalizeTextButtons
	});

	setTimeout(equalizeTextButtons, 50);
	setTimeout(equalizeTextButtons, 500);
}

// Makes linked text buttons have the same width and height.
export function equalizeTextButtons()
{
	for (const textButton of $$(".text-button"))
	{
		textButton.parentNode.style.margin = "0 auto";
	}

	const heights = [];
	let maxHeight = 0;

	const widths = [];
	let maxWidth = 0;

	const elements = $$(".linked-text-button");

	for (const [index, element] of elements.entries())
	{
		element.style.height = "fit-content";
		element.style.width = "fit-content";

		heights.push(element.offsetHeight);

		if (heights[index] > maxHeight)
		{
			maxHeight = heights[index];
		}

		widths.push(element.offsetWidth);

		if (widths[index] > maxWidth)
		{
			maxWidth = widths[index];
		}
	}

	for (const [index, element] of elements.entries())
	{
		if (heights[index] < maxHeight)
		{
			element.style.height = maxHeight + "px";
		}

		else
		{
			element.style.height = "fit-content";
		}

		if (widths[index] < maxWidth)
		{
			element.style.width = maxWidth + "px";
		}

		else
		{
			element.style.width = "fit-content";
		}

		element.parentNode.parentNode.style.gridTemplateColumns = `repeat(auto-fit, ${maxWidth}px)`;
	}
}

export function initNavButtons()
{
	const parent = sitemap[pageUrl].parent;

	if (!parent)
	{
		return;
	}

	const list = sitemap[sitemap[pageUrl].parent].children;
	const index = list.indexOf(pageUrl);

	if (index === -1)
	{
		console.error("Page not found in page list!");

		return;
	}

	if (index > 0)
	{
		for (const element of $$(".previous-nav-button"))
		{
			element.addEventListener("click", () => redirect({ url: list[index - 1] }));
		}
	}

	else
	{
		for (const element of $$(".previous-nav-button"))
		{
			element.parentNode.remove();
		}
	}


	for (const element of $$(".home-nav-button"))
	{
		element.addEventListener("click", () => redirect({ url: sitemap[pageUrl].parent }));
	}



	if (index < list.length - 1)
	{
		for (const element of $$(".next-nav-button"))
		{
			element.addEventListener("click", () => redirect({ url: list[index + 1] }));
		}
	}

	else
	{
		for (const element of $$(".next-nav-button"))
		{
			element.parentNode.remove();
		}
	}



	const navButtons = $$(".nav-buttons");
	if (navButtons && navButtons.length > 0)
	{
		navButtons[0].style.marginTop = "0";
		navButtons[0].style.marginBottom = "32px";
	}
}