import { splitCommandLine } from "/build/build-html-file.mjs";

// Options:
// -l: Logarithmic.
// -i: Integer-valued.
function slider(options, id, defaultValue, minValue, maxValue, name)
{
	defaultValue = parseFloat(defaultValue);
	minValue = parseFloat(minValue);
	maxValue = parseFloat(maxValue);

	// The number of decimal places to round to to get 4 significant figures.
	const precision = Math.max(
		0,
		3 - Math.floor(
			Math.log10(
				(options.includes("l") ? 10 ** maxValue : maxValue)
					- (options.includes("l") ? 10 ** minValue : minValue)
			)
		)
	);

	let displayValue = (options.includes("l") ? 10 ** defaultValue : defaultValue);

	displayValue = options.includes("i")
		? Math.round(displayValue)
		: displayValue.toFixed(precision);

	return `
		<div class="slider-container">
			<input id="${id}-slider" type="range" min="${minValue}" max="${maxValue}" value="${defaultValue}" step="0.000001" data-precision="${precision}" data-logarithmic="${options.includes("l") ? "1" : "0"}" data-int="${options.includes("i") ? "1" : "0"}" tabindex="1">
			<label for="${id}-slider">
				<p class="body-text slider-subtext">${name}: <span id="${id}-slider-value">${displayValue}</span></p>
			</label>
		</div>
	`;
}

export function sliders(options, lines)
{
	let html = "<div class='sliders'>";

	lines.forEach(line =>
	{
		const [words, options] = splitCommandLine(line);

		html = `${html}${slider(options, ...words)}`;
	});

	html = `${html}</div>`;

	return html;
}