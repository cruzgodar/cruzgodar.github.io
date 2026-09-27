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
	return `<ol class="paren-alpha">${itemsHtml}</ol>`;
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

export function displayMath(body)
{
	return String.raw/* html */`<p class="body-text" style="text-align: center; line-height: 0"><span>$$\begin{alignat*}{99}${parseMath(body)}\end{alignat*}$$</span></p>`;
}

export function math(body)
{
	return String.raw`$${parseMath(body)}$`;
}

export function inlineDisplayMath(body)
{
	return String.raw`$\displaystyle ${parseMath(body)}$`;
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

function parseMath(body)
{
	body = body
		.replaceAll(/\n\s*\n/g, "\n")
		.replaceAll(/\n/g, "\\\\\n");
		console.log(body);

	return body
		// \pe, \me, \te
		.replaceAll(/(?<!\\)\\pe(?![a-zA-Z])/g, "\\ +\\!\\!=")
		.replaceAll(/(?<!\\)\\me(?![a-zA-Z])/g, "\\ -\\!\\!=")
		.replaceAll(/(?<!\\)\\te(?![a-zA-Z])/g, "\\ \\times\\!\\!=")
		
		// \G
		.replaceAll(/(?<!\\)\\G(?![a-zA-Z])/g, "\\nabla\\!")

		// \GTimes, \GBullet
		.replaceAll(/(?<!\\)\\Gtimes(?![a-zA-Z])/g, "\\nabla\\!\\times\\!")
		.replaceAll(/(?<!\\)\\Gbullet(?![a-zA-Z])/g, "\\nabla\\!\\bullet\\!")

		// \vec{...}' (the prime is hard to read normally, so we add a small space)
		.replaceAll(/(\\vec\{.+?\})'/g, (match, $1) => `${$1}\\hspace{0.1em}'`)

		// \span, \image, \swap, \Re, \Im, \proj
		.replaceAll(/(?<!\\)\\(span|image|swap|Re|Im|proj)(?![a-zA-Z])/g, (match, $1) => `\\operatorname{${$1}}`)

		// Matrices: [[ 1, 2, 3 ; 4, 5, 6 ; 7, 8, 9]]
		.replaceAll(/\[\[(.+?)\]\]/g, (match, $1) =>
		{
			const colString = ("," + $1)
				.split(";")[0]
				.match(/[,|]/g)
				.join("")
				.replaceAll(/,/g, "c")
				.replaceAll(/\|/g, "|c");
			
			const content = $1.replaceAll(/[,|]/g, "&").replaceAll(/;/g, "\\\\");

			return `\\left[\\begin{array}{${colString}}${content}\\end{array}\\right]`;
		})

		// A left-aligned block: :: a = 1 ; b = 1 ::
		.replaceAll(/::(.+?)::/g, (match, $1) => `\\begin{array}{l}${$1.replaceAll(/;/g, "\\\\")}\\end{array}`)

		// Leibniz derivatives:  d/dx, dy/dx, d\theta/dx, etc.
		.replaceAll(/d(\\[a-zA-Z]+)\/d([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)
		.replaceAll(/d([a-zA-Z]?)\/d(\\[a-zA-Z]+)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)
		.replaceAll(/d(\\[a-zA-Z]+)\/d(\\[a-zA-Z]+)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)
		.replaceAll(/d([a-zA-Z]?)\/d([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\mathrm{d}${$1}}{\\mathrm{d}${$2}}`)

		// Manual d derivatives: \d
		.replaceAll(/(?<!\\)\\d(?![a-zA-Z])/g, "\\mathrm{d}")

		// Partial derivatives:  p/px, py/px, p\theta/px, etc.
		.replaceAll(/p(\\[a-zA-Z]+)\/p([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)
		.replaceAll(/p([a-zA-Z]?)\/p(\\[a-zA-Z]+)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)
		.replaceAll(/p(\\[a-zA-Z]+)\/p(\\[a-zA-Z]+)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)
		.replaceAll(/p([a-zA-Z]?)\/p([a-zA-Z]?)/g, (match, $1, $2) => `\\frac{\\partial ${$1}}{\\partial ${$2}}`)

		// Manual partial derivatives: \p
		.replaceAll(/(?<!\\)\\p(?![a-zA-Z])/g, "\\partial")

		// Distinct sharp v: \v
		.replaceAll(/(?<!\\)\\v(?![a-zA-Z])/g, "\\mathrm{v}")

		// Bold: **A**
		.replaceAll(/\*\*(.+?)\*\*/g, (match, $1) => `\\mathbf{${$1}}`)

		// Blackboard bold: #A#
		.replaceAll(/#([^ ]+?)#/g, (match, $1) => `\\mathbb{${$1}}`);
}