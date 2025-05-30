import { splitCommandLine } from "../build.js";

function slider(options, id)
{
	return /* html */`
		<div class="slider-container">
			<div class="slider-bar"></div>
			<div id="${id}-slider" class="slider-thumb"></div>
			<p class="body-text slider-subtext"></p>
		</div>
	`;
}

export function sliders(options, lines)
{
	let html = "<div class=\"sliders\">";

	for (const line of lines)
	{
		const [words, options] = splitCommandLine(line);

		html = `${html}${slider(options, ...words)}`;
	}

	html = /* html */`${html}</div>`;

	return html;
}