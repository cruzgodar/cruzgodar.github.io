import { exec } from "child_process"
import { read, write } from "./file-io.mjs"
import buildSitemap from "./build-sitemap.mjs"
import buildHTMLFile from "./build-html-file.mjs";
import { sitemapPath } from "./build-sitemap.mjs"

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const excludeFromBuild = 
[
	/build.+/,
	/scripts\/init\.js/
];

const siteCSSFiles =
[
	"applets",
	"banners",
	"buttons-and-boxes",
	"header",
	"image-links",
	"main",
	"notes",
];

const clean = process.argv.slice(2).includes("-c");



async function buildSite()
{
	await buildSitemap();
	
	const text = await read(sitemapPath);

	if (!text)
	{
		console.error("Cannot read sitemap");
		return;
	}

	const sitemap = JSON.parse(text.slice(text.indexOf("{")));

	await new Promise((resolve, reject) =>
	{
		exec(`git -C ${root} ls-files${clean ? "" : " -m -o"}`, async (error, stdout, stderr) =>
		{
			await parseModifiedFiles(stdout.split("\n"), sitemap);

			resolve();
		});
	});

	buildSiteCSS();
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
		const extension = end.slice(index + 1)

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
	return new Promise(async (resolve, reject) =>
	{
		const outputFile = file.replace(/(\.m*js)/, (match, $1) => `.min${$1}`);
		
		exec(`uglifyjs ${root + file} --output ${root + outputFile} --compress --mangle`, async () =>
		{
			const js = await read(outputFile);
			
			//The space after the import is very import -- that prevents dynamic imports from getting screwed up.
			write(outputFile, js.replace(/(import[^\(].*?)\.mjs/g, (match, $1) => `${$1}.min.mjs`));

			resolve();
		});
	});
}

function buildCSSFile(file)
{
	const outputFile = file.replace(/(\.css)/, (match, $1) => `.min${$1}`);

	exec(`uglifycss ${root + file} --output ${outputFile}`);
}

async function buildSiteCSS()
{
	let bundle = "";

	for (let i = 0; i < siteCSSFiles.length; i++)
	{
		const text = await read(`/style/src/${siteCSSFiles[i]}.min.css`);

		bundle += text;
	}

	await write("/style/css-bundle.min.css", bundle);
}



buildSite();