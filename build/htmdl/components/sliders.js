import { splitCommandLine } from "../build.js";

// Options:
// -l: Logarithmic.
// -i: Integer-valued.
function slider(options, id)
{
	return `
		<div class="slider-container">
			<input id="${id}-slider" type="range" step="0.000001" tabindex="1">
			<label for="${id}-slider">
				<p class="body-text slider-subtext"></p>
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