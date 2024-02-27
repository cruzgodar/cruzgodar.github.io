import { splitCommandLine } from "../build.js";

export function checkbox(id)
{
	return /* html */`
		<div class="checkbox-row">
			<div class="checkbox-container tabindex="1">
				<input type="checkbox" id="${id}-checkbox">
				<div class="checkbox"></div>
			</div>
			
			<label for="${id}-checkbox" style="margin-left: 10px">
				<p class="body-text checkbox-subtext"></p>
			</label>
		</div>
	`;
}

export function checkboxes(options, lines)
{
	let html = "<div class='checkboxes'>";

	lines.forEach(line =>
	{
		const [words] = splitCommandLine(line);

		html = `${html}${checkbox(...words)}`;
	});

	html = /* html */`${html}</div>`;

	return html;
}