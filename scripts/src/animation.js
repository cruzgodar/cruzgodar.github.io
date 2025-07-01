import {
	navigationAnimationDistanceHorizontal,
	navigationAnimationDistanceVertical
} from "./layout.js";

const baseAnimationTime = 250;

export const opacityAnimationTime = baseAnimationTime * .75;

export const buttonAnimationTime = baseAnimationTime * .35;
	
export const pageAnimationTime = baseAnimationTime * .475;
export const backgroundColorAnimationTime = baseAnimationTime * 2;

export const cardAnimationTime = baseAnimationTime * 2;

export const fullscreenAnimationTime = baseAnimationTime * .5;

export const carouselSwitchAnimationTime = 250;
export const carouselFillAnimationTime = 20000;



export function changeOpacity({
	element,
	opacity,
	duration = opacityAnimationTime,
	easeInOut = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-opacity-timeout-id");

		if (timeoutId)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = `opacity ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;

		setTimeout(() =>
		{
			element.style.opacity = opacity;

			const timeoutId = setTimeout(() =>
			{
				element.style.transition = "";
				resolve();
			}, duration);

			element.setAttribute("data-opacity-timeout-id", timeoutId);
		}, 10);
	});
}

export function changeScale({
	element,
	scale,
	duration = buttonAnimationTime,
	easeInOut = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-scale-timeout-id");

		if (timeoutId)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = `transform ${duration}ms ${easeInOut ? "ease-in-out" : "ease-out"}`;

		setTimeout(() =>
		{
			element.style.transform = `scale(${scale})`;

			const timeoutId = setTimeout(() =>
			{
				element.style.transition = "";
				resolve();
			}, duration);

			element.setAttribute("data-scale-timeout-id", timeoutId);
		}, 10);
	});
}

export function fadeLeft({
	element,
	duration = baseAnimationTime * 3,
	easeInOut = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-left-timeout-id");

		if (timeoutId)
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

export function fadeUpIn({
	element,
	duration = pageAnimationTime * 2,
	opacity = 1
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-up-in-timeout-id");

		if (timeoutId)
		{
			clearTimeout(timeoutId);
		}

		element.style.transition = "";

		setTimeout(() =>
		{
			element.style.marginTop = `${navigationAnimationDistanceVertical}px`;
			element.style.marginBottom = 0;

			// Jesus
			void(element.offsetHeight);

			element.style.transition = `margin-top ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0), opacity ${duration}ms cubic-bezier(.4, 1.0, .7, 1.0)`;

			setTimeout(() =>
			{
				element.style.marginTop = 0;
				element.style.opacity = opacity;

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

export function fadeUpOut({
	element,
	duration = pageAnimationTime,
	noOpacityChange = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-up-out-timeout-id");

		if (timeoutId)
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

export function fadeDownIn({
	element,
	duration = pageAnimationTime * 2,
	opacity = 1
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-down-in-timeout-id");

		if (timeoutId)
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
				element.style.opacity = opacity;

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

export function fadeDownOut({
	element,
	duration = pageAnimationTime,
	noOpacityChange = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-down-out-timeout-id");

		if (timeoutId)
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

export function fadeLeftIn({
	element,
	duration = pageAnimationTime * 2,
	opacity = 1
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-left-in-timeout-id");

		if (timeoutId)
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
				element.style.opacity = opacity;

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

export function fadeLeftOut({
	element,
	duration = pageAnimationTime,
	noOpacityChange = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-left-out-timeout-id");

		if (timeoutId)
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

export function fadeRightIn({
	element,
	duration = pageAnimationTime * 2,
	opacity = 1
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-right-in-timeout-id");

		if (timeoutId)
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
				element.style.opacity = opacity;

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

export function fadeRightOut({
	element,
	duration = pageAnimationTime,
	noOpacityChange = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-right-out-timeout-id");

		if (timeoutId)
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

export function fadeIn({
	element,
	duration = pageAnimationTime * 2,
	opacity = 1
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-in-timeout-id");

		if (timeoutId)
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
				element.style.opacity = opacity;

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

export function fadeOut({
	element,
	duration = pageAnimationTime,
	noOpacityChange = false
}) {
	return new Promise(resolve =>
	{
		const timeoutId = element.getAttribute("data-fade-out-timeout-id");

		if (timeoutId)
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