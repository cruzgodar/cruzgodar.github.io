import { splitCommandLine } from "../build.js";

function textBox(id)
{
	return /* html */`
		<div class="text-box-container">
			<input id="${id}-input" class="text-box" type="text" value="" tabindex="1">
			<p class="body-text text-box-subtext"></p>
		</div>
	`;
}

export function textBoxes(_options, lines)
{
	let html = "<div class='text-boxes'>";

	lines.forEach(line =>
	{
		const [words] = splitCommandLine(line);

		html = `${html}${textBox(...words)}`;
	});

	html = /* html */`${html}</div>`;

	return html;
}