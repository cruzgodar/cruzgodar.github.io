#!/usr/bin/env bun

import { spawn, spawnSync } from "child_process";
import { getModifiedDate, read } from "../file-io.js";
import { galleryImageData } from "/gallery/scripts/imageData.js";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

async function makeGalleryImage(file)
{
	const filename = file.slice(file.lastIndexOf("/") + 1, file.lastIndexOf("."));

	const htmdl = await read("gallery/index.htmdl");
	const regex = new RegExp(`\\b${filename}\\b\\s(\\d+)`);
	const match = htmdl.match(regex);
	const size = match ? parseInt(match[1]) : null;
	if (size === null)
	{
		throw new Error(`Could not find ${filename} in gallery/index.htmdl`);
	}

	const [, , proc] = await Promise.all([
		spawn("cwebp", [
			root + file,
			"-q",
			"85",
			"-resize",
			"2000",
			"2000",
			"-mt",
			"-metadata",
			"all",
			"-o",
			`${root}gallery/high-res/${filename}.webp`,
		]),

		spawn("cwebp", [
			root + file,
			"-q",
			"85",
			"-resize",
			`${size * 500}`,
			`${size * 500}`,
			"-mt",
			"-metadata",
			"all",
			"-o",
			`${root}gallery/thumbnails/${filename}.webp`,
		]),

		spawn("identify", [
			"-verbose",
			`${root}gallery/thumbnails/${filename}.webp`,
		])
	]);

	proc.stdout.on("data", data =>
	{
		const profileLine = data.toString().match(/icc:description:\s(.+)/);
	
		if (profileLine && !(profileLine[1].includes("P3")))
		{
			console.error(`${filename} is not P3`);
		}
	});

	console.log(filename);
}

async function testImageData(files)
{
	for (const key of files)
	{
		const file = key.slice(0, key.lastIndexOf("."));

		if (!(file in galleryImageData))
		{
			console.error(`${file} is not in imageData.js`);
			continue;
		}

		const imageData = galleryImageData[file];

		if (!imageData.title)
		{
			console.error(`${file} has no title`);
		}

		if (!imageData.appletLink)
		{
			console.error(`${file} has no appletLink`);
		}

		if (!imageData.driveId)
		{
			console.error(`${file} has no driveId`);
		}

		let appletLink = imageData.appletLink.slice(1);
		if (appletLink.indexOf("?") !== -1)
		{
			appletLink = appletLink.slice(0, appletLink.indexOf("?") - 1);
		}

		const applet = await getModifiedDate(`${appletLink}/index.htmdl`);
		if (!applet)
		{
			console.error(`${file} has an invalid applet link`);
		}
	}

	for (const key of Object.keys(galleryImageData))
	{
		const thumbnail = await getModifiedDate(`gallery/thumbnails/${key}.webp`);
		if (!thumbnail)
		{
			console.error(`${key} has no thumbnail`);
		}

		const highRes = await getModifiedDate(`gallery/high-res/${key}.webp`);
		if (!highRes)
		{
			console.error(`${key} has no high-res`);
		}
	}
}
export async function buildGallery()
{
	const proc = spawnSync("ls", [], { cwd: `${root}gallery/full-res/` });

	const files = proc.stdout.toString().split("\n").filter(file => file);

	await Promise.all(
		files.map(file => makeGalleryImage(`gallery/full-res/${file}`))
	);

	await testImageData(files);
}

buildGallery();