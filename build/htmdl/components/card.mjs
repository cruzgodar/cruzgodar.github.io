export function card(options, id, name)
{
	if (name)
	{
		return `<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>`;
	}

	return `<div id="${id}-card" class="card">`;
}