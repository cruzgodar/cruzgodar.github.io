export function card(options, id, name)
{
	if (name)
	{
		return /* html */`<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>`;
	}

	return /* html */`<div id="${id}-card" class="card">`;
}