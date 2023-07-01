import {exec} from "child_process"
import {read, write} from "./file-io.mjs"
import buildSitemap from "./build-sitemap.mjs"

const root = process.argv[1].replace(/(\/90259025.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild = [/build\/[^\/]+\./];



async function buildSite()
{
	buildSitemap()

	.then(() =>
	{
		exec(`git -C ${root} ls-files -m -o`, (error, stdout, stderr) => parseModifiedFiles(stdout.split("\n")));
	});
}

function parseModifiedFiles(files)
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

		const end = file.slice(file.lastIndexOf("/") + 1);
		const index = end.indexOf(".");
		
		if (index <= 0)
		{
			return;
		}

		const filename = end.slice(0, index);
		const extension = end.slice(index + 1);

		if (extension === "html" && filename === "src")
		{
			const text = await read(file);
			//const html = buildHTMLFile(text);
		}
	})
}



buildSite();