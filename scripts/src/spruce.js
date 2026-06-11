import { sitemap } from "./sitemap.js";

export function document(body)
{
	const repoPath = globalThis.filePath.replace(/^.+?cruzgodar\.github\.io/, "");
	const pageUrl = repoPath.slice(0, repoPath.lastIndexOf("/"));

	if (!sitemap[pageUrl])
	{
		throw new Error(`${pageUrl} is not in sitemap!`);
	}

	const title = sitemap[pageUrl].title;

	return /* html */`<header>
	<div id="logo">
		<a href="/home" tabindex="-1">
			<img src="/graphics/general-icons/logo.webp" alt="Logo" tabindex="1" />
		</a>
	</div>
	
	<div style="height: 20px"></div>
	
	<h1 class="heading-text">${title}</h1>
</header>

<main>
${body}
</main>`;
}

export function bannerDocument(body)
{
	return /* html */`<div id="banner">
	<div id="banner-small"></div>
	<div id="banner-large"></div>
</div>

<div id="content-container">
	<div id="content">
		${document(body)}
	</div>
</div>`;
}



export function unorderedList(...items)
{
	const itemsHtml = items.map(item => `<li class="body-text">${item}</li>`).join("");
	return `<ul>${itemsHtml}</ul>`;
}

export function orderedList(...items)
{
	const itemsHtml = items.map(item => `<li class="body-text">${item}</li>`).join("");
	return `<ol>${itemsHtml}</ol>`;
}

export function heading(body, headingNumber)
{
	if (headingNumber === "1")
	{
		return /* html */`<h1 class="heading-text">${body}</h1>`;
	}

	else if (headingNumber === "2")
	{
		return /* html */`<h2 class="section-text">${body}</h2>`;
	}
	
	throw new Error("Trying to use heading level >= 3");
}

export function paragraph(body)
{
	return /* html */`<p class="body-text">${body}</p>`;
}

export function text(body)
{
	return body
		.replaceAll(/(\s)"(\S)/g, (match, $1, $2) => `${$1}&#x201C;${$2}`)
		.replaceAll(/^"(\S)/g, (match, $1) => `&#x201C;${$1}`)
		.replaceAll(/"/g, "&#x201D;")

		.replaceAll(/(\s)'(\S)/g, (match, $1, $2) => `${$1}&#x2018;${$2}`)
		.replaceAll(/^'(\S)/g, (match, $1) => `&#x2018;${$1}`)
		.replaceAll(/'/g, "&#x2019;")

		.replaceAll(/---/g, "&mdash;")
		.replaceAll(/--/g, "&ndash;");
}



export function carousel(...blocks)
{
	return /* html */`
		<div class="carousel">
			<div class="carousel-content">
				${blocks.map(block => `<div class="carousel-entry">${block}</div>`).join("")}
			</div>

			<div class="carousel-dots">
				${"<div class=\"carousel-dot\"><div class=\"fill\"></div></div>".repeat(blocks.length)}
			</div>
		</div>
	`;
}

export function clickTap(clickText, tapText)
{
	return /* html */`<span class="click-tap"><span>${clickText}</span><span>${tapText}</span></span>`;
}

// The arguments alternate id, size, id, size...
export function galleryBlock(...data)
{
	if (data.length % 2 !== 0)
	{
		throw new Error("Invalid number of arguments");
	}

	let html = "<div class=\"gallery-block\">";

	for (let i = 0; i < data.length; i += 2)
	{
		const id = data[i];
		const size = data[i + 1];

		html = /* html */`${html}
		<div class="gallery-image-${size}-${size}">
			<img src="/graphics/general-icons/placeholder.png" data-src="/gallery/thumbnails/${id}.webp" data-image-id="${id}" />
		</div>`;
	}

	return /* html */`${html}</div>`;
}


// data is an array of objects of the form
// {
//   url,
//   name,
//   forCard: boolean,
//   inNewTab: boolean
//   // optional override for the default path.
//   coverPath: string
// },
// or alternately strings, in which case they're just treated as urls.
export function imageLinks(data)
{
	const html = data.map(item =>
	{
		if (typeof item === "string")
		{
			item = { url: item };
		}

		const url = resolveUrl(item.url);

		const idPieces = url.split(".")[0].split("/");
		const id = idPieces[idPieces.length - 1];

		if (
			item.name === undefined
			&& sitemap[url] === undefined
			&& item.coverPath === undefined
		) {
			throw new Error(`${url} is not in sitemap!`);
		}

		const name = item.name ?? sitemap[url].title;

		if (item.forCard)
		{
			const slicedUrl = url.slice(0, url.lastIndexOf("/"));
			const src = `${slicedUrl}/cards/${id}/cover.webp`;

			return /* html */`
				<a href="${slicedUrl}/?card=${id}" data-card-id="${id}" class="image-link">
					<img src="/graphics/general-icons/placeholder.png" data-src="${item.coverPath ?? src}" alt="${name}" tabindex="1" />
					
					<p class="image-link-subtext">${name}</p>
				</a>
			`;
		}

		// pdf files, etc.
		const imgSrc = url.includes(".")
			? `${url.slice(0, url.lastIndexOf("/"))}/cover.webp`
			: `${url}/cover.webp`;

		return /* html */`
		<a href="${url}"${item.inNewTab ? " data-in-new-tab=\"1\"" : ""} class="image-link">
			<img src="/graphics/general-icons/placeholder.png" data-src="${item.coverPath ?? imgSrc}" alt="${name}" tabindex="1" />
			
			<p class="image-link-subtext">${name}</p>
		</a>`;
	}).join("");

	return /* html */`<div style="display: flex; justify-content: center; width: 100%;">
	<div class="image-links">${html}</div>
</div>`;
}



export function card(id, name, body)
{
	if (name)
	{
		return /* html */`<div id="${id}-card" class="card"><h1 class="heading-text">${name}</h1>${body}</div>`;
	}

	return /* html */`<div id="${id}-card" class="card">${body}</div>`;
}

export function externalCard(id)
{
	return /* html */`<div id="${id}-card" class="card external-card"></div>`;
}



export function debug(body)
{
	return /* html */`<div class="DEBUG">${body}</div>`;
}



export function center(body)
{
	return /* html */`<p class="body-text center-if-needed"><span>${body}</span></p>`;
}



function resolveUrl(url)
{
	if (url.startsWith("http"))
	{
		return url;
	}

	const repoPath = globalThis.filePath.replace(/^.+?cruzgodar\.github\.io/, "");
	const pageUrl = repoPath.slice(0, repoPath.lastIndexOf("/"));

	return url[0] === "/" ? url : pageUrl + "/" + url;
}