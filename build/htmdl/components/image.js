import { parseUrl } from "../build.js";

export function image(options, ...urls)
{
	const imgString = urls.map(url =>
	{
		return /* html */`
			<img class="notes-image" src="${parseUrl(url)}"></img>
		`;
	}).join("");

	return /* html */`<div class="notes-images">${imgString}</div>`;
}