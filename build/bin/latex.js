const preamble = String.raw`\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage[dvipsnames]{xcolor}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{graphicx}
\usepackage[total={6.5in, 9in}, heightrounded]{geometry}
\usepackage{hyperref}

\graphicspath{{graphics/}}
\setenumerate[0]{label=\alph*)}
\setlength{\parindent}{0pt}
\setlength{\parskip}{8pt}
\setlength\fboxsep{0pt}
\renewcommand{\baselinestretch}{1.6}
\titleformat{\section}
{\normalfont \Large \bfseries \centering}{}{0pt}{}

\newcommand{\s}[1]{{\color{violet} #1}}

\begin{document}

\Large Name: \rule{2in}{0.15mm} \hfill `;

export function convertCardToTex({
	html,
	course,
	pageUrl
}) {
	const title = html.match(/<h1.*?>(.*?)<\/h1>/)?.[1];

	const imageUrls = [];

	const tex = preamble
		+ `${title} | ${course} | Cruz Godar \\vspace{4pt} \\normalsize\n\n`
		+ html
			// Remove the wrapping card divs.
			.replaceAll(/^<div.*?>/g, "")
			.replaceAll(/<\/div>$/g, "")
			// Remove the heading.
			.replaceAll(/<h1.*?>(.*?)<\/h1>/g, "")
			// Remove buttons.
			.replaceAll(/<div.*? class="text-buttons">.*?<\/div><\/div>/g, "")
			// Images.
			.replaceAll(/<img.*? data-src="(.+?)".*?>(<\/img>)?/g, (match, $1) =>
			{
				imageUrls.push($1);
				const filename = $1.split("/").pop();
				return `
\\begin{center}
	\\includegraphics[width=0.5\\linewidth]{${filename}}
\\end{center}
`;
			})
			// Links.
			.replaceAll(/<a.*? href="(.+?)".*?>(.+?)<\/a>/g,  (match, $1, $2) =>
			{
				if ($1.slice(0, 4) === "http" || $1.slice(0, 3) === "www")
				{
					return `\\href{${$1}}{${$2}}`;
				}

				else if ($1[0] === "/")
				{
					return `\\href{https://cruzgodar.com${$1}}{${$2}}`;
				}

				return `\\href{https://cruzgodar.com${pageUrl}/${$1}}{${$2}}`;
			})
			.replaceAll(/<!--.*?-->/g, "")
			.replaceAll(
				/<span[^>]*?inline-math[^>]*?data-source-tex=".*?"[^>]*?>(.*?)<\/span>/g,
				(match, $1) => $1
			)
			.replaceAll(
				/<span[^>]*?data-source-tex="(.*?)"[^>]*?>.*?<\/span>/g,
				(match, $1) => $1
			)
			.replaceAll(/<strong.*?>(.+?)<\/strong>/g, (match, $1) => `\\textbf{${$1}}`)
			.replaceAll(/<em.*?>(.+?)<\/em>/g, (match, $1) => `\\textit{${$1}}`)
			.replaceAll(/&amp;/g, " &")
			.replaceAll(/&#x2019;/g, "'")
			.replaceAll(/&lt;/g, "<")
			.replaceAll(/\s\s&/g, " &")
			.replaceAll(/&ndash;/g, "--")
			.replaceAll(/&mdash;/g, "---")
			.replaceAll(/<p.*?>(.+?)<\/p>/g, (match, $1) => `${$1}\n\n`)
			.replaceAll(/\[NEWLINE\]/g, "\n")
			.replaceAll(/\[TAB\]/g, "\t")
			.replaceAll(/(\n[0-9]+\.)/g, (match, $1) => `\n${$1}`)
			.replaceAll(/<span style="height: 32px"><\/span>/g, "\n~\\\\")
			.replaceAll(/<span.*?><\/span>[a-z]\)/g, "\t\\item")
			.replaceAll(
				/((?:\t\\item.*\n\n)+)/g,
				(match, $1) => `\\begin{enumerate}\n\n${$1}\\end{enumerate}\n\n`
			)
			.replaceAll(/<h2.*?>(.+?)<\/h2>/g, (match, $1) => `\n\\section{${$1}}\n\n`)
			.replaceAll(/\n\n\n/g, "\n\n")
		+ "\n\\end{document}";

	return imageUrls.length ? [tex, title, imageUrls] : [tex, title];
}