import { getModifiedDate, read } from "./file-io.js";

const { spawnSync } = require("child_process");

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);


export async function validateAllLinks(clean = false)
{
	const proc = spawnSync("git", [
		"-C",
		root,
		"ls-files",
		...(clean ? [] : ["-m", "-o"])
	]);

	const files = proc.stdout.toString()
		.split("\n")
		.filter(file => file.slice(file.lastIndexOf(".")) === ".html");

	await Promise.all(files.map(validateLinksInFile));
}

async function validateLinksInFile(file)
{
	const text = await read(file);

	const links = [];

	text.replaceAll(/<a.+?href="(.+?)".+?>/g, (match, $1) =>
	{
		links.push($1);
	});

	const statuses = await Promise.all(links.map(validateLink));

	for (let i = 0; i < statuses.length; i++)
	{
		if (!statuses[i])
		{
			console.error(`Invalid link in ${file} to ${links[i]}`);
		}
	}
}

async function validateLink(link)
{
	if (link.slice(0, 4) === "http")
	{
		return true;
	}

	link = link.replace(/\?.+$/, "");

	if (link[link.length - 1] === "/")
	{
		link += "index.html";
	}

	const date = await getModifiedDate(link);

	return date != null;
}