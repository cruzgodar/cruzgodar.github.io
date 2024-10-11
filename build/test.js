import { launch } from "puppeteer";
import { getModifiedDate, read, write } from "./file-io.js";
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
	const browser = await launch({ headless: true });
	const page = await browser.newPage();

	let currentFile = "";

	page.on("console", async (e) =>
	{
		if (e.type() === "log")
		{
			return;
		}

		if (e.type() === "error")
		{
			console.error(`Error in ${currentFile}: ${e.text()}`);
			return;
		}

		console.warn(`Error in ${currentFile}: ${e.text()}`);
	});

	for (const file of files)
	{
		currentFile = file;
		console.log(`Testing ${file}...`);
		await page.goto(`http://${ip}:${port}/${file}`);
		await new Promise(resolve => setTimeout(resolve, 1000));
	}

	await page.close();
	await browser.close();
}



const latexFiles = {
	"teaching/uo/256/": [
		"#download-homework-1-button",
		"#download-homework-2-button",
		"#download-homework-3-button",
		"#download-homework-4-button",
		"#download-homework-5-button",
		"#download-homework-6-button",
		"#download-homework-7-button",
		"#download-homework-8-button",
		"#download-homework-9-button",
	],

	"teaching/uo/341/": [
		"#download-homework-1-button",
		"#download-homework-2-button",
		"#download-homework-3-button",
		"#download-homework-4-button",
		"#download-homework-5-button",
		"#download-homework-6-button",
		"#download-homework-7-button",
		"#download-homework-8-button",
		"#download-homework-9-button",
	],

	"teaching/uo/342/": [
		"#download-homework-1-button",
		"#download-homework-2-button",
		"#download-homework-3-button",
		"#download-homework-4-button",
		"#download-homework-5-button",
		"#download-homework-6-button",
		"#download-homework-7-button",
		"#download-homework-8-button",
	],
};

const texDirectory = ".cgTexTesting";

function testLatex(tex)
{
	const homeworkTitle = tex.match(/(Homework .+? Math .+?)\s/)[1];
	console.log(`Compiling ${homeworkTitle}...`);

	const filename = Math.random().toString(36).slice(2);
	write(`${texDirectory}/${filename}.tex`, tex);

	const proc = spawnSync(
		"pdflatex",
		["-interaction=nonstopmode", "-halt-on-error", `${root}/${texDirectory}/${filename}.tex`],
		{
			stdio: "pipe",
			cwd: `${root}/${texDirectory}`
		}
	);

	if (proc.stdout.toString().toLowerCase().includes("error"))
	{
		console.error(`Error in compiling tex: ${proc.stdout.toString()}`);
	}
}

async function testAllLatex(files)
{
	spawnSync("mkdir", ["-p", `${root}/${texDirectory}`]);

	const browser = await launch({ headless: true });
	const page = await browser.newPage();

	const texSources = [];

	page.on("console", async (e) =>
	{
		const args = await Promise.all(e.args().map(a => a.jsonValue()));
		const text = args.join(" ");

		if (text.includes("\\documentclass{article}"))
		{
			texSources.push(text);
		}
	});

	for (const file of files)
	{
		const buttons = latexFiles[file];

		await page.goto(`http://${ip}:${port}/${file}?debug=1`);
		
		for (const button of buttons)
		{
			await new Promise(resolve =>
			{
				setTimeout(async () =>
				{
					console.log(`Downloading tex from ${button} in ${file}...`);

					await page.evaluate((button) =>
					{
						document.querySelector(button).click();
					}, button);

					resolve();
				}, 150);
			});
		}
	}
	
	await page.close();
	await browser.close();

	for (const tex of texSources)
	{
		testLatex(tex);
	}

	spawnSync("rm", ["-rf", `${root}/${texDirectory}`]);
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

	const latexDataFiles = htmlDataFiles
		.map(file => file.replace("data.html", ""))
		.filter(file => latexFiles[file]);

	const jsFiles = files.filter(file =>
	{
		return file.slice(file.lastIndexOf(".")) === ".js" && !file.includes(".min.");
	});
		

	console.log("Linting...");
	await eslint(jsFiles);

	console.log("Validating links...");
	await validateAllLinks(htmlDataFiles);

	console.log("Testing pages for console errors...");
	await testPages(files.filter(htmlIndexFiles));

	console.log("Testing LaTeX...");
	await testAllLatex(latexDataFiles);
}

test(options.clean);