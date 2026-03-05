import { siteSettings } from "./settings.js";

const fullscreenData = new WeakMap();

export function isFullscreen(element)
{
	return fullscreenData.has(element);
}

export async function enterFullscreen({
	element,
	callback = () => {},
	crossfade = siteSettings.reduceMotion,
}) {
	if (fullscreenData.has(element))
	{
		return;
	}

	const placeholder = document.createElement("div");
	placeholder.style.display = "none";
	element.parentElement?.insertBefore(placeholder, element);

	const container = document.createElement("div");
	Object.assign(container.style, {
		position: "fixed",
		top: "0",
		left: "0",
		width: "100vw",
		height: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		zIndex: "1000",
		backgroundColor: "black",
		fontSize: "0",
	});

	const salt = Date.now().toString(36) + Math.random().toString(36).slice(2);

	const preventGestures = (e) => e.preventDefault();

	fullscreenData.set(element, {
		placeholder,
		container,
		scrollY: window.scrollY,
		salt,
		initialWindowInnerWidth: window.innerWidth,
		initialWindowInnerHeight: window.innerHeight,
		preventGestures,
	});

	const apply = () =>
	{
		container.appendChild(element);
		document.body.appendChild(container);

		element.classList.add("fullscreen");

		document.documentElement.style.userSelect = "none";
		document.addEventListener("gesturestart", preventGestures);
		document.addEventListener("gesturechange", preventGestures);
		document.addEventListener("gestureend", preventGestures);

		callback();
	};

	if (document.startViewTransition)
	{
		if (!crossfade)
		{
			element.style.setProperty(
				"view-transition-name",
				`fullscreen-${salt}`
			);
		}

		const transition = document.startViewTransition(() => apply());

		if (transition.finished !== undefined)
		{
			await transition.finished;
		}
	}

	else
	{
		apply();
	}
}

export async function exitFullscreen({
	element,
	callback = () => {},
	crossfade = siteSettings.reduceMotion,
}) {
	const data = fullscreenData.get(element);

	if (!data)
	{
		return;
	}

	const apply = () =>
	{
		data.placeholder.parentElement?.insertBefore(element, data.placeholder);
		data.placeholder.remove();
		data.container.remove();

		element.classList.remove("fullscreen");

		document.documentElement.style.userSelect = "auto";
		document.removeEventListener("gesturestart", data.preventGestures);
		document.removeEventListener("gesturechange", data.preventGestures);
		document.removeEventListener("gestureend", data.preventGestures);

		callback();
	};

	if (document.startViewTransition)
	{
		const windowSizeUnchanged =
			window.innerWidth === data.initialWindowInnerWidth
			&& window.innerHeight === data.initialWindowInnerHeight;

		if (!crossfade && windowSizeUnchanged)
		{
			element.style.setProperty(
				"view-transition-name",
				`fullscreen-${data.salt}`
			);
		}

		const transition = document.startViewTransition(() => apply());

		if (transition.finished !== undefined)
		{
			await transition.finished;
		}

		element.style.removeProperty("view-transition-name");
	}

	else
	{
		apply();
	}

	window.scrollTo(0, data.scrollY);

	fullscreenData.delete(element);
}
