import { opacityAnimationTime } from "./animation.js";
import { cardIsOpen } from "./cards.js";
import { recreateDesmosGraphs } from "./desmos.js";
import {
	$,
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

export const preventThemeChangePages =
[
	"/gallery/",
	"/slides/oral-exam/",
	"/writing/caracore/",
	"/writing/caligo/"
];

const rootElement = document.querySelector(":root");

export const metaThemeColorElement = document.querySelector("#theme-color-meta");


let themeToggles = 0;


const params = new URLSearchParams(window.location.search);

const darkTheme = (() =>
{
	if (params.get("theme") === null)
	{
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}

	return params.get("theme") === "1";
})();

export const siteSettings =
{
	darkTheme,
	card: params.get("card"),
	resolutionMultiplier: parseFloat(params.get("resmult") ?? "1"),
	condensedApplets: params.get("condensedapplets") === "1"
};



export function getQueryParams()
{
	const params = new URLSearchParams(window.location.search);



	params.delete("page");

	if (siteSettings.darkTheme && !window.matchMedia("(prefers-color-scheme: dark)").matches)
	{
		params.set("theme", "1");
	}

	else if (!siteSettings.darkTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
	{
		params.set("theme", "0");
	}

	else
	{
		params.delete("theme");
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
}



export function initDarkTheme()
{
	window.matchMedia("(prefers-color-scheme: dark)").addListener((e) =>
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
		siteSettings.darkTheme = forceThemePages[pageUrl];

		siteSettings.darkTheme = false;

		toggleDarkTheme({ noAnimation: true, force: true });

		return;
	}

	if (siteSettings.darkTheme)
	{
		siteSettings.darkTheme = false;

		toggleDarkTheme({ noAnimation: true });
	}
}



export async function revertTheme()
{
	if (forcedTheme)
	{
		forcedTheme = false;
	}

	if (revertThemeTo === null)
	{
		return;
	}

	revertThemeTo = null;

	if (siteSettings.darkTheme !== revertThemeTo)
	{
		await toggleDarkTheme({ force: true });
	}
}



export async function toggleDarkTheme({
	noAnimation = false,
	force = false,
	duration = opacityAnimationTime * 2
}) {
	if (!force && preventThemeChangePages.includes(pageUrl))
	{
		return;
	}

	if (handleEasterEgg())
	{
		return;
	}

	siteSettings.darkTheme = !siteSettings.darkTheme;

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



export function condenseApplet()
{
	addStyle(`
		p:not(.text-box-subtext, .checkbox-subtext, .radio-button-subtext, .slider-subtext), h1, h2, header, footer, br
		{
			display: none;
		}
		
		section:first-of-type
		{
			margin-top: 0 !important;
			margin-bottom: 0 !important;
		}
		
		body
		{
			margin-top: -5vh;
		}

		#canvas-landscape
		{
			flex-direction: column !important;
		}

		#canvas-landscape-left, #canvas-landscape-middle, #canvas-landscape-right
		{
			width: 80% !important;
		}
	`);

	const downloadButtonElement = $("#download-button");

	if (downloadButtonElement?.parentNode?.parentNode)
	{
		downloadButtonElement.parentNode.parentNode.style.display = "none";
	}
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

		document.body.querySelector("#header-theme-button").innerHTML = "boo";

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