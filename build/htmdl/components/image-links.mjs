import { parseUrl, splitCommandLine } from "/build/build-html-file.mjs";
import { sitemap } from "/scripts/src/sitemap.mjs";

// Options:
// -c: A card. Pulls its cover from /cards/<id>.webp and opens a card with its id.
// -t: Open in new tab.
function imageLink(options, url, name)
{
	url = parseUrl(url);

	let id = url.split(".")[0].split("/");

	id = id[id.length - 1];

	if (!name)
	{
		name = sitemap[url].title;
	}

	if (options.includes("c"))
	{
		const src = `${url}cards/${id}.webp`;

		return `
			<div class="image-link">
				<a data-card-id="${id}" tabindex="-1">
					<img src="${src}" alt="${name}" tabindex="1"></img>
				</a>
				
				<p class="image-link-subtext">${name}</p>
			</div>
		`;
	}

	return `
		<div class="image-link">
			<a href="${url}"${options.includes("t") ? " data-in-new-tab='1'" : ""} tabindex="-1">
				<img src="${url}cover.webp" alt="${name}" tabindex="1"></img>
			</a>
			
			<p class="image-link-subtext">${name}</p>
		</div>
	`;
}

export function imageLinks(options, lines)
{
	let html = `<div class="image-links${lines.length === 1 ? " one-image-link" : ""}">`;

	lines.forEach(line =>
	{
		const [words, options] = splitCommandLine(line);

		html = `${html}${imageLink(options, ...words)}`;
	});

	html = `${html}</div>`;

	return html;
}