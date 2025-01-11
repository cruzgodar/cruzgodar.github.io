import { parseUrl } from "../build.js";

export function image(options, ...urls)
{
	const imgString = urls.map(url =>
	{
		return /* html */`
			<img src="/graphics/general-icons/placeholder.png" class="notes-image" data-src="${parseUrl(url)}"></img>
		`;
	}).join("");

	return /* html */`<div class="notes-images">${imgString}</div>`;
}