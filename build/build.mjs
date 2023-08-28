import { exec } from "child_process";
import buildHTMLFile from "./build-html-file.mjs";
import buildSitemap, { sitemapPath } from "./build-sitemap.mjs";
import { read, write } from "./file-io.mjs";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild =
[
	/build.+/,
	/slides\/.+\/index\.htmdl/
];

const clean = process.argv.slice(2).includes("-c");
const fix = process.argv.slice(2).includes("-f");



async function buildSite()
{
	await buildSitemap();

	const text = await read(sitemapPath);

	if (!text)
	{
		console.error("Cannot read sitemap");
		return;
	}

	const sitemap = JSON.parse(text.slice(text.indexOf("{"), text.length - 1));

	await new Promise(resolve =>
	{
		exec(`git -C ${root} ls-files${clean ? "" : " -m -o"}`, async (error, stdout) =>
		{
			await parseModifiedFiles(stdout.split("\n"), sitemap);

			await eslint();

			resolve();
		});
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

		let broken = false;

		for (let i = 0; i < excludeFromBuild.length; i++)
		{
			if (excludeFromBuild[i].test(file))
			{
				broken = true;
				break;
			}
		}

		if (broken)
		{
			continue;
		}

		const lastSlashIndex = file.lastIndexOf("/") + 1;
		const end = file.slice(lastSlashIndex);
		const index = end.indexOf(".");

		if (index <= 0)
		{
			continue;
		}

		const filename = end.slice(0, index);
		const extension = end.slice(index + 1);

		if (extension === "htmdl" && filename === "index")
		{
			const text = await read(file);

			if (text)
			{
				console.log(file);

				buildHTMLFile(text, "/" + file.slice(0, lastSlashIndex), sitemap);
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

				buildCSSFile(file);
			}
		}
	}
}

function buildJSFile(file)
{
	return new Promise(resolve =>
	{
		const outputFile = file.replace(/(\.m*js)/, (match, $1) => `.min${$1}`);

		exec(`uglifyjs ${root + file} --output ${root + outputFile} --compress`, async () =>
		{
			const js = await read(outputFile);

			//The space after the import is very import -- that prevents dynamic imports from getting screwed up.
			write(outputFile, js.replace(/(import[^(].*?)\.(m*)js/g, (match, $1, $2) => `${$1}.min.${$2}js`));

			resolve();
		});
	});
}

function buildCSSFile(file)
{
	const outputFile = file.replace(/(\.css)/, (match, $1) => `.min${$1}`);

	exec(`uglifycss ${root + file} --output ${root + outputFile}`);
}

async function eslint()
{
	await new Promise(resolve =>
	{
		exec(`eslint --ext .js,.mjs${fix ? " --fix" : ""} ${root}`, (error, stdout) =>
		{
			if (stdout)
			{
				console.log(stdout);
			}

			resolve();
		});
	});
}



buildSite();