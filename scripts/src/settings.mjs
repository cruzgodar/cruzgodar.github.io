import { opacityAnimationTime } from "./animation.mjs";
import { cardIsOpen } from "./cards.mjs";
import { $, addStyle, pageUrl } from "./main.mjs";

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



const params = new URLSearchParams(document.location.search);

export const siteSettings =
{
	darkTheme: (window.matchMedia("(prefers-color-scheme: dark)").matches && params.get("theme") === null) || params.get("theme") === "1",
	condensedApplets: params.get("condensedapplets") === "1"
};



//Set to false, true, or null for when a page has forced a theme and it needs to change back.
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

if (siteSettings.darkTheme)
{
	siteSettings.darkTheme = false;
	
	toggleDarkTheme({ noAnimation: true });
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



export function toggleDarkTheme({ noAnimation = false, force = false })
{
	if (!force && preventThemeChangePages.includes(pageUrl))
	{
		return;
	}

	siteSettings.darkTheme = !siteSettings.darkTheme;

	if (noAnimation)
	{
		metaThemeColorElement.setAttribute("content", siteSettings.darkTheme ? "#181818" : "#ffffff");
		
		rootElement.style.setProperty("--theme", siteSettings.darkTheme ? 1 : 0);
	}
	
	else
	{
		const element = addStyle(`
			*:not(.page)
			{
				transition: none !important;
			}
		`);

		anime({
			targets: metaThemeColorElement,
			content: siteSettings.darkTheme ? "#181818" : "#ffffff",
			duration: opacityAnimationTime * 2,
			easing: "cubicBezier(.25, .1, .25, 1)",
		});

		const dummy = {t: siteSettings.darkTheme ? 0 : 1};

		anime({
			targets: dummy,
			t: siteSettings.darkTheme ? 1 : 0,
			duration: opacityAnimationTime * 2,
			easing: "cubicBezier(.25, .1, .25, 1)",
			update: () =>
			{
				rootElement.style.setProperty("--theme", dummy.t);
			},
			complete: () => element.remove()
		});
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
	
	try {$("#download-button").parentNode.parentNode.style.display = "none"}
	catch(ex) {}
}