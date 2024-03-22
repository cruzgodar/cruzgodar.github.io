import { splitCommandLine } from "../build.js";

function button(id)
{
	return /* html */`
		<div class="focus-on-child" tabindex="1">
			<button class="text-button" type="button" id="${id}-button" tabindex="-1"></button>
		</div>
	`;
}

export function buttons(_options, lines)
{
	let html = "<div class='text-buttons'>";

	lines.forEach(line =>
	{
		const [words] = splitCommandLine(line);

		html = `${html}${button(...words)}`;
	});

	html = /* html */`${html}</div>`;

	return html;
}

export function navButtons()
{
	return /* html */`
		<div class="text-buttons nav-buttons">
			<div class="focus-on-child" tabindex="1">
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