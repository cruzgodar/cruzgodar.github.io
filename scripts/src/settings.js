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
	condensedApplets: params.get("condensedapplets") === "1"
};



export function getQueryParams()
{
	const params = [];

	if (siteSettings.darkTheme && !window.matchMedia("(prefers-color-scheme: dark)").matches)
	{
		params.push("theme=1");
	}

	else if (!siteSettings.darkTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
	{
		params.push("theme=0");
	}

	if (window.DEBUG)
	{
		params.push("debug=1");
	}

	if (params.length !== 0)
	{
		return "?" + params.join("&");
	}

	return "";
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



export function setUpDarkTheme()
{
	window.matchMedia("(prefers-color-scheme: dark)").addListener((e) =>
	{
		if (revertTheme !== -1 || cardIsOpen)
		{
			return;
		}

		if ((e.matches && !siteSettings.darkTheme) || (!e.matches && siteSettings.darkTheme))
		{
			toggleDarkTheme();
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



export function revertTheme()
{
	if (forcedTheme)
	{
		forcedTheme = false;
		return;
	}

	if (revertThemeTo === null)
	{
		return;
	}

	revertThemeTo = null;

	if (siteSettings.darkTheme !== revertThemeTo)
	{
		toggleDarkTheme({});
	}
}



export async function toggleDarkTheme({ noAnimation = false, force = false })
{
	if (!force && preventThemeChangePages.includes(pageUrl))
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
				duration: opacityAnimationTime * 2,
				easing: "cubicBezier(.25, .1, .25, 1)",
			}).finished,

			anime({
				targets: dummy,
				t: siteSettings.darkTheme ? 1 : 0,
				duration: opacityAnimationTime * 2,
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