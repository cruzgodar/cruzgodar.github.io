export const browserIsIos =
(
	[
		"iPad Simulator",
		"iPhone Simulator",
		"iPod Simulator",
		"iPad",
		"iPhone",
		"iPod"
	].includes(navigator.platform)

	// iPad on iOS 13 detection
	|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
);

const browserSupportsP3 = matchMedia("(color-gamut: p3)").matches;

const browserSupportsRec2020 = matchMedia("(color-gamut: rec2020)").matches;

// rgb is an array of integers in [0, 255], and a is a float in [0, 1]. The output is of the form
// rgba(r, g, b, a) or color(display-p3 r g b / a).
export function convertColor(r, g, b, a)
{
	if (browserSupportsRec2020)
	{
		return `color(rec2020 ${r / 255} ${g / 255} ${b / 255} / ${a ?? 1})`;
	}

	if (browserSupportsP3)
	{
		return `color(display-p3 ${r / 255} ${g / 255} ${b / 255} / ${a ?? 1})`;
	}

	return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
}