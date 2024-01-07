import { splitCommandLine } from "../build.js";

function galleryImage(options, id, size, name)
{
	return `
		<div class="gallery-image-${size}-${size}">
			<img src="/gallery/thumbnails/${id}.webp" data-image-id="${id}" alt="${name}"></img>
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

	html = `${html}</div>`;

	return html;
}