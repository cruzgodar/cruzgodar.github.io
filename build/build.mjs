import {exec} from "child_process"
import {read} from "./file-io.mjs"
import buildSitemap from "./build-sitemap.mjs"
import buildHTMLFile from "./build-html-file.mjs";
import {sitemapPath} from "./build-sitemap.mjs"

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild = 
[
	/build\/[^\/]+\./,
	/scripts\/init\.js/
];

const clean = process.argv.slice(2).includes("-c");

async function buildSite()
{
	await buildSitemap();
	
	const text = await read(sitemapPath);
	const sitemap = JSON.parse(text.slice(text.indexOf("{")));

	exec(`git -C ${root} ls-files${clean ? "" : " -m -o"}`, (error, stdout, stderr) =>
	{
		parseModifiedFiles(stdout.split("\n"), sitemap);
	});
}

async function parseModifiedFiles(files, sitemap)
{
	for (let k = 0; k < files.length; k++)
	{
		if (!files[k])
		{
			continue;
		}
		
		const file = files[k];

		if (file.indexOf(".") === -1)
		{
			continue;
		}

		for (let i = 0; i < excludeFromBuild.length; i++)
		{
			if (excludeFromBuild[i].test(file))
			{
				continue;
			}
		}

		const lastSlashIndex = file.lastIndexOf("/") + 1;
		const end = file.slice(lastSlashIndex);
		const index = end.indexOf(".");
		
		if (index <= 0)
		{
			continue;
		}

		const filename = end.slice(0, index);
		const extension = end.slice(index + 1)

		if (extension === "html" && filename === "src")
		{
			console.log(file);
			const text = await read(file);
			buildHTMLFile(text, "/" + file.slice(0, lastSlashIndex), sitemap);
		}

		else if (extension === "mjs" || extension === "js")
		{
			console.log(file);
			buildJSFile(file);
		}

		else if (extension === "css")
		{
			console.log(file);
			buildCSSFile(file);
		}
	}
}

function buildJSFile(file)
{
	const outputFile = file.replace(/(\.m*js)/, (match, $1) => `.min${$1}`);

	exec(`google-closure-compiler --js ${file} --js_output_file ${outputFile} --language_in UNSTABLE --language_out UNSTABLE`);
}

function buildCSSFile(file)
{
	const outputFile = file.replace(/(\.css)/, (match, $1) => `.min${$1}`);

	exec(`uglifycss ${file} --output ${outputFile}`);
}



buildSite();