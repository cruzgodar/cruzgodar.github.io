import { splitCommandLine } from "/build/build-html-file.mjs";

function textBox(options, id, defaultValue, name)
{
	return `
		<div class="text-box-container">
			<input id="${id}-input" class="text-box" type="text" value="${defaultValue}" tabindex="1">
			<p class="body-text text-box-subtext">${name}</p>
		</div>
	`;
}

export function textBoxes(options, lines)
{
	let html = "<div class='text-boxes'>";

	lines.forEach(line =>
	{
		const [words, options] = splitCommandLine(line);

		html = `${html}${textBox(options, ...words)}`;
	});

	html = `${html}</div>`;

	return html;
}