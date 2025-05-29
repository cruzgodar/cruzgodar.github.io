// Options:
// 	-e: external. Indicates that the card should be fetched from cards/<id>/data.html.

export function card(options, id, name)
{
	if (options.includes("e"))
	{
		return /* html */`<div id="${id}-card" class="card external-card"></div>`;
	}

	if (name)
	{
		return /* html */`<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>`;
	}

	return /* html */`<div id="${id}-card" class="card">`;
}