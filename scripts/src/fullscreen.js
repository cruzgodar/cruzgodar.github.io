import { siteSettings } from "./settings.js";

const fullscreenData = new WeakMap();

function addEnterTransitionStyle(elementRect, aspectRatio, salt)
{
	// The old element snaps to being as large as possible, so we correct it.
	const windowAspectRatio = window.innerWidth / window.innerHeight;

	const scaleStart = windowAspectRatio >= aspectRatio
		? elementRect.height / window.innerHeight
		: elementRect.width / window.innerWidth;
	const scaleEnd = windowAspectRatio >= aspectRatio
		? window.innerHeight / (window.innerWidth / aspectRatio)
		: 1;

	const oldWidthEnd = Math.min(
		window.innerWidth,
		window.innerHeight * aspectRatio
	);
	const oldHeightEnd = Math.min(
		window.innerHeight,
		window.innerWidth / aspectRatio
	);

	const oldLeftEnd = (window.innerWidth - oldWidthEnd) / 2;
	const oldTopEnd = (window.innerHeight - oldHeightEnd) / 2;

	// Position the center of the new element over the old one.
	const newTopStart = elementRect.top
		- (window.innerHeight * scaleStart - elementRect.height) / 2;
	const newLeftStart = elementRect.left
		- (window.innerWidth * scaleStart - elementRect.width) / 2;

	const temporaryStyle = /* css */`
		@keyframes fullscreen-move-out-${salt}
		{
			from
			{
				transform: translate(${elementRect.left}px, ${elementRect.top}px) scale(${scaleStart * scaleEnd});
				transform-origin: top left;
				opacity: 1;
			}

			to
			{
				transform: translate(${oldLeftEnd}px, ${oldTopEnd}px) scale(${scaleEnd});
				transform-origin: top left;
				opacity: 0;
			}
		}

		@keyframes fullscreen-move-in-${salt}
		{
			from
			{
				transform: translate(${newLeftStart}px, ${newTopStart}px) scale(${scaleStart});
				transform-origin: top left;
				opacity: 0;
			}

			to
			{
				transform: translate(0px, 0px) scale(1);
				transform-origin: top left;
				opacity: 1;
			}
		}

		::view-transition-group(fullscreen-${salt})
		{
			animation: none;
		}

		::view-transition-old(fullscreen-${salt})
		{
			animation-name: fullscreen-move-out-${salt};
			animation-fill-mode: both;
			mix-blend-mode: plus-lighter;
		}

		::view-transition-new(fullscreen-${salt})
		{
			animation-name: fullscreen-move-in-${salt};
			animation-fill-mode: both;
			mix-blend-mode: plus-lighter;
		}
	`;

	const styleElement = document.createElement("style");
	styleElement.innerHTML = temporaryStyle;
	document.head.appendChild(styleElement);

	return styleElement;
}

function addExitTransitionStyle(elementRect, aspectRatio, salt)
{
	// This one starts aligned to the shrunk element, so we have to undo
	// the transforms in weird ways.
	const oldLeftStart = -elementRect.left;
	const oldTopStart = -elementRect.top;

	const windowAspectRatio = window.innerWidth / window.innerHeight;
	const scaleStart = elementRect.width / window.innerWidth;
	const scaleEnd = windowAspectRatio >= aspectRatio
		? window.innerHeight / (window.innerWidth / aspectRatio)
		: 1;

	const oldWidthEnd = window.innerWidth * scaleStart / scaleEnd;
	const oldHeightEnd = window.innerHeight * scaleStart / scaleEnd;

	const oldLeftEnd = (elementRect.width - oldWidthEnd) / 2;
	const oldTopEnd = (elementRect.height - oldHeightEnd) / 2;

	const newWidthStart = Math.min(
		window.innerWidth,
		window.innerHeight * aspectRatio
	);
	const newHeightStart = Math.min(
		window.innerHeight,
		window.innerWidth / aspectRatio
	);

	const newLeftStart = (window.innerWidth - newWidthStart) / 2 - elementRect.left;
	const newTopStart = (window.innerHeight - newHeightStart) / 2 - elementRect.top;

	const temporaryStyle = /* css */`
		@keyframes fullscreen-move-out-${salt}
		{
			from
			{
				transform: translate(${oldLeftStart}px, ${oldTopStart}px) scale(${1 / scaleStart});
				transform-origin: top left;
				opacity: 1;
			}

			to
			{
				transform: translate(${oldLeftEnd}px, ${oldTopEnd}px) scale(${1 / scaleEnd});
				transform-origin: top left;
				opacity: 0;
			}
		}

		@keyframes fullscreen-move-in-${salt}
		{
			from
			{
				transform: translate(${newLeftStart}px, ${newTopStart}px) scale(${scaleEnd / scaleStart});
				transform-origin: top left;
				opacity: 0;
			}

			to
			{
				transform: translate(0px, 0px) scale(1);
				transform-origin: top left;
				opacity: 1;
			}
		}

		::view-transition-group(fullscreen-${salt})
		{
			animation: none;
		}

		::view-transition-old(fullscreen-${salt})
		{
			animation-name: fullscreen-move-out-${salt};
			animation-fill-mode: both;
			mix-blend-mode: plus-lighter;
		}

		::view-transition-new(fullscreen-${salt})
		{
			animation-name: fullscreen-move-in-${salt};
			animation-fill-mode: both;
			mix-blend-mode: plus-lighter;
		}
	`;

	const styleElement = document.createElement("style");
	styleElement.innerHTML = temporaryStyle;
	document.head.appendChild(styleElement);

	return styleElement;
}

export function isFullscreen(element)
{
	return fullscreenData.has(element);
}

export async function enterFullscreen({
	element,
	callback = () => {},
	exitCallback = () => {},
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

	const elementRect = element.getBoundingClientRect();
	const aspectRatio = elementRect.width / elementRect.height;

	const onKeydown = (e) =>
	{
		if (e.key === "Escape" && fullscreenData.has(element))
		{
			exitFullscreen({ element });
		}
	};

	fullscreenData.set(element, {
		placeholder,
		container,
		scrollY: window.scrollY,
		salt,
		elementRect,
		aspectRatio,
		initialWindowInnerWidth: window.innerWidth,
		initialWindowInnerHeight: window.innerHeight,
		preventGestures,
		onKeydown,
		exitCallback,
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
		document.addEventListener("keydown", onKeydown);

		callback();
	};

	if (document.startViewTransition)
	{
		const styleElement = !crossfade
			? addEnterTransitionStyle(elementRect, aspectRatio, salt)
			: null;

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

			styleElement?.remove();
		}

		else
		{
			setTimeout(() => styleElement?.remove(), 1000);
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
		document.removeEventListener("keydown", data.onKeydown);

		data.exitCallback();
		callback();
	};

	if (document.startViewTransition)
	{
		const windowSizeUnchanged =
			window.innerWidth === data.initialWindowInnerWidth
			&& window.innerHeight === data.initialWindowInnerHeight;

		const styleElement = !crossfade && windowSizeUnchanged
			? addExitTransitionStyle(data.elementRect, data.aspectRatio, data.salt)
			: null;

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

			styleElement?.remove();
		}

		else
		{
			setTimeout(() => styleElement?.remove(), 1000);
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
