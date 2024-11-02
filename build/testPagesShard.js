"use strict";

import { launch } from "puppeteer";

const ignorePatterns = [
	// eslint-disable-next-line max-len
	/A preload for .+? is found, but is not used because the request credentials mode does not match\. Consider taking a look at crossorigin attribute\./,
	// eslint-disable-next-line max-len
	/The resource .+? was preloaded using link preload but not used within a few seconds from the window's load event\. Please make sure it has an appropriate `as` value and it is preloaded intentionally\./,
	// eslint-disable-next-line max-len
	/Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true\. See: https:\/\/html.spec.whatwg.org\/multipage\/canvas.html#concept-canvas-will-read-frequently/
];

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

		for (const pattern of ignorePatterns)
		{
			if (pattern.test(e.text()))
			{
				return;
			}
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