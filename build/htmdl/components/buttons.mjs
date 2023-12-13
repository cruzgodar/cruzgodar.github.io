// Options:

import { splitCommandLine } from "../build.mjs";

// -l: Linked. Will ensure its size is equal to all other linked text buttons on the page.
function button(options, id, name)
{
	return `
		<div class="focus-on-child" tabindex="1">
			<button class="text-button${options.includes("l") ? " linked-text-button" : ""}" type="button" id="${id}-button" tabindex="-1">${name}</button>
		</div>
	`;
}

export function buttons(options, lines)
{
	let html = "<div class='text-buttons'>";

	lines.forEach(line =>
	{
		const [words, options] = splitCommandLine(line);

		html = `${html}${button(options, ...words)}`;
	});

	html = `${html}</div>`;

	return html;
}

export function navButtons()
{
	return `
		<div class="text-buttons nav-buttons">
			<div class="focus-on-child tabindex="1">
				<button class="text-button linked-text-button previous-nav-button" type="button" tabindex="-1">Previous</button>
			</div>
			
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button home-nav-button" type="button" tabindex="-1">Home</button>
			</div>
			
			<div class="focus-on-child" tabindex="1">
				<button class="text-button linked-text-button next-nav-button" type="button" tabindex="-1">Next</button>
			</div>
		</div>
	`;
}