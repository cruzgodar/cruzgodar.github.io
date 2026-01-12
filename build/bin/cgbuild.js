#!/usr/bin/env bun

import { spawnSync } from "child_process";
import { readdirSync } from "fs";
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
	/scripts\/three\.js/,
	/scripts\/anime\.js/,
	/scripts\/math\.js/,
	/teaching\/uo\/342\/extra\/eigenfaces-demo\/scripts\/data\.js/,
	/teaching\/notes\/linear-algebra\/singular-value-decompositions\/scripts\/data.js/,
	/teaching\/notes\/linear-algebra\/singular-value-decompositions\/scripts\/vData.js/
];

const options =
{
	clean: process.argv.slice(2).includes("-c"),
	pdf: process.argv.slice(2).includes("--pdf"),
};

const courseNames = [
	[/teaching\/uo\/253\/.+/, "Math 253"],
	[/teaching\/uo\/256\/.+/, "Math 256"],
	[/teaching\/uo\/341\/.+/, "Math 341"],
	[/teaching\/uo\/342\/.+/, "Math 342"],

	[/teaching\/yale\/1120\/.+/, "Math 1120"],
	[/teaching\/yale\/1180\/.+/, "Math 1180"],
];

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

			await buildHTMLFile(text, "/" + file.slice(0, lastSlashIndex - 1), sitemap);
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
		extension === "pdf"
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
		js.replace(/(import[ {*].*?)\.(m*)js/g, (match, $1, $2) => `${$1}.min.${$2}js`)
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
	write(
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