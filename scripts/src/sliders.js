import { $$ } from "./main.js";

export function setUpSliders()
{
	const sliderContainers = $$(".slider-container");

	sliderContainers.forEach(sliderContainer =>
	{
		const slider = sliderContainer.children[0];
		const label = sliderContainer.children[1].querySelector("span");
		const precision = parseInt(slider.getAttribute("data-precision"));
		const logarithmic = slider.getAttribute("data-logarithmic") === "1";
		const int = slider.getAttribute("data-int") === "1";

		slider.addEventListener("input", () =>
		{
			document.activeElement.blur();
			const value = logarithmic ? 10 ** parseFloat(slider.value) : parseFloat(slider.value);
			label.textContent = int ? Math.round(value) : value.toFixed(precision);
		});
	});
}