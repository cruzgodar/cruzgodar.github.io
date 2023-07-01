import {exec} from "child_process"
import {read, write} from "./file-io.mjs"
import buildSitemap from "./build-sitemap.mjs"
import buildHTMLFile from "./build-html-file.mjs";
import {sitemapPath} from "./build-sitemap.mjs"

const root = process.argv[1].replace(/(\/90259025.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild = [/build\/[^\/]+\./];



async function buildSite()
{
	await buildSitemap();

	const text = await read(sitemapPath);
	const sitemap = JSON.parse(text.slice(text.indexOf("{")));

	exec(`git -C ${root} ls-files -m -o`, (error, stdout, stderr) =>
	{
		parseModifiedFiles(stdout.split("\n"), sitemap);
	});
}

function parseModifiedFiles(files, sitemap)
{
	files.forEach(async file =>
	{
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

		if (extension === "html" && filename === "src")
		{
			buildHTMLFile(await read(file), "/" + file.slice(0, lastSlashIndex), sitemap);
		}
	});
}



buildSite();