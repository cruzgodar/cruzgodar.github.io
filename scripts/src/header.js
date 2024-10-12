import anime from "../anime.js";
import { Checkbox } from "./checkboxes.js";
import { addHoverEvent, addHoverEventWithScale } from "./hoverEvents.js";
import { redirect } from "./navigation.js";
import {
	siteSettings,
	toggleDarkTheme,
	toggleIncreaseContrast,
	toggleReduceMotion
} from "./settings.js";

export let headerElement;

let accessibilityTooltipElement;
export let darkThemeCheckbox;
export let reduceMotionCheckbox;
export let increaseContrastCheckbox;

let accessibilityDialogOpen = false;

export function addHeader()
{
	document.body.firstChild.insertAdjacentHTML("beforebegin", /* html */`
		<div id="header-container" style="opacity: 0"></div>
		
		<div id="header" style="opacity: 0">
			<a id="header-logo" href="/home/">
				<img src="/graphics/header-icons/logo.webp"></img>
				<span>Cruz Godar</span>
			</a>
			
			<div id="header-links">
				<a id="header-gallery-link" href="/gallery/">
					<span>Gallery</span>
					<img src="/graphics/header-icons/gallery.webp"></img>
				</a>
				
				<a id="header-applets-link" href="/applets/">
					<span>Applets</span>
					<img src="/graphics/header-icons/applets.webp"></img>
				</a>
				
				<a id="header-teaching-link" href="/teaching/">
					<span>Teaching</span>
					<img src="/graphics/header-icons/teaching.webp"></img>
				</a>
				
				<a id="header-slides-link" href="/slides/">
					<span>Slides</span>
					<img src="/graphics/header-icons/slides.webp"></img>
				</a>
				
				<a id="header-writing-link" href="/writing/">
					<span>Writing</span>
					<img src="/graphics/header-icons/writing.webp"></img>
				</a>
				
				<a id="header-about-link" href="/about/">
					<span>About</span>
					<img src="/graphics/header-icons/about.webp"></img>
				</a>
			</div>

			<div id="header-settings-button">
				<input type="image" src="/graphics/header-icons/gear.webp" class="keep-accessibility-dialog-open">
			</div>
		</div>

		<div id="accessibility-tooltip" class="keep-accessibility-dialog-open">
			<h2 class="section-text keep-accessibility-dialog-open">Site Settings</h2>

			<div class="checkboxes keep-accessibility-dialog-open">
				<div class="checkbox-row keep-accessibility-dialog-open">
					<div class="checkbox-container keep-accessibility-dialog-open" tabindex="1">
						<input type="checkbox" id="dark-theme-checkbox" class="keep-accessibility-dialog-open">
						<div class="checkbox keep-accessibility-dialog-open"></div>
					</div>
					<label for="dark-theme-checkbox" style="margin-left: 10px" class="keep-accessibility-dialog-open">
						<p class="body-text checkbox-subtext keep-accessibility-dialog-open"></p>
					</label>
				</div>
			</div>

			<div class="checkboxes keep-accessibility-dialog-open">
				<div class="checkbox-row keep-accessibility-dialog-open">
					<div class="checkbox-container keep-accessibility-dialog-open" tabindex="1">
						<input type="checkbox" id="reduce-motion-checkbox" class="keep-accessibility-dialog-open">
						<div class="checkbox keep-accessibility-dialog-open"></div>
					</div>
					<label for="reduce-motion-checkbox" style="margin-left: 10px" class="keep-accessibility-dialog-open">
						<p class="body-text checkbox-subtext keep-accessibility-dialog-open"></p>
					</label>
				</div>
			</div>

			<div class="checkboxes keep-accessibility-dialog-open">
				<div class="checkbox-row keep-accessibility-dialog-open">
					<div class="checkbox-container keep-accessibility-dialog-open" tabindex="1">
						<input type="checkbox" id="increase-contrast-checkbox" class="keep-accessibility-dialog-open">
						<div class="checkbox keep-accessibility-dialog-open"></div>
					</div>
					<label for="increase-contrast-checkbox" style="margin-left: 10px" class="keep-accessibility-dialog-open">
						<p class="body-text checkbox-subtext keep-accessibility-dialog-open"></p>
					</label>
				</div>
			</div>
		</div>
	`);

	setTimeout(() =>
	{
		const imageElement = document.body.querySelector("#header-logo img");

		imageElement.style.width = `${imageElement.getBoundingClientRect().height}px`;



		document.body.querySelectorAll("#header-logo, #header-links a")
			.forEach(link =>
			{
				const addBounceOnTouch = link.id === "header-logo"
					? () => window.innerWidth <= 700
					: () => window.innerWidth <= 550;

				addHoverEvent({ element: link, addBounceOnTouch });

				const href = link.getAttribute("href");

				link.setAttribute("href", "/index.html?page=" + encodeURIComponent(href));

				link.addEventListener("click", e =>
				{
					e.preventDefault();

					redirect({ url: href, inNewTab: e.metaKey });
				});
			});

		

		const settingsButtonElement = document.body.querySelector("#header-settings-button");

		addHoverEvent({ element: settingsButtonElement, addBounceOnTouch: () => true });

		settingsButtonElement.addEventListener("click", e =>
		{
			e.preventDefault();

			if (accessibilityDialogOpen)
			{
				hideAccessibilityDialog();
			}

			else
			{
				showAccessibilityDialog();
			}
		});



		accessibilityTooltipElement = document.body.querySelector("#accessibility-tooltip");

		document.documentElement.addEventListener("pointerdown", e =>
		{
			if (
				accessibilityDialogOpen
				&& !(e.target.classList.contains("keep-accessibility-dialog-open"))
			)
			{
				hideAccessibilityDialog();
			}
		});



		darkThemeCheckbox = new Checkbox({
			element: document.body.querySelector("#dark-theme-checkbox"),
			name: "Dark theme",
			checked: siteSettings.darkTheme,
			onInput: () => toggleDarkTheme({})
		});

		addHoverEventWithScale({
			element: darkThemeCheckbox.element.parentNode,
			scale: 1.1,
			addBounceOnTouch: () => true
		});



		reduceMotionCheckbox = new Checkbox({
			element: document.body.querySelector("#reduce-motion-checkbox"),
			name: "Reduce motion",
			checked: siteSettings.reduceMotion,
			onInput: () => toggleReduceMotion()
		});

		addHoverEventWithScale({
			element: reduceMotionCheckbox.element.parentNode,
			scale: 1.1,
			addBounceOnTouch: () => true
		});



		increaseContrastCheckbox = new Checkbox({
			element: document.body.querySelector("#increase-contrast-checkbox"),
			name: "Increase contrast",
			checked: siteSettings.increaseContrast,
			onInput: () => toggleIncreaseContrast({})
		});

		addHoverEventWithScale({
			element: increaseContrastCheckbox.element.parentNode,
			scale: 1.1,
			addBounceOnTouch: () => true
		});



		headerElement = document.body.querySelector("#header");
	});
}

async function showAccessibilityDialog()
{
	if (accessibilityDialogOpen)
	{
		return;
	}

	accessibilityDialogOpen = true;

	accessibilityTooltipElement.style.transform = siteSettings.reduceMotion
		? "scale(1)"
		: "translateX(8px) translateY(-8px) scale(.95)";

	accessibilityTooltipElement.style.display = "block";

	await anime({
		targets: accessibilityTooltipElement,
		opacity: 1,
		scale: 1,
		translateX: 0,
		translateY: 0,
		duration: 150,
		easing: "easeOutQuad"
	}).finished;
}

async function hideAccessibilityDialog()
{
	if (!accessibilityDialogOpen)
	{
		return;
	}

	accessibilityDialogOpen = false;
	
	await anime({
		targets: accessibilityTooltipElement,
		opacity: 0,
		scale: siteSettings.reduceMotion ? 1 : .95,
		translateX: siteSettings.reduceMotion ? 0 : 8,
		translateY: siteSettings.reduceMotion ? 0 : -8,
		duration: 150,
		easing: "easeOutQuad"
	}).finished;

	accessibilityTooltipElement.style.display = "none";
}