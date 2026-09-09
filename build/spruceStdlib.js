import { sitemap } from "../scripts/src/sitemap.js";

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