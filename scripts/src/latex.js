/* eslint-disable @stylistic/semi */
const preamble = String.raw`\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[total={6.5in, 9in}, heightrounded]{geometry}
\setenumerate[0]{label=\alph*)}
\setlength{\parindent}{0pt}
\setlength{\parskip}{8pt}
\setlength\fboxsep{0pt}
\renewcommand{\baselinestretch}{1.6}
\titleformat{\section}
{\normalfont \Large \bfseries \centering}{}{0pt}{}

\begin{document}

\Large Name: [YOUR NAME HERE] \hfill `;

export function convertCardToLatex(element, title, course)
{
	const clonedElement = element.cloneNode(true);

	clonedElement.querySelectorAll(".tex-holder > *, #card-close-button, h1")
		.forEach(e => e.remove());
	
	const firstSection = clonedElement.querySelector("h2");
	
	while (firstSection.previousElementSibling)
	{
		firstSection.previousElementSibling.remove();
	}

	const tex = preamble
		+ `${title} | ${course} | Cruz Godar \\vspace{4pt} \\normalsize\n\n`
		+ clonedElement.innerHTML
			.replaceAll(/<h2.*?>(.+?)<\/h2>/g, (match, $1) => `\\section{${$1}}\n\n`)
			.replaceAll(/<p.*?>(.+?)<\/p>/g, (match, $1) => `${$1}\n\n`)
			.replaceAll(
				/<span[^>]*?inline-math[^>]*?data-source-tex="([^>]*?)"[^>]*?>(.*?)<\/span>/g,
				(match, $1, $2) => `$${$1}$${$2}`
			)
			.replaceAll(/<strong.*?>(.+?)<\/strong>/g, (match, $1) => `\\textbf{${$1}}`)
			.replaceAll(/<em.*?>(.+?)<\/em>/g, (match, $1) => `\\textit{${$1}}`)
			.replaceAll(/<span.*?><\/span>[a-z]\)/g, "\\item")
			.replaceAll(/–/g, "--")
			.replaceAll(/—/g, "---")
		+ "\\end{document}"

	console.log(tex);
}

function downloadText(filename, text)
{
	const element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," + encodeURIComponent(text)
	);
	element.setAttribute("download", filename);

	element.style.display = "none";
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}