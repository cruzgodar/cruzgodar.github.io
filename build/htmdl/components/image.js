import { parseUrl } from "../build.js";

export function image(options, ...urls)
{
	const invertibleString = options.includes("i") ? " invertible" : "";

	const imgString = urls.map(url =>
	{
		return /* html */`
		<div class="notes-image${invertibleString}">
			<img src="/graphics/general-icons/placeholder.png" data-src="${parseUrl(url)}"></img>
		</div>
		`;
	}).join("");

	return /* html */`<div class="notes-images">${imgString}</div>`;
}