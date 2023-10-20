import { browserIsIos } from "./browser.mjs";
import {
	navigationAnimationDistanceHorizontal,
	navigationAnimationDistanceVertical
} from "./layout.mjs";
import anime from "/scripts/anime.js";

const useJsAnimation = browserIsIos;

const baseAnimationTime = 250;

export const opacityAnimationTime = useJsAnimation
	? baseAnimationTime * .8
	: baseAnimationTime * .75;

export const buttonAnimationTime = useJsAnimation
	? baseAnimationTime * .5
	: baseAnimationTime * .45;
	
export const pageAnimationTime = baseAnimationTime * .55;
export const backgroundColorAnimationTime = baseAnimationTime * 2;

export const cardAnimationTime = baseAnimationTime * 2;

export const carouselSwitchAnimationTime = 250;
export const carouselFillAnimationTime = 3000;



function changeOpacityJs(element, endValue, duration = opacityAnimationTime, easeInOut = false)
{
	return anime({
		targets: element,
		opacity: endValue,
		duration,
		easing: easeInOut ? "easeInOutQuad" : "easeOutQuad",
	}).finished;
}

function changeOpacityCss(element, endValue, duration = opacityAnimationTime, easeInOut = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-opacity-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = `opacity ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;

		setTimeout(() =>
		{
			element.style.opacity = endValue;

			const timeoutId = setTimeout(() =>
			{
				element.style.transition = "";
				resolve();
			}, duration);

			element.setAttribute("data-opacity-timeout-id", timeoutId);
		}, 10);
	});
}

export const changeOpacity = useJsAnimation ? changeOpacityJs : changeOpacityCss;



export function changeScaleJs(element, endValue, duration = buttonAnimationTime, easeInOut = false)
{
	return anime({
		targets: element,
		scale: endValue,
		duration,
		easing: easeInOut ? "easeInOutQuad" : "easeOutQuad",
	}).finished;
}

function changeScaleCss(element, endValue, duration = buttonAnimationTime, easeInOut = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-scale-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = `transform ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;

		setTimeout(() =>
		{
			element.style.transform = `scale(${endValue})`;

			const timeoutId = setTimeout(() =>
			{
				element.style.transition = "";
				resolve();
			}, duration);

			element.setAttribute("data-scale-timeout-id", timeoutId);
		}, 10);
	});
}

export const changeScale = useJsAnimation ? changeScaleJs : changeScaleCss;



function fadeLeftJs(element, duration = baseAnimationTime * 3, easeInOut = false)
{
	return anime({
		targets: element,
		translateX: 0,
		opacity: 1,
		duration,
		easing: easeInOut ? "easeInOutQuad" : "easeOutQuad",
	}).finished;
}

function fadeLeftCss(element, duration = baseAnimationTime * 3, easeInOut = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-left-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = `transform ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}, opacity ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;

		setTimeout(() =>
		{
			element.style.transform = "translateX(0px)";
			element.style.opacity = 1;

			const timeoutId = setTimeout(() =>
			{
				element.style.transition = "";
				resolve();
			}, duration);

			element.setAttribute("data-fade-left-timeout-id", timeoutId);
		}, 10);
	});
}

export const fadeLeft = useJsAnimation ? fadeLeftJs : fadeLeftCss;



function fadeUpInJs(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	element.style.marginTop = `${navigationAnimationDistanceVertical}px`;
	element.style.marginBottom = 0;

	return anime({
		targets: element,
		marginTop: "0px",
		opacity: targetOpacity,
		duration,
		easing: "cubicBezier(.4, 1.0, .7, 1.0)",
	}).finished;
}

function fadeUpInCss(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-up-in-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginTop = `${navigationAnimationDistanceVertical}px`;
			element.style.marginBottom = 0;

			//Jesus
			void(element.offsetHeight);

			element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;

			setTimeout(() =>
			{
				element.style.marginTop = 0;
				element.style.opacity = targetOpacity;

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-up-in-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeUpIn = useJsAnimation ? fadeUpInJs : fadeUpInCss;



function fadeUpOutJs(element, duration = pageAnimationTime, noOpacityChange = false)
{
	element.style.marginBottom = "20vmin";

	return anime({
		targets: element,
		marginTop: `${-navigationAnimationDistanceVertical}px`,
		duration,
		easing: "cubicBezier(.1, 0.0, .2, 0.0)",
		...(!noOpacityChange && { opacity: 0 })
	}).finished;
}

function fadeUpOutCss(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-up-out-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginBottom = "20vmin";

			void(element.offsetHeight);

			element.style.transition = `margin-top ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;

			setTimeout(() =>
			{
				element.style.marginTop = `-${navigationAnimationDistanceVertical}px`;

				if (!noOpacityChange)
				{
					element.style.opacity = 0;
				}

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-up-out-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeUpOut = useJsAnimation ? fadeUpOutJs : fadeUpOutCss;



function fadeDownInJs(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	element.style.marginTop = `${-navigationAnimationDistanceVertical}px`;
	element.style.marginBottom = 0;

	return anime({
		targets: element,
		marginTop: "0px",
		opacity: targetOpacity,
		duration,
		easing: "cubicBezier(.4, 1.0, .7, 1.0)",
	}).finished;
}

function fadeDownInCss(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-down-in-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginTop = `${-navigationAnimationDistanceVertical}px`;
			element.style.marginBottom = 0;

			void(element.offsetHeight);

			element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;

			setTimeout(() =>
			{
				element.style.marginTop = 0;
				element.style.opacity = targetOpacity;

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-down-in-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeDownIn = useJsAnimation ? fadeDownInJs : fadeDownInCss;



function fadeDownOutJs(element, duration = pageAnimationTime, noOpacityChange = false)
{
	element.style.marginBottom = "20vmin";

	return anime({
		targets: element,
		marginTop: `${navigationAnimationDistanceVertical}px`,
		duration,
		easing: "cubicBezier(.1, 0.0, .2, 0.0)",
		...(!noOpacityChange && { opacity: 0 })
	}).finished;
}

function fadeDownOutCss(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-down-out-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginBottom = "20vmin";

			void(element.offsetHeight);

			element.style.transition = `margin-top ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;

			setTimeout(() =>
			{
				element.style.marginTop = `${navigationAnimationDistanceVertical}px`;

				if (!noOpacityChange)
				{
					element.style.opacity = 0;
				}

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-down-out-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeDownOut = useJsAnimation ? fadeDownOutJs : fadeDownOutCss;



function fadeLeftInJs(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	element.style.marginLeft = `${navigationAnimationDistanceHorizontal}px`;

	return anime({
		targets: element,
		marginLeft: "0px",
		opacity: targetOpacity,
		duration,
		easing: "cubicBezier(.4, 1.0, .7, 1.0)",
	}).finished;
}

function fadeLeftInCss(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-left-in-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginLeft = `${navigationAnimationDistanceHorizontal}px`;

			void(element.offsetHeight);

			element.style.transition = `margin-left ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;

			setTimeout(() =>
			{
				element.style.marginLeft = 0;
				element.style.opacity = targetOpacity;

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-left-in-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeLeftIn = useJsAnimation ? fadeLeftInJs : fadeLeftInCss;



function fadeLeftOutJs(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return anime({
		targets: element,
		marginLeft: `${-navigationAnimationDistanceHorizontal}px`,
		duration,
		easing: "cubicBezier(.1, 0.0, .2, 0.0)",
		...(!noOpacityChange && { opacity: 0 })
	}).finished;
}

function fadeLeftOutCss(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-left-out-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			void(element.offsetHeight);

			element.style.transition = `margin-left ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;

			setTimeout(() =>
			{
				element.style.marginLeft = `${-navigationAnimationDistanceHorizontal}px`;

				if (!noOpacityChange)
				{
					element.style.opacity = 0;
				}

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-left-out-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeLeftOut = useJsAnimation ? fadeLeftOutJs : fadeLeftOutCss;



function fadeRightInJs(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	element.style.marginLeft = `${-navigationAnimationDistanceHorizontal}px`;

	return anime({
		targets: element,
		marginLeft: "0px",
		opacity: targetOpacity,
		duration,
		easing: "cubicBezier(.4, 1.0, .7, 1.0)",
	}).finished;
}

function fadeRightInCss(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-right-in-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginLeft = `${-navigationAnimationDistanceHorizontal}px`;

			void(element.offsetHeight);

			element.style.transition = `margin-left ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;

			setTimeout(() =>
			{
				element.style.marginLeft = 0;
				element.style.opacity = targetOpacity;

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-right-in-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeRightIn = useJsAnimation ? fadeRightInJs : fadeRightInCss;



function fadeRightOutJs(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return anime({
		targets: element,
		marginLeft: `${navigationAnimationDistanceHorizontal}px`,
		duration,
		easing: "cubicBezier(.1, 0.0, .2, 0.0)",
		...(!noOpacityChange && { opacity: 0 })
	}).finished;
}

function fadeRightOutCss(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-right-out-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			void(element.offsetHeight);

			element.style.transition = `margin-left ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0), opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;

			setTimeout(() =>
			{
				element.style.marginLeft = `${navigationAnimationDistanceHorizontal}px`;

				if (!noOpacityChange)
				{
					element.style.opacity = 0;
				}

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-right-out-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeRightOut = useJsAnimation ? fadeRightOutJs : fadeRightOutCss;



function fadeInJs(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	return anime({
		targets: element,
		opacity: targetOpacity,
		duration,
		easing: "cubicBezier(.4, 1.0, .7, 1.0)",
	}).finished;
}

function fadeInCss(element, duration = pageAnimationTime * 2, targetOpacity = 1)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-in-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			void(element.offsetHeight);

			element.style.transition = `opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;

			setTimeout(() =>
			{
				element.style.opacity = targetOpacity;

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-in-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeIn = useJsAnimation ? fadeInJs : fadeInCss;



function fadeOutJs(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return anime({
		targets: element,
		duration,
		easing: "cubicBezier(.1, 0.0, .2, 0.0)",
		...(!noOpacityChange && { opacity: 0 })
	}).finished;
}

function fadeOutCss(element, duration = pageAnimationTime, noOpacityChange = false)
{
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-out-timeout-id");

		if (timeoutId != null)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			void(element.offsetHeight);

			element.style.transition = `opacity ${duration}ms cubic-bezier(.1, 0.0, .2, 0.0)`;

			setTimeout(() =>
			{
				if (!noOpacityChange)
				{
					element.style.opacity = 0;
				}

				const timeoutId = setTimeout(() =>
				{
					element.style.transition = "";
					resolve();
				}, duration);

				element.setAttribute("data-fade-out-timeout-id", timeoutId);
			}, 10);
		}, 10);
	});
}

export const fadeOut = useJsAnimation ? fadeOutJs : fadeOutCss;