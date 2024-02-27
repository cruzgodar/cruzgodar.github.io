import { write } from "../file-io.js";
import { banner } from "./components/banner.js";
import { buttons, navButtons } from "./components/buttons.js";
import { canvas } from "./components/canvas.js";
import { card } from "./components/card.js";
import { carousel } from "./components/carousel.js";
import { center } from "./components/center.js";
import { checkboxes } from "./components/checkboxes.js";
import { desmos } from "./components/desmos.js";
import { dropdown } from "./components/dropdown.js";
import { galleryBlock } from "./components/gallery-block.js";
import { glslDocs } from "./components/glsl-docs.js";
import { imageLinks } from "./components/image-links.js";
import { parseLatex } from "./components/latex.js";
import { notesEnvironment, notesEnvironmentNames } from "./components/notes-environment.js";
import { sliders } from "./components/sliders.js";
import { textBoxes } from "./components/text-boxes.js";
import { parseText } from "./components/text.js";
import { wilson } from "./components/wilson.js";

// const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1)

let sitemap = null;
let parentFolder = null;

const manualHeaderPages =
[
	"/home/",

	"/projects/wilson",

	"/writing/caligo/",
];

const singleLineComponents = [
	"banner",
	"canvas",
	"card",
	"center",
	"desmos",
	"dropdown",
	"glsl-docs",
	"nav-buttons",
	"wilson"
];

const components = {
	"banner": banner,
	"buttons": buttons,
	"canvas": canvas,
	"card": card,
	"carousel": carousel,
	"center": center,
	"checkboxes": checkboxes,
	"desmos": desmos,
	"dropdown": dropdown,
	"gallery-block": galleryBlock,
	"glsl-docs": glslDocs,
	"image-links": imageLinks,
	"nav-buttons": navButtons,
	"notes-environment": notesEnvironment,
	"sliders": sliders,
	"text-boxes": textBoxes,
	"wilson": wilson
};

export let currentNumberedItem = 1;

export function setCurrentNumberedItem(newCurrentNumberedItem)
{
	currentNumberedItem = newCurrentNumberedItem;
}

export function parseUrl(url)
{
	return url[0] === "/" ? url : parentFolder + url;
}

export function splitCommandLine(line)
{
	const words = line.replaceAll(
		/"(.+?)"/g,
		(match, $1) => $1.replaceAll(/ /g, "[SPACE]")
	).split(" ");

	const options = [];

	for (let i = 0; i < words.length; i++)
	{
		words[i] = words[i].replaceAll(/\[SPACE\]/g, " ");

		if (words[i].length === 2 && words[i][0] === "-" && isNaN(parseInt(words[i][1])))
		{
			options.push(words[i][1]);
			words.splice(i, 1);
			i--;
		}
	}

	return [words, options];
}

function decodeHTMDL(html)
{
	const usesBanner = html.indexOf("### banner") !== -1;

	let inEnvironment = false;

	let inDebugEnvironment = false;

	html = html
		.replaceAll(/\r/g, "")
		.replaceAll(/ {4}/g, "\t")
		.replaceAll(/### banner/g, "");

	// Tabs in code blocks stay, but the rest can go.
	// We match two tabs here so that we can still indent the whole block by one.
	while (html.match(/(```.+\n[\s\S]*?)\t\t([\s\S]*?```\n)/))
	{
		html = html.replaceAll(/(```.+\n[\s\S]*?)\t\t([\s\S]*?```\n)/g, (match, $1, $2) => `${$1}&#9;${$2}`);
	}

	html = html.replaceAll(/\t/g, "");



	// Automatically add a header if there's not one already here.
	if (!html.match(/^[\n\t\s]*?\n#\s/g) && !manualHeaderPages.includes(parentFolder))
	{
		const title = sitemap[parentFolder].title;

		html = html.replaceAll(/(<div.*?>)?(### banner)?([\s\S]+)/g, (match, $1, $2, $3) => `${$1 ? $1 : ""}${$2 ? $2 : ""}\n\n# ${title}\n\n${$3 ? $3 : ""}`);
	}



	let pageTitle = "";

	const lines = html.split("\n");



	for (let i = 0; i < lines.length; i++)
	{
		// Filtering out lines beginning with < is a little rough, but pretty much necessary.
		if (lines[i].length === 0 || lines[i][0] === "<")
		{
			continue;
		}



		// Leave math mostly alone (but wrap it in body text).
		if (lines[i] === "$$")
		{
			let sourceTex = "";

			const startI = i;

			i++;

			while (lines[i].slice(0, 2) !== "$$")
			{
				if (lines[i] === "")
				{
					lines.splice(i, 1);
				}

				else
				{
					lines[i] = parseLatex(lines[i]);

					sourceTex = `${sourceTex}${i === startI + 1 ? "" : "\\\\"}[NEWLINE][TAB]${lines[i]}`;

					if ([...lines[i].matchAll(/\\(begin|end){.*?}/g)].length !== 1)
					{
						lines[i] = `${lines[i]}\\\\[4px]`;
					}

					i++;
				}
			}

			sourceTex = `${sourceTex}[NEWLINE]`;

			if (sourceTex.indexOf("&") === -1)
			{
				sourceTex = `$$${sourceTex}$$`;
			}

			else
			{
				sourceTex = `\\begin{align*}${sourceTex}\\end{align*}`;
			}



			// Remove the last line break.
			lines[i - 1] = lines[i - 1].replace(/\\\\\[4px\]$/, "");

			lines[i] = "\\end{align*}$$</span></p>";

			lines[startI] = `<p class="body-text" style="text-align: center"><span class="tex-holder" style="padding: 8px" data-source-tex="${sourceTex}">$$\\begin{align*}`;
		}



		// Handle code blocks.
		else if (lines[i].slice(0, 3) === "```")
		{
			if (lines[i].length > 3)
			{
				lines[i] = `<pre><code class="language-${lines[i].slice(3)}">`;
			}

			else
			{
				lines[i] = "<pre><code>";
			}

			lines[i] = `${lines[i]}${lines[i + 1]}[ESCAPEDNEWLINE]`;

			lines.splice(i + 1, 1);

			i++;

			while (lines[i].slice(0, 3) !== "```")
			{
				lines[i] = `${lines[i]}[ESCAPEDNEWLINE]`;
				i++;
			}

			lines[i - 1] = `${lines[i - 1]}</code></pre>`;

			lines.splice(i, 1);

			i--;
		}



		// Handle debug blocks.
		else if (lines[i].slice(0, 3) === "???")
		{
			if (!inDebugEnvironment)
			{
				lines[i] = "<div class=\"DEBUG\">";
			}

			else
			{
				lines[i] = "</div>";
			}

			inDebugEnvironment = !inDebugEnvironment;
		}



		// This is one of the many possible environments.
		else if (lines[i].slice(0, 3) === "###")
		{
			currentNumberedItem = 1;

			if (lines[i] === "###")
			{
				// If we find one of these in the wild, we're
				// in an environment and just need to end it.

				inEnvironment = false;

				lines[i] = "</div>";
				continue;
			}



			const [words, options] = splitCommandLine(lines[i].slice(4));

			// The first word is the id.
			if (singleLineComponents.includes(words[0]))
			{
				lines[i] = components[words[0]](options, ...(words.slice(1)));

				if (words[0] === "card")
				{
					inEnvironment = true;
				}
			}

			else if (words[0] in notesEnvironmentNames)
			{
				lines[i] = components["notes-environment"](options, ...words);

				inEnvironment = true;
			}

			else
			{
				const content = [];

				const startI = i;

				i++;

				while (lines[i] !== "###")
				{
					if (lines[i].length !== 0)
					{
						content.push(lines[i]);
					}

					i++;
				}

				lines[startI] = components[words[0]](options, content, ...(words.slice(1)));

				for (let j = startI + 1; j <= i; j++)
				{
					lines[j] = "";
				}

			}
		}

		// A new section.
		else if (lines[i].slice(0, 2) === "##")
		{
			const title = parseText(lines[i].slice(2));

			if (inEnvironment)
			{
				lines[i] = `<h2 class="section-text" style="margin-top: 80px">${title}</h2>`;
			}

			else
			{
				lines[i] = `</section><h2 class="section-text">${title}</h2><section>`;
			}
		}

		// A heading. Only one of these per file.
		else if (lines[i][0] === "#" && lines[i][1] !== ".")
		{
			const title = parseText(lines[i].slice(2));

			pageTitle = title;

			const bannerHtml = usesBanner ? banner() :  "";

			lines[i] = `
				${bannerHtml}
				<header>
					<div id="logo">
						<a href="/home/" tabindex="-1">
							<img src="/graphics/general-icons/logo.png" alt="Logo" tabindex="1"></img>
						</a>
					</div>
					
					<div style="height: 20px"></div>
					
					<h1 class="heading-text">${title}</h1>
				</header>
				
				<main>
					<section>
			`;
		}

		// Regular text!
		else
		{
			const content = parseText(lines[i]);

			if (content.match(/^#+?\./))
			{
				lines[i] = `<p class="body-text numbered-list-item">${content.replace(/^#+?\./, `${currentNumberedItem}.`)}</p>`;

				currentNumberedItem++;
			}

			else if (content.match(/^[0-9]+?\./))
			{
				lines[i] = `<p class="body-text numbered-list-item">${content}</p>`;
			}

			else
			{
				lines[i] = `<p class="body-text">${content}</p>`;
			}
		}
	}

	// Remove blank lines and tabs.
	for (let i = 0; i < lines.length; i++)
	{
		lines[i] = lines[i].replace(/\t/g, "").replace(/\n/g, "");

		if (lines[i].length === 0)
		{
			lines.splice(i, 1);
			i--;
		}
	}



	html = lines.join("");

	// Gross
	html = html.replaceAll(/\[ESCAPEDNEWLINE\]/g, "\n");



	// End the HTML properly.

	html = `${html}</section></main>`;

	if (usesBanner)
	{
		html = `${html}</div>`;
	}



	if (pageTitle === "")
	{
		pageTitle = "Cruz Godar";
	}

	const headHtml = `<title>${pageTitle}</title><meta property="og:title" content="${pageTitle}"/><meta property="og:type" content="website"/><meta property="og:url" content="https://cruzgodar.com${parentFolder}"/><meta property="og:image" content="https://cruzgodar.com${parentFolder}cover.webp"/><meta property="og:locale" content="en_US"/><meta property="og:site_name" content="Cruz Godar"/>`;

	const indexHtml = `<!DOCTYPE html><html lang="en"><head>${headHtml}<style>body {opacity: 0;}</style></head><body><noscript><p class="body-text" style="text-align: center">JavaScript is required to use this site and many others. Consider enabling it.</p></noscript><script src="/scripts/init.min.js"></script></body></html>`;

	return [html, indexHtml];
}



export default async function buildHTMLFile(file, fileParentFolder, sitemapArgument)
{
	parentFolder = fileParentFolder;

	sitemap = sitemapArgument;

	const [html, indexHtml] = decodeHTMDL("\n" + file);

	write(`${fileParentFolder}data.html`, html);

	write(`${fileParentFolder}index.html`, indexHtml);
}