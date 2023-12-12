export function dropdown(options, lines)
{
	const id = lines[0];

	let html = `
		<div class="text-buttons">
			<div class="dropdown-container focus-on-child" tabindex="1">
				<button class="text-button dropdown" type="button" id="${id}-dropdown-button" tabindex="-1">
	`;
	
	let inOptgroup = false;

	for (let i = 1; i < lines.length; i++)
	{
		const words = lines[i].split(" ");

		const value = words[0];
		const text = words.slice(1).join(" ");

		if (i === 1)
		{
			html += `${text}</button><select id="${id}-dropdown">`;
		}

		//Option groups
		const index = value.indexOf(":");

		html += index !== -1
			? `${inOptgroup ? "</optgroup>" : ""}<optgroup label="${value.slice(0, index)}">`
			: `<option value="${value}">${text}</option>`;
		
		if (index !== -1)
		{
			inOptgroup = true;
		}
	}

	html += `${inOptgroup ? "</optgroup>" : ""}</select></div></div>`;

	return html;
}