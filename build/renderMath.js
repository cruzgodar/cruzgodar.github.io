import { init } from "../scripts/mathjax/node-main.mjs";
import { root } from "./file-io.js";

// MathJax's node entry point runs the same components the browser used to load
// from /scripts/mathjax, so the SVG the build bakes into data.html is what the
// client-side typesetter would have produced --- just without shipping 600KB of
// JavaScript and running a typesetting pass on every page load.
//
// The config mirrors what scripts/src/math.js used to set up. The addition is
// fontCache: "global", which keeps the glyph outlines in one shared <defs>
// instead of repeating them in every expression --- on the biggest notes page
// that's the difference between 169KB and 70KB of gzipped HTML. MathJax expects
// to put that <defs> in the document itself, which the build has nowhere to do
// (a card's document function is `body => body`), so renderMath hands out the
// glyphs that are new since the last expression and they ride along in that
// expression's own <svg>. SVG ids are document-scoped, so later expressions
// reference them wherever they ended up.
let mathjaxPromise = null;

function getMathJax()
{
	mathjaxPromise ??= init({
		loader:
		{
			load: ["input/tex", "output/svg", "[tex]/texhtml"],

			paths:
			{
				"mathjax-newcm": `${root}scripts/mathjax/mathjax-newcm-font`
			}
		},

		tex:
		{
			inlineMath: { "[+]": [["$", "$"]] },
			allowTexHTML: true,
			packages: { "[+]": ["texhtml"] },
		},

		output:
		{
			displayOverflow: "overflow",
			linebreaks:
			{
				inline: false,
			},
			fontCache: "global",
		},

		startup: { typeset: false },
	});

	return mathjaxPromise;
}

const namedEntities =
{
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	nbsp: " ",
	quot: "\"",
};

// Math in a .sp file is written for HTML, so it spells characters that would
// otherwise be markup as entities ($f''(a) &lt; 0$). The browser decoded those
// before MathJax ever saw them; now nothing does, so this has to. One pass, so
// that &amp;lt; decodes to &lt; rather than to <, and a bare & --- an alignment
// character in the alignat* that display math compiles to --- is left alone.
function decodeEntities(text)
{
	return text.replaceAll(/&(#[0-9]+|#x[0-9a-f]+|[a-z]+);/gi, (match, reference) =>
	{
		if (reference[0] !== "#")
		{
			return namedEntities[reference.toLowerCase()] ?? match;
		}

		const codePoint = reference[1].toLowerCase() === "x"
			? parseInt(reference.slice(2), 16)
			: parseInt(reference.slice(1), 10);

		return codePoint >= 0 && codePoint <= 0x10ffff
			? String.fromCodePoint(codePoint)
			: match;
	});
}

// The page the glyphs in the font cache have already been written into, and how
// many of them have been. spruce serializes compiles, so a different filePath
// means the previous page is finished and this one starts its cache over.
let cachedFilePath = null;
let writtenGlyphCount = 0;

// TeX to an <mjx-container> element's HTML. MathJax renders bad input as a
// <merror> rather than throwing, and a <merror> baked into a page is easy to
// miss, so it gets reported here the way a broken build step would.
export async function renderMath(tex, display)
{
	const mathjax = await getMathJax();

	const { adaptor, document } = mathjax.startup;
	const fontCache = document.outputJax.fontCache;

	if (globalThis.filePath !== cachedFilePath)
	{
		cachedFilePath = globalThis.filePath;
		writtenGlyphCount = 0;
		fontCache.clearCache();
	}

	let html = adaptor.outerHTML(
		await mathjax.tex2svgPromise(decodeEntities(tex), { display })
	);

	const glyphs = adaptor.childNodes(fontCache.getCache());

	if (glyphs.length > writtenGlyphCount)
	{
		const defs = glyphs
			.slice(writtenGlyphCount)
			.map(glyph => adaptor.outerHTML(glyph))
			.join("");

		writtenGlyphCount = glyphs.length;

		// The container's own <svg> --- the only one in its HTML, and the
		// <defs> has to be its first child.
		html = html.replace(/<svg[^>]*>/, match => `${match}<defs>${defs}</defs>`);
	}

	const errors = html.match(/data-mjx-error="(.*?)"/g);

	if (errors)
	{
		const messages = errors
			.map(error => error.replace(/^data-mjx-error="(.*)"$/, "$1"))
			.join(", ");

		console.error(`Math error in ${globalThis.filePath}: ${messages}\n  ${tex}`);
	}

	return html;
}

// Render the $...$ in a plain string that isn't markup --- a page or link title
// out of the sitemap, say, which the client-side typesetter used to pick up
// along with everything else on the page. Only for strings that become HTML:
// a title in an alt attribute or a <title> has to stay as it was written.
export async function renderMathInText(text)
{
	if (!text.includes("$"))
	{
		return text;
	}

	const pieces = text.split(/\$([^$]+)\$/g);

	// split() with one capture group alternates text, math, text, math, ..., so
	// the odd indices are the bodies that were between dollar signs.
	for (let i = 1; i < pieces.length; i += 2)
	{
		pieces[i] = await renderMath(pieces[i], false);
	}

	return pieces.join("");
}
