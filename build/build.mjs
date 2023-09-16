import { spawnSync } from "child_process";
import buildHTMLFile from "./build-html-file.mjs";
import { buildSitemap, sitemapPath } from "./build-sitemap.mjs";
import { buildXmlSitemap } from "./build-xml-sitemap.mjs";
import { read, write } from "./file-io.mjs";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild =
[
	/build.+/,
	/slides\/.+\/index\.htmdl/,
	/scripts\/three\.js/,
	/scripts\/anime\.js/,
	/scripts\/math\.js/,
];

const options =
{
	clean: process.argv.slice(2).includes("-c"),
	fix: process.argv.slice(2).includes("-f"),
};

let sitemap;



async function buildSite()
{
	if (options.fix)
	{
		await eslint();
	}

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
		...(options.clean ? [] : ["-m", "-o"])
	]);

	await parseModifiedFiles(proc.stdout.toString().split("\n"));

	buildXmlSitemap();
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

	else if (extension === "mjs" || extension === "js")
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

	//The space after the import is very important --
	//that prevents dynamic imports from getting screwed up.
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

async function eslint()
{
	const proc = spawnSync("eslint", [
		"--ext",
		".js,.mjs",
		"--fix",
		root
	]);
	
	const text = proc.stdout.toString();

	if (text)
	{
		console.log(text);
	}
}



buildSite();