import { launch } from "puppeteer";
import { getModifiedDate, read } from "./file-io.js";

const { spawnSync } = require("child_process");

const excludeFiles =
[
	"debug/glsl-docs/index.html",
	"debug/index.html",
	"teaching/uo/342/extra/eigenfaces-demo/index.html",
];

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const options =
{
	clean: process.argv.slice(2).includes("-c"),
};



// Get the IP address for Puppeteer.
const { networkInterfaces } = require("os");
const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets))
{
	for (const net of nets[name])
	{
		const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;

		if (net.family === familyV4Value && !net.internal) {
			if (!results[name]) {
				results[name] = [];
			}
			results[name].push(net.address);
		}
	}
}

const ip = results["en0"][0];

export async function validateAllLinks(files)
{
	const links = Array.from(
		new Set(
			(await Promise.all(files.map(getLinksInFile))).flat()
		)
	);

	const statuses = await Promise.all(links.map(validateLink));

	for (let i = 0; i < statuses.length; i++)
	{
		if (!statuses[i])
		{
			console.error(`Invalid link: ${links[i]}`);
		}
	}
}

async function getLinksInFile(file)
{
	const text = await read(file);

	const links = [];

	text.replaceAll(/<a.+?href="(.+?)".+?>/g, (match, $1) =>
	{
		links.push($1);
	});

	return links;
}

async function validateLink(link)
{
	if (link.slice(0, 5) === "https")
	{
		const response = await fetch(link);

		return response.status === 200;
	}

	if (link.slice(0, 4) === "http")
	{
		try
		{
			const httpsResponse = await fetch(link.replace(/^http/, "https"));

			if (httpsResponse.status === 200)
			{
				console.warn(`Link should use https: ${link}`);
				return true;
			}
		}

		catch(ex)
		{
			// Link cannot use https.
		}

		const response = await fetch(link);

		return response.status === 200;
	}



	link = link.replace(/\?.+$/, "");

	if (link[link.length - 1] === "/")
	{
		link += "index.html";
	}

	const date = await getModifiedDate(link);

	return date != null;
}



async function testPages(files)
{
	const browser = await launch({ headless: true });
	const page = await browser.newPage();

	let currentFile = "";

	page.on("console", async (e) =>
	{
		if (e.type() === "log")
		{
			return;
		}

		const args = await Promise.all(e.args().map(a => a.jsonValue()));
		console.error(`Error in ${currentFile}: ${args.join(" ")}`);
	});

	for (const file of files)
	{
		currentFile = file;
		await page.goto(`http://${ip}:5500/${file}`);
	}

	await page.close();
	await browser.close();
}



async function test(clean)
{
	const proc = spawnSync("git", [
		"-C",
		root,
		"ls-files",
		...(clean ? [] : ["-m", "-o"])
	]);

	const files = proc.stdout.toString()
		.split("\n")
		.filter(file => file.slice(file.lastIndexOf(".")) === ".html")
		.filter(file => !excludeFiles.includes(file));

	await Promise.all([
		validateAllLinks(files.filter(file => file.includes("data.html"))),
		testPages(files.filter(file => file.includes("index.html"))),
	]);
}

test(options.clean);