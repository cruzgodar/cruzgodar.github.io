import { splitCommandLine } from "../build.js";

function galleryImage(options, id, size, name)
{
	return /* html */`
		<div class="gallery-image-${size}-${size}">
			<img src="/graphics/general-icons/placeholder.png" data-src="/gallery/thumbnails/${id}.webp" data-image-id="${id}" alt="${name}"></img>
		</div>
	`;
}

export function galleryBlock(options, lines)
{
	let html = "<div class='gallery-block'>";

	lines.forEach(line =>
	{
		const [words, options] = splitCommandLine(line);

		html = `${html}${galleryImage(options, ...words)}`;
	});

	html = /* html */`${html}</div>`;

	return html;
}