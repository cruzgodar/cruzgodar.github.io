import { parseText } from "./text.js";

export function center(options, text)
{
	return /* html */`<p class="body-text center-if-needed"><span>${parseText(text)}</span></p>`;
}