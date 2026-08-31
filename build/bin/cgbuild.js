#!/usr/bin/env bun

import { spawnSync } from "child_process";
import { existsSync, readdirSync, rmSync } from "fs";
import { buildSitemap, sitemapPath } from "../build-sitemap.js";
import { buildXmlSitemap } from "../build-xml-sitemap.js";
import { read, write } from "../file-io.js";
import buildHTMLFile from "../htmdl/build.js";
import { convertHtmlToTex } from "/scripts/src/convertHtmlToTex.js";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild =
[
	/build.+/,
	/slides\/.+\/index\.htmdl/,
	/projects\/lapsa\/index\.htmdl/,
	/scripts\/three\.js/,
	/scripts\/anime\.js/,
	/scripts\/mathjax.+/,
	/teaching\/uo\/342\/extra\/eigenfaces-demo\/scripts\/data\.js/,
	/teaching\/notes\/linear-algebra\/singular-value-decompositions\/scripts\/data\.js/,
	/teaching\/notes\/linear-algebra\/singular-value-decompositions\/scripts\/vData\.js/,
	/math\/dissertation\/dissertation\.pdf/,
];

const options =
{
	clean: process.argv.slice(2).includes("-c"),
	pdf: process.argv.slice(2).includes("--pdf"),
	images: process.argv.slice(2).includes("--images"),
};

// The site's own cards and image links use cover.webp, so it stays at the size
// they expect; only og:image uses the JPEG, which is why the two sizes differ.
// The JPEG size is a cap rather than a target --- a cover with a smaller source
// (or one derived from a committed cover.webp) is left at its own size instead
// of being upscaled, so no og:image:width/height is written.
const coverJpgSize = 1500;
const coverWebpSize = 500;

const courseNames = [
	[/teaching\/uo\/253\/.+/, "Math 253"],
	[/teaching\/uo\/256\/.+/, "Math 256"],
	[/teaching\/uo\/341\/.+/, "Math 341"],
	[/teaching\/uo\/342\/.+/, "Math 342"],

	[/teaching\/yale\/1120\/.+/, "Math 1120"],
	[/teaching\/yale\/1180\/.+/, "Math 1180"],
];

let sitemap;

// After a non-clean build, find output files (.min.js, .min.css, .html)
// that are modified according to git but whose source files are not.
// This handles the case where a source file is modified, built, and then
// reverted --- the output would be left stale without this cleanup.
function restoreStaleOutputFiles()
{
	// Get all currently modified tracked files.
	const proc = spawnSync("git", [
		"-C",
		root,
		"ls-files",
		"--modified"
	]);

	const modifiedFiles = new Set(
		proc.stdout.toString().split("\n").filter(f => f)
	);

	for (const file of modifiedFiles)
	{
		const isOutput =
			file.endsWith(".min.js")
			|| file.endsWith(".min.mjs")
			|| file.endsWith(".min.css")
			|| (
				file.endsWith(".html")
				&& (file.endsWith("/index.html") || file.endsWith("/data.html"))
			);

		if (!isOutput)
		{
			continue;
		}

		// Determine the source file for this output.
		let sourceFile;

		if (file.endsWith(".min.js") || file.endsWith(".min.mjs"))
		{
			sourceFile = file.replace(/\.min\.(m*js)$/, ".$1");
		}
		else if (file.endsWith(".min.css"))
		{
			sourceFile = file.replace(/\.min\.css$/, ".css");
		}
		else if (file.endsWith("/index.html") || file.endsWith("/data.html"))
		{
			const dir = file.slice(0, file.lastIndexOf("/"));
			sourceFile = dir + "/index.htmdl";
		}

		// If the source file is NOT modified, the output is stale --- restore it.
		if (sourceFile && existsSync(root + sourceFile) && !modifiedFiles.has(sourceFile))
		{
			console.log(`Restoring ${file}`);

			spawnSync("git", [
				"-C",
				root,
				"checkout",
				"--",
				file
			]);
		}
	}
}



async function buildSite()
{
	await buildSitemap();

	const text = await read(sitemapPath);

	if (!text)
	{
		console.error("Cannot read sitemap");
		return;
	}

	sitemap = JSON.parse(text.slice(text.indexOf("{"), text.length - 1));

	const proc = spawnSync("git", [
		"-C",
		root,
		"ls-files",
		...(options.clean
			? []
			: [
				"--modified",
				"--deleted",
				"--others",
				"--exclude-standard"
			])
	]);

	const files = proc.stdout.toString().split("\n");

	await parseModifiedFiles(files);

	if (!options.clean)
	{
		restoreStaleOutputFiles();
	}

	await buildXmlSitemap();

	process.exit(0);
}

async function parseModifiedFiles(files)
{
	await Promise.all(files.map(file => buildFile(file)));
}

async function buildFile(file)
{
	if (!file || file.indexOf(".") === -1)
	{
		return;
	}
	
	for (let i = 0; i < excludeFromBuild.length; i++)
	{
		if (excludeFromBuild[i].test(file))
		{
			return;
		}
	}

	const lastSlashIndex = file.lastIndexOf("/") + 1;
	const end = file.slice(lastSlashIndex);
	const index = end.indexOf(".");

	if (index <= 0)
	{
		return;
	}

	const filename = end.slice(0, index);
	const extension = end.slice(index + 1);

	if (extension === "htmdl" && filename === "index")
	{
		const text = await read(file);
		
		if (text)
		{
			console.log(file);

			await buildHTMLFile(text, "/" + file.slice(0, lastSlashIndex - 1), sitemap);

			ensureCoverImage(file);
		}
	}

	else if (
		extension === "htmdl" && filename === "card"
		&& (!options.clean || (options.clean && options.pdf))
	) {
		const text = await read(file);
		
		if (text)
		{
			console.log(file);

			await buildHTMLFile(text, "/" + file.slice(0, lastSlashIndex - 1), sitemap);

			ensureCoverImage(file);

			const path = file.slice(0, lastSlashIndex - 1);

			await prepareTexFromHTML(`${path}/data.html`);
		}
	}

	else if (extension === "js")
	{
		const text = await read(file);
		
		if (text)
		{
			console.log(file);

			await buildJSFile(file);
		}
	}

	else if (extension === "css")
	{
		const text = await read(file);
		
		if (text)
		{
			console.log(file);

			await buildCSSFile(file);
		}
	}

	else if (
		filename === "cover-src" && extension === "png"
		&& (!options.clean || (options.clean && options.images))
	) {
		console.log(file);
		
		await buildCoverImage(file);
	}

	else if (
		filename === "index" && extension === "pdf"
		&& (!options.clean || (options.clean && options.pdf))
	) {
		const files = readdirSync(`${root}/${file.slice(0, lastSlashIndex - 1)}`);

		if (!(files.some(f => f.endsWith(".htmdl"))))
		{
			console.log(file);

			await buildPDFFile(file);
		}
	}
}

async function buildJSFile(file)
{
	const outputFile = file.replace(/(\.m*js)/, (match, $1) => `.min${$1}`);

	// Point uglifyjs at a scratch file rather than at outputFile directly. The
	// dev server may be serving outputFile right now, and this used to write it
	// twice -- once from uglifyjs and once to patch the import paths -- so there
	// were two windows where a request could land on a truncated file. Now the
	// patched result is written once, atomically, by write().
	const scratchFile = `${outputFile}.build`;

	const proc = spawnSync("uglifyjs", [
		root + file,
		"--output",
		root + scratchFile,
		"--compress",
		"--mangle",
		"--keep-fargs",
		"--webkit"
	]);

	const js = proc.status === 0 ? await read(scratchFile) : null;

	rmSync(root + scratchFile, { force: true });

	// Leave the previous output in place if minifying failed --- overwriting it
	// with an empty file just turns a build error into a mystery syntax error
	// in the browser.
	if (js === null)
	{
		console.error(`Failed to minify ${file}:\n${proc.stderr.toString()}`);

		return;
	}

	// The space after the import is very important --
	// that prevents dynamic imports from getting screwed up.
	await write(
		outputFile,
		js.replace(/(import[ {*].*?)\.(m*)js/g, (match, $1, $2) => `${$1}.min.${$2}js`)
	);
}

async function buildCSSFile(file)
{
	const outputFile = file.replace(/(\.css)/, (match, $1) => `.min${$1}`);

	// Same reasoning as buildJSFile --- don't let the dev server catch
	// outputFile mid-write.
	const scratchFile = `${outputFile}.build`;

	const proc = spawnSync("uglifycss", [
		root + file,
		"--output",
		root + scratchFile
	]);

	const css = proc.status === 0 ? await read(scratchFile) : null;

	rmSync(root + scratchFile, { force: true });

	if (css === null)
	{
		console.error(`Failed to minify ${file}:\n${proc.stderr.toString()}`);

		return;
	}

	await write(outputFile, css);
}

// The folder a page's cover images live in, with a trailing slash.
function coverFolder(file)
{
	const index = file.lastIndexOf("/");

	return index === -1 ? "" : file.slice(0, index + 1);
}

// og:image points at cover.jpg rather than cover.webp: Apple's link-preview
// fetcher (iMessage, Notes, Safari) can't decode WebP and silently falls back
// to the page's favicon.
function ensureCoverImage(file)
{
	const folder = coverFolder(file);

	const coverSource = existsSync(`${root}${folder}cover-src.png`)
		? `${root}${folder}cover-src.png`
		: null;

	if (!coverSource && !existsSync(`${root}${folder}index.pdf`))
	{
		console.warn(`No cover-src.png in ${folder || "/"}`);
	}

	// Rebuild the JPEG from the best image on hand every time the page is built,
	// so it can never fall out of step with the WebP or with coverJpgSize.
	// Pages with a cover-src.png go back to the source; the rest --- including
	// the ones whose cover.webp was committed without a source --- only have the
	// WebP to work from, so their JPEG stays at the WebP's size.
	const input = coverSource ?? `${root}${folder}cover.webp`;

	if (!existsSync(input))
	{
		console.warn(`No cover image in ${folder || "/"} --- link previews will fall back to the favicon`);

		return;
	}

	spawnSync("magick", [
		input,
		"-resize",
		`${coverJpgSize}x${coverJpgSize}>`,
		"-quality",
		"85",
		`${root}${folder}cover.jpg`
	]);
}

function buildPDFFile(file)
{
	const folder = coverFolder(file);

	spawnSync("magick", [
		`${root}${file}[0]`,
		"-resize",
		"2000x",
		"-gravity",
		"north",
		"-background",
		"white",
		"-flatten",
		"-crop",
		"2000x2000+0+0",
		"-morphology",
		"Erode",
		"Diamond",
		"-quality",
		"85",
		// The clone writes the WebP and then drops off the stack, leaving the
		// full-size render behind for the JPEG --- so the PDF, which is by far
		// the slowest part of this, is only rendered once.
		"(",
		"+clone",
		"-resize",
		`${coverWebpSize}x${coverWebpSize}`,
		"-write",
		`${root}${folder}cover.webp`,
		"+delete",
		")",
		"-resize",
		`${coverJpgSize}x${coverJpgSize}>`,
		`${root}${folder}cover.jpg`
	]);
}

function buildCoverImage(file)
{
	const folder = coverFolder(file);

	spawnSync("magick", [
		`${root}${file}`,
		"-quality",
		"85",
		// As in buildPDFFile --- the clone writes the WebP, then the source
		// image it was cloned from becomes the JPEG.
		"(",
		"+clone",
		"-resize",
		`${coverWebpSize}x${coverWebpSize}`,
		"-write",
		`${root}${folder}cover.webp`,
		"+delete",
		")",
		"-resize",
		`${coverJpgSize}x${coverJpgSize}>`,
		`${root}${folder}cover.jpg`
	]);
}



async function prepareTexFromHTML(file)
{
	let courseName;

	for (const [regex, name] of courseNames)
	{
		if (regex.test(file))
		{
			courseName = name;
			break;
		}
	}

	if (!courseName)
	{
		throw new Error(`No course name found! File: ${file}`);
	}

	const path = file.slice(0, file.lastIndexOf("/"));

	const result = await convertHtmlToTex({
		html: await read(file),
		course: courseName,
		pageUrl: `/${path}`
	});

	// Write a standard tex file.
	await write(
		`${path}/${result[1]}.tex`,
		result[0]
	);

	console.log(`${path}/${result[1]}.tex`);

	if (result[2])
	{
		// Zip the tex file and the graphics directory.
		spawnSync("zip", [
			"-r",
			`${result[1]}.zip`,
			`${result[1]}.tex`,
			"graphics"
		], { cwd: `${root}/${path}` });
	}

	const proc = spawnSync(
		"pdflatex",
		[`${result[1]}.tex`, "-interaction=nonstopmode"],
		{ cwd: `${root}/${path}` }
	);

	parseTexErrors(proc.stdout.toString());

	// Remove the auxiliary files.
	spawnSync(
		"rm",
		["-f", `${result[1]}.aux`, `${result[1]}.log`, `${result[1]}.out`],
		{ cwd: `${root}/${path}` }
	);
}



function parseTexErrors(stdout)
{
	const lines = stdout.toString().split("\n");
	const errorThings = [/error/i, /undefined/i];

	outerloop: for (let i = 0; i < lines.length; i++)
	{
		if (lines[i] === "Package biblatex Warning: Using fall-back bibtex backend:")
		{
			continue;
		}
		
		for (const badThing of errorThings)
		{
			if (badThing.test(lines[i]))
			{
				let error = lines[i];
				for (let j = i; j < Math.min(i + 5, lines.length); j++)
				{
					error = `${error}\n${lines[j]}`;
				}
				console.error(error + "\n");
				continue outerloop;
			}
		}
	}
}



buildSite();