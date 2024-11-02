"use strict";

import { launch } from "puppeteer";

onmessage = async function(e)
{
	const [ip, port, fileChunk] = e.data;
	await testFiles(ip, port, fileChunk);
	postMessage(["done"]);
	process.exit(0);
};

async function testFiles(ip, port, files)
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

		console.error(`Error in ${currentFile}: ${e.text()}`);
	});

	for (let i = 0; i < files.length; i++)
	{
		const file = files[i];
		currentFile = file;

		
		postMessage(["progress"]);
		await page.goto(`http://${ip}:${port}/${file}`);
		await new Promise(resolve => setTimeout(resolve, 4000));
	}

	await page.close();
	await browser.close();
}