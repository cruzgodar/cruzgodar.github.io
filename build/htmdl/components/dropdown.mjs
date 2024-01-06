import { splitCommandLine } from "../build.mjs";

export function dropdown(options, lines)
{
	const id = lines[0];

	let html = `
		<div class="text-buttons dropdown-holder">
			<div class="dropdown-container focus-on-child" tabindex="1">
				<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1">
	`;
	
	let inOptgroup = false;

	for (let i = 1; i < lines.length; i++)
	{
		const [words] = splitCommandLine(lines[i]);

		if (i === 1)
		{
			html += `${words[1]}</button><select id="${id}-dropdown">`;
		}

		//Option groups
		const index = words[0].indexOf(":");

		html += index !== -1
			? `${inOptgroup ? "</optgroup>" : ""}<optgroup label="${words[0].slice(0, index)}">`
			: `<option value="${words[0]}">${words[1]}</option>`;
		
		if (index !== -1)
		{
			inOptgroup = true;
		}
	}

	html += `${inOptgroup ? "</optgroup>" : ""}</select></div></div>`;

	return html;
}