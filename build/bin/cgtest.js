#!/usr/bin/env bun

import { Worker } from "worker_threads";
import { getModifiedDate, read } from "../file-io.js";
import { galleryImageData } from "/gallery/scripts/imageData.js";

const { spawnSync } = require("child_process");

const excludeFiles =
[
	"index.html",
	"debug/glsl-docs/index.html",
	"debug/index.html",
	"teaching/uo/342/extra/eigenfaces-demo/index.html",
	"teaching/uo/342/notes/9-singular-value-decompositions/scripts/data.js"
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

const ip = results.en0[0];
const port = 5500;



async function eslint(files)
{
	files.map(lintFile);
}

async function lintFile(file)
{
	const proc = spawnSync("eslint", [
		root + file,
		"--no-warn-ignored",
		"--fix",
		"-c",
		root + "eslint.config.mjs",
	], {
		cwd: root,
	});
	
	const text = proc.stdout.toString();

	if (text)
	{
		console.warn(text);
	}
}



async function validateAllLinks(files)
{
	const links = Array.from(
		new Set(
			(await Promise.all(files.map(getLinksInFile))).flat()
		)
	).concat(
		Object.values(galleryImageData)
			.map(item => `https://drive.google.com/uc?id=${item.driveId}&export=download`)
	);

	const statuses = await Promise.all(links.map(validateLink));

	for (let i = 0; i < statuses.length; i++)
	{
		if (!statuses[i] && !links[i].startsWith("mailto"))
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

		// eslint-disable-next-line no-unused-vars
		catch(_ex)
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
	return new Promise(resolve =>
	{
		const threads = 32;
		const chunkSize = Math.ceil(files.length / threads);
		let workersFinished = 0;

		for (let i = 0; i < threads; i++)
		{
			const fileChunk = files.slice(i * chunkSize, (i + 1) * chunkSize);

			const worker = new Worker(`${root}build/testPagesShard.js`);

			worker.on("message", (message) =>
			{
				if (message[0] === "done")
				{
					workersFinished++;

					if (workersFinished === threads)
					{
						spawnSync("pkill", ["-f", "-i", "\"google chrome for testing\""]);

						resolve();
					}
				}
			});

			worker.on("error", (error) =>
			{
				console.error(`Error in worker: ${error}`);
			});

			worker.postMessage([ip, port, fileChunk]);
		}
	});
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
		.filter(file => !excludeFiles.includes(file));

	const htmlFiles = files.filter(file => file.slice(file.lastIndexOf(".")) === ".html");
	const htmlDataFiles = htmlFiles.filter(file => file.includes("data.html"));
	const htmlIndexFiles = htmlFiles.filter(file => file.includes("index.html"));

	const jsFiles = files.filter(file =>
	{
		return file.slice(file.lastIndexOf(".")) === ".js" && !file.includes(".min.");
	});
		

	console.log("Linting...");
	await eslint(jsFiles);

	console.log("Validating links...");
	await validateAllLinks(htmlDataFiles);

	console.log("Testing pages for console errors...");
	await testPages(htmlIndexFiles);

	process.exit(0);
}

test(options.clean);