#!/usr/bin/env bun

import { spawnSync } from "child_process";
import { buildSitemap, sitemapPath } from "../build-sitemap.js";
import { buildXmlSitemap } from "../build-xml-sitemap.js";
import { read, write } from "../file-io.js";
import buildHTMLFile from "../htmdl/build.js";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild =
[
	/build.+/,
	/slides\/.+\/index\.htmdl/,
	/scripts\/three\.js/,
	/scripts\/anime\.js/,
	/scripts\/math\.js/,
	/teaching\/uo\/342\/extra\/eigenfaces-demo\/scripts\/data\.js/,
	/teaching\/uo\/342\/notes\/9-singular-value-decompositions\/scripts\/data.js/,
	/teaching\/uo\/342\/notes\/9-singular-value-decompositions\/scripts\/vData.js/
];

const options =
{
	clean: process.argv.slice(2).includes("-c"),
};

let sitemap;



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
		...(options.clean ? [] : ["-m"])
	]);

	const files = proc.stdout.toString().split("\n");

	const directories = Array.from(new Set(
		files.map(file => {
			if (file.indexOf("/") === -1)
			{
				return "";
			}

			return file.slice(0, file.lastIndexOf("/"));
		})
	));

	const expandedFiles = directories.map(directory =>
		spawnSync("ls", [
			"-p",
		], {
			cwd: root + directory
		}).stdout.toString().split("\n").map(file => `${directory}/${file}`)
	).flat();

	await parseModifiedFiles(expandedFiles);
	
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

			await buildHTMLFile(text, "/" + file.slice(0, lastSlashIndex), sitemap);
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

	else if (extension === "pdf")
	{
		console.log(file);

		await buildPDFFile(file);
	}
}

async function buildJSFile(file)
{
	const outputFile = file.replace(/(\.m*js)/, (match, $1) => `.min${$1}`);

	spawnSync("uglifyjs", [
		root + file,
		"--output",
		root + outputFile,
		"--compress",
		"--mangle",
		"--keep-fargs",
		"--webkit"
	]);
	
	const js = await read(outputFile);

	// The space after the import is very important --
	// that prevents dynamic imports from getting screwed up.
	await write(
		outputFile,
		js.replace(/(import[ {].*?)\.(m*)js/g, (match, $1, $2) => `${$1}.min.${$2}js`)
	);
}

function buildCSSFile(file)
{
	const outputFile = file.replace(/(\.css)/, (match, $1) => `.min${$1}`);

	spawnSync("uglifycss", [
		root + file,
		"--output",
		root + outputFile
	]);
}

function buildPDFFile(file)
{
	const index = file.lastIndexOf("/");
	const outputFile = (index === -1 ? file : file.slice(0, index + 1)) + "cover.webp";

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
		"-resize",
		"500x500",
		"-quality",
		"85",
		`${root}${outputFile}`
	]);
}



buildSite();