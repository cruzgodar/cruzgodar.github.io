import { parseText } from "./text.mjs";

export function center(options, text)
{
	return `<p class="body-text center-if-needed"><span>${parseText(text)}</span></p>`;
}