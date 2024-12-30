import { currentlyLoadedApplets } from "../applets/applet.js";
import { cardIsOpen } from "./cards.js";
import { recreateDesmosGraphs } from "./desmos.js";
import { darkThemeCheckbox, increaseContrastCheckbox, reduceMotionCheckbox } from "./header.js";
import {
	$$,
	addStyle,
	pageUrl
} from "./main.js";
import { getDisplayUrl } from "./navigation.js";
import anime from "/scripts/anime.js";

export const forceThemePages =
{
	"/gallery/": true,
	"/slides/oral-exam/": true
};

const rootElement = document.querySelector(":root");

export const metaThemeColorElement = document.querySelector("#theme-color-meta");


let themeToggles = 0;


const params = new URLSearchParams(window.location.search);

const darkTheme = (() =>
{
	if (params.get("theme") === null)
	{
		return matchMedia("(prefers-color-scheme: dark)").matches;
	}

	return params.get("theme") === "1";
})();

const reduceMotion = (() =>
{
	if (params.get("reducemotion") === null)
	{
		return matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	return params.get("reducemotion") === "1";
})();

const increaseContrast = (() =>
{
	if (params.get("increasecontrast") === null)
	{
		return matchMedia("(prefers-contrast: more)").matches;
	}

	return params.get("increasecontrast") === "1";
})();

export const siteSettings =
{
	darkTheme,
	reduceMotion,
	increaseContrast,
	card: params.get("card"),
	resolutionMultiplier: parseFloat(params.get("resmult") ?? "1"),
};



// Set to false, true, or null for when a page has forced a theme and it needs to change back.
let revertThemeTo = null;

export function setRevertThemeTo(newRevertThemeTo)
{
	revertThemeTo = newRevertThemeTo;
}



let forcedTheme = false;

export function setForcedTheme(newForcedTheme)
{
	forcedTheme = newForcedTheme;

	if (darkThemeCheckbox)
	{
		darkThemeCheckbox.setDisabled(true);
	}
}



export function getQueryParams()
{
	const params = new URLSearchParams(window.location.search);



	params.delete("page");

	if (!forcedTheme)
	{
		if (siteSettings.darkTheme && !matchMedia("(prefers-color-scheme: dark)").matches)
		{
			params.set("theme", "1");
		}

		else if (!siteSettings.darkTheme && matchMedia("(prefers-color-scheme: dark)").matches)
		{
			params.set("theme", "0");
		}

		else
		{
			params.delete("theme");
		}
	}



	if (siteSettings.reduceMotion && !matchMedia("(prefers-reduced-motion: reduce)").matches)
	{
		params.set("reducemotion", "1");
	}

	else if (
		!siteSettings.reduceMotion
		&& matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		params.set("reducemotion", "0");
	}

	else
	{
		params.delete("reducemotion");
	}



	if (siteSettings.increaseContrast && !matchMedia("(prefers-contrast: more)").matches)
	{
		params.set("increasecontrast", "1");
	}

	else if (
		!siteSettings.increaseContrast
		&& matchMedia("(prefers-contrast: more)").matches
	) {
		params.set("increasecontrast", "0");
	}

	else
	{
		params.delete("increasecontrast");
	}



	if (siteSettings.card)
	{
		params.set("card", siteSettings.card);
	}

	else
	{
		params.delete("card");
	}

	

	if (siteSettings.resolutionMultiplier && siteSettings.resolutionMultiplier !== 1)
	{
		params.set("resmult", siteSettings.resolutionMultiplier);
	}

	else
	{
		params.delete("resmult");
	}



	if (window.OFFLINE)
	{
		params.set("debug", "2");
	}

	else if (window.DEBUG)
	{
		params.set("debug", "1");
	}

	else
	{
		params.delete("debug");
	}
	
	return params.toString();
}



export function initReduceMotion()
{
	matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) =>
	{
		siteSettings.reduceMotion = e.matches;

		reduceMotionCheckbox && reduceMotionCheckbox.setChecked({
			newChecked: siteSettings.reduceMotion
		});
	});
}

export function initIncreaseContrast()
{
	matchMedia("(prefers-contrast: more)").addEventListener("change", (e) =>
	{
		if (e.matches !== siteSettings.increaseContrast)
		{
			toggleIncreaseContrast({});

			increaseContrastCheckbox &&
				increaseContrastCheckbox.setChecked({
					newChecked: siteSettings.increaseContrast
				});
		}
	});

	if (siteSettings.increaseContrast)
	{
		siteSettings.increaseContrast = false;

		toggleIncreaseContrast({ noAnimation: true });
	}
}

export async function initDarkTheme()
{
	matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) =>
	{
		if (cardIsOpen)
		{
			return;
		}

		if ((e.matches && !siteSettings.darkTheme) || (!e.matches && siteSettings.darkTheme))
		{
			toggleDarkTheme({});
		}
	});

	if (forceThemePages[pageUrl] !== undefined)
	{
		if (forceThemePages[pageUrl])
		{
			setForcedTheme(true);
			setRevertThemeTo(siteSettings.darkTheme);
			siteSettings.darkTheme = !forceThemePages[pageUrl];
			await toggleDarkTheme({ noAnimation: true, force: true });
		}

		else if (!forceThemePages[pageUrl])
		{
			revertTheme();
		}

		return;
	}

	if (siteSettings.darkTheme)
	{
		siteSettings.darkTheme = false;

		await toggleDarkTheme({ noAnimation: true });
	}
}



export async function revertTheme()
{
	if (forcedTheme)
	{
		forcedTheme = false;
	}

	if (darkThemeCheckbox)
	{
		darkThemeCheckbox.setDisabled(false);
	}

	if (revertThemeTo === null)
	{
		return;
	}

	if (siteSettings.darkTheme !== revertThemeTo)
	{
		await toggleDarkTheme({ force: true });
	}
	
	revertThemeTo = null;
}

export async function toggleDarkTheme({
	noAnimation = false,
	force = false,
	duration = 500
}) {
	if (!force && pageUrl in forceThemePages)
	{
		return;
	}

	if (handleEasterEgg())
	{
		return;
	}

	updateCode(0);

	siteSettings.darkTheme = !siteSettings.darkTheme;

	darkThemeCheckbox && darkThemeCheckbox.setChecked({
		newChecked: siteSettings.darkTheme
	});

	recreateDesmosGraphs();

	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());

	if (noAnimation)
	{
		metaThemeColorElement.setAttribute(
			"content",
			siteSettings.darkTheme ? "#181818" : "#ffffff"
		);

		rootElement.style.setProperty("--theme", siteSettings.darkTheme ? 1 : 0);
	}

	else
	{
		const element = addStyle(`
			*:not(.page, #banner, .desmos-container)
			{
				transition: none !important;
			}
		`);

		const dummy = { t: siteSettings.darkTheme ? 0 : 1 };

		await Promise.all([
			anime({
				targets: metaThemeColorElement,
				content: siteSettings.darkTheme ? "#181818" : "#ffffff",
				duration,
				easing: "cubicBezier(.25, .1, .25, 1)",
			}).finished,

			anime({
				targets: dummy,
				t: siteSettings.darkTheme ? 1 : 0,
				duration,
				easing: "cubicBezier(.25, .1, .25, 1)",
				update: () =>
				{
					rootElement.style.setProperty("--theme", dummy.t);
				},
				complete: () =>
				{
					rootElement.style.setProperty("--theme", siteSettings.darkTheme ? 1 : 0);
				},
			}).finished
		]);

		element.remove();
	}
}



export async function toggleReduceMotion()
{
	updateCode(1);

	siteSettings.reduceMotion = !siteSettings.reduceMotion;

	currentlyLoadedApplets.forEach(applet =>
	{
		for (const wilson of applet.wilsons)
		{
			wilson.reduceMotion = siteSettings.reduceMotion;
		}
	});

	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());
}



export async function toggleIncreaseContrast({
	noAnimation = false,
	duration = 150
}) {
	updateCode(2);

	siteSettings.increaseContrast = !siteSettings.increaseContrast;

	history.replaceState({ url: pageUrl }, document.title, getDisplayUrl());

	if (noAnimation)
	{
		rootElement.style.setProperty("--contrast", siteSettings.increaseContrast ? 1 : 0);
	}

	else
	{
		const element = addStyle(`
			*:not(.checkbox)
			{
				transition: none !important;
			}
		`);

		const dummy = { t: siteSettings.increaseContrast ? 0 : 1 };

		await anime({
			targets: dummy,
			t: siteSettings.increaseContrast ? 1 : 0,
			duration,
			easing: "easeInOutSine",
			update: () =>
			{
				rootElement.style.setProperty("--contrast", dummy.t);
			},
			complete: () =>
			{
				rootElement.style.setProperty(
					"--contrast",
					siteSettings.increaseContrast ? 1 : 0
				);
			},
		}).finished;

		element.remove();
	}
}

let settingsCode = [];
const streetlightsCode = [0, 1, 2, 1, 0, 1, 2, 1, 0];
let streetLightsCodeMet = false;

function updateCode(digit)
{
	settingsCode.push(digit);
	
	if (settingsCode.length >= streetlightsCode.length)
	{
		settingsCode = settingsCode.slice(-streetlightsCode.length);

		if (settingsCode.join("") === streetlightsCode.join(""))
		{
			streetLightsCodeMet = true;

			applyStreetLightsCode();

			addStyle(`
				#logo img, #logo-no-link img
				{
					background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 14.2857142857%, rgba(185,185,185,1) 14.2857142857%, rgba(185,185,185,1) 28.5714285714%, rgba(255,255,255,1) 28.5714285714%, rgba(255,255,255,1) 42.8571428571%, rgba(184,244,131,1) 42.8571428571%, rgba(184,244,131,1) 57.1428571429%, rgba(255,255,255,1) 57.1428571429%, rgba(255,255,255,1) 71.4285714286%, rgba(185,185,185,1) 71.4285714286%, rgba(185,185,185,1) 85.7142857143%, rgba(0,0,0,1) 85.7142857143%, rgba(0,0,0,1) 100%);
				}
			`, false);
		}
	}
}

export function applyStreetLightsCode()
{
	if (!streetLightsCodeMet)
	{
		return;
	}

	$$("#logo img, #logo-no-link img").forEach(element =>
	{
		element.classList.add("transparent");
		element.setAttribute("src", "/graphics/general-icons/logo-transparent.webp");
	});
}



let timeoutId;

let shownEasterEgg = false;

function handleEasterEgg()
{
	themeToggles++;

	clearTimeout(timeoutId);

	timeoutId = setTimeout(() => themeToggles = 0, 300);
	
	if (themeToggles >= 8 && !shownEasterEgg)
	{
		shownEasterEgg = true;

		clearTimeout(timeoutId);

		document.body.querySelector("#header-settings-button").innerHTML = "boo";

		addStyle(`
			#banner, img, canvas
			{
				filter: brightness(max(calc(var(--extra-brightness) / 10), 1)) saturate(var(--extra-brightness)) contrast(var(--extra-brightness)) hue-rotate(calc(var(--extra-brightness) * 5deg));
			}
		`, false);

		const dummy = { t: 1 };

		const startingBackground = siteSettings.darkTheme
			? "lch(8.25% 0 0)"
			: "lch(100% 0 0)";

		const startingHighContrast = siteSettings.darkTheme
			? "lch(100% 23.2 0)"
			: "lch(0% 0 0)";

		const startingNormalContrast = siteSettings.darkTheme
			? "lch(83.48% 0 0)"
			: "lch(27.09% 0 0)";

		const startingLowContrast = siteSettings.darkTheme
			? "lch(74.78% 0 0)"
			: "lch(40.73% 0 0)";

		document.documentElement.style.filter = "brightness(1)";

		anime({
			targets: dummy,
			t: 0,
			duration: 2000,
			easing: "easeOutQuad",
			update: () =>
			{
				rootElement.style.setProperty(
					"--background",
					`color-mix(in lch, ${startingBackground} ${dummy.t * 100}%, lch(46.62% 108.32 40.84))`
				);

				rootElement.style.setProperty(
					"--high-contrast",
					`color-mix(in lch, ${startingHighContrast} ${dummy.t * 100}%, lch(79.24% 134.33 134.57))`
				);

				rootElement.style.setProperty(
					"--normal-contrast",
					`color-mix(in lch, ${startingNormalContrast} ${dummy.t * 100}%, lch(79.24% 134.33 134.57))`
				);

				rootElement.style.setProperty(
					"--low-contrast",
					`color-mix(in lch, ${startingLowContrast} ${dummy.t * 100}%, lch(79.24% 134.33 134.57))`
				);

				rootElement.style.setProperty(
					"--extra-brightness",
					(1 - dummy.t) * 10 + 1
				);
			}
		});
	}

	return shownEasterEgg;
}