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
import { fileUpload } from "./components/fileUpload.js";
import { galleryBlock } from "./components/galleryBlock.js";
import { imageLinks } from "./components/image-links.js";
import { image } from "./components/image.js";
import { parseLatex } from "./components/latex.js";
import { notesEnvironment, notesEnvironmentNames } from "./components/notesEnvironment.js";
import { raymarchControls } from "./components/raymarchControls.js";
import { showSolutions } from "./components/showSolutions.js";
import { sliders } from "./components/sliders.js";
import { solution } from "./components/solution.js";
import { parseText } from "./components/text.js";
import { textarea } from "./components/textarea.js";
import { textBoxes } from "./components/textBoxes.js";

let sitemap;
let parentFolder;

const manualHeaderPages =
[
	"/home",

	"/projects/wilson",

	"/writing/caligo",
];

const singleLineComponents = [
	"banner",
	"canvas",
	"card",
	"center",
	"desmos",
	"dropdown",
	"file-upload",
	"image",
	"nav-buttons",
	"raymarch-controls",
	"show-solutions",
	"solution",
	"textarea",
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
	"file-upload": fileUpload,
	"gallery-block": galleryBlock,
	"image": image,
	"image-links": imageLinks,
	"nav-buttons": navButtons,
	"notes-environment": notesEnvironment,
	"raymarch-controls": raymarchControls,
	"show-solutions": showSolutions,
	"sliders": sliders,
	"solution": solution,
	"textarea": textarea,
	"text-boxes": textBoxes,
};

export let currentNumberedItem = 1;

export function setCurrentNumberedItem(newCurrentNumberedItem)
{
	currentNumberedItem = newCurrentNumberedItem;
}

export function parseUrl(url)
{
	return url[0] === "/" ? url : parentFolder + "/" + url;
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

function decodeHTMDL({
	html,
	fileParentFolder,
}) {
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
	if (
		!html.match(/^[\n\t\s]*?\n#\s/g)
		&& !manualHeaderPages.includes(parentFolder)
		&& sitemap[parentFolder]
	) {
		const title = sitemap[parentFolder].title;

		html = html.replaceAll(/(<div.*?>)?(### banner)?([\s\S]+)/g, (match, $1, $2, $3) => `${$1 ? $1 : ""}${$2 ? $2 : ""}\n\n# ${title}\n\n${$3 ? $3 : ""}`);
	}

	let hasHeading = false;

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

			lines[startI] = /* html */`<p class="body-text" style="text-align: center; line-height: 0"><span class="tex-holder" style="padding: 8px" data-source-tex="${sourceTex}">$$\\begin{align*}`;
		}



		// Handle code blocks.
		else if (lines[i].slice(0, 3) === "```")
		{
			if (lines[i].length > 3)
			{
				lines[i] = /* html */`<pre><code class="language-${lines[i].slice(3)}">`;
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

			lines[i - 1] = /* html */`${lines[i - 1]}</code></pre>`;

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

				if (words[0] === "card" && !options.includes("e"))
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
			const title = parseText(lines[i].slice(3));

			if (inEnvironment)
			{
				lines[i] = /* html */`<h2 class="section-text" style="margin-top: 80px">${title}</h2>`;
			}

			else
			{
				lines[i] = /* html */`</section><h2 class="section-text">${title}</h2><section>`;
			}
		}

		// A heading. Only one of these per file.
		else if (lines[i][0] === "#" && lines[i][1] !== ".")
		{
			hasHeading = true;

			const title = parseText(lines[i].slice(2));

			pageTitle = title;

			const bannerHtml = usesBanner ? banner() :  "";

			lines[i] = /* html */`
				${bannerHtml}
				<header>
					<div id="logo">
						<a href="/home" tabindex="-1">
							<img src="/graphics/general-icons/logo.webp" alt="Logo" tabindex="1"></img>
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

			if (content.match(/^#\./))
			{
				lines[i] = /* html */`<p class="body-text numbered-list-item">${content.replace(/^#\./, `${currentNumberedItem}.`)}</p>`;

				currentNumberedItem++;
			}

			else if (content.match(/^[0-9]+?\./))
			{
				lines[i] = /* html */`<p class="body-text numbered-list-item">${content}</p>`;
			}

			else
			{
				lines[i] = /* html */`<p class="body-text">${content}</p>`;
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

	if (hasHeading)
	{
		html = /* html */`${html}</section></main>`;
	}

	if (usesBanner)
	{
		html = /* html */`${html}</div></div>`;
	}



	const indexHtml = getIndexHTML(pageTitle);

	return [html, indexHtml];
}



function getIndexHTML(pageTitle)
{
	if (!pageTitle)
	{
		pageTitle = "Cruz Godar";
	}

	const headHtml = /* html */`<title>${pageTitle}</title><meta property="og:title" content="${pageTitle}"/><meta property="og:type" content="website"/><meta property="og:url" content="https://cruzgodar.com${parentFolder}"/><meta property="og:image" content="https://cruzgodar.com${parentFolder}/cover.webp"/><meta property="og:locale" content="en_US"/><meta property="og:site_name" content="Cruz Godar"/>`;

	const indexHtml = /* html */`<!DOCTYPE html><html lang="en"><head>${headHtml}<style>body {opacity: 0;}</style></head><body><noscript><p class="body-text" style="text-align: center">JavaScript is required to use this site and many others. Consider enabling it.</p></noscript><script src="/scripts/init.min.js"></script></body></html>`;

	return /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
	<title>${pageTitle}</title>

	<meta property="og:title" content="${pageTitle}"/>

	<meta property="og:type" content="website"/>

	<meta property="og:url" content="https://cruzgodar.com${parentFolder}"/>

	<meta property="og:image" content="https://cruzgodar.com${parentFolder}/cover.webp"/>

	<meta property="og:description" content="Teacher, developer, mathematical illustrator.">

	<meta property="og:locale" content="en_US"/>

	<meta property="og:site_name" content="Cruz Godar"/>

	<meta name="keywords" content="cruz,godar,cruzgodar,math,teaching,blog,notes,applet">
	<meta name="author" content="Cruz Godar">
	<meta name="description" content="Teacher, developer, mathematical illustrator.">

	<meta charset="utf-8"/>

	<link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png">

	<link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

	<link rel="manifest" href="/manifest.json">

	<link rel="stylesheet" type="text/css" href="/style/wilson.min.css">
	
	<link rel="stylesheet" type="text/css" href="/style/index.min.css">

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Gentium+Book+Basic&family=Rubik&family=Source+Code+Pro&display=swap" rel="stylesheet">


	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
	<meta id="theme-color-meta" name="theme-color" content="#ffffff">

	<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">

	<meta name="apple-mobile-web-app-title" content="Cruz Godar">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
</head>

<body>
	<noscript>
		<div style="height: 5vh"></div>
		
		<p class="body-text" style="text-align: center">JavaScript is required to use this site and many others. Consider enabling it.</p>
	</noscript>
	
	<div id="card-container">
		<div id="card-close-button"><span>&#215;</span></div>
	</div>

	<div id="height-measurer"></div>

	<script>
		window.MathJax =
		{
			tex:
			{
				inlineMath: [["$", "$"], ["\\(", "\\)"]]
			}
		};
	</script>

	<script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.0/es5/tex-mml-chtml.js"></script>
	
	<script type="module">
		const params = new URLSearchParams(window.location.search);

		window.DEBUG = params.get("debug") === "1";

		import(window.DEBUG ? "/scripts/src/main.js" : "/scripts/src/main.min.js").then(module => module.loadSite("${parentFolder}"));
	</script>
</body>
</html>
`;
}



export default async function buildHTMLFile(file, fileParentFolder, sitemapArgument)
{
	parentFolder = fileParentFolder;

	sitemap = sitemapArgument;

	const [html, indexHtml] = decodeHTMDL({
		html: "\n" + file,
		fileParentFolder
	});

	write(`${fileParentFolder}/data.html`, html);

	write(`${fileParentFolder}/index.html`, indexHtml);
}