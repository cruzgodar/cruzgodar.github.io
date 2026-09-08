#!/usr/bin/env bun

import { spawn, spawnSync } from "child_process";
import { statSync } from "fs";
import { getModifiedDate, read } from "../file-io.js";
import { galleryFullResTag, galleryImageData } from "/gallery/scripts/imageData.js";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

const repo = "cruzgodar/cruzgodar.github.io";

const options =
{
	reupload: process.argv.slice(2).includes("-u"),
};

function gh(args, stdio)
{
	const proc = spawnSync("gh", args, stdio ? { stdio } : undefined);

	if (proc.error)
	{
		throw new Error(
			"Could not run gh --- install it with `brew install gh` and run `gh auth login`."
		);
	}

	return proc;
}

// child_process.spawn returns a ChildProcess, not a promise --- awaiting one
// directly resolves immediately, so wrap it up properly.
function run(command, args)
{
	return new Promise((resolve, reject) =>
	{
		const proc = spawn(command, args);

		let stdout = "";
		let stderr = "";

		proc.stdout.on("data", data => stdout += data.toString());
		proc.stderr.on("data", data => stderr += data.toString());

		proc.on("error", error => reject(
			new Error(`Could not run ${command} --- is it installed? (${error.message})`)
		));

		proc.on("close", status => status === 0
			? resolve(stdout)
			: reject(new Error(`${command} failed: ${stderr}`))
		);
	});
}

// Returns a map from asset name to size in bytes, or null if the release
// doesn't exist yet.
function getReleaseAssets()
{
	const proc = gh([
		"release",
		"view",
		galleryFullResTag,
		"-R",
		repo,
		"--json",
		"assets"
	]);

	if (proc.status !== 0)
	{
		const message = proc.stderr.toString();

		if (message.includes("release not found"))
		{
			return null;
		}

		throw new Error(`Could not read the ${galleryFullResTag} release: ${message}`);
	}

	return new Map(
		JSON.parse(proc.stdout.toString()).assets.map(asset => [asset.name, asset.size])
	);
}

function createRelease()
{
	console.log(`Creating the ${galleryFullResTag} release...`);

	const proc = gh([
		"release",
		"create",
		galleryFullResTag,
		"-R",
		repo,
		"--title",
		"Gallery Full-Res Images",
		"--notes",
		// eslint-disable-next-line max-len
		"Full-resolution originals of the images at https://cruzgodar.com/gallery. Uploaded automatically by cggallery.",
		"--latest=false"
	]);

	if (proc.status !== 0)
	{
		throw new Error(`Could not create the release: ${proc.stderr.toString()}`);
	}
}

// Uploads every full-res image that isn't on the release yet, or whose size
// doesn't match the copy that is --- sizes are a good enough check for pngs,
// but -u forces everything to be re-uploaded.
function uploadFullRes(files)
{
	let assets = getReleaseAssets();

	if (assets === null)
	{
		createRelease();

		assets = new Map();
	}

	const sizes = new Map(
		files.map(file => [file, statSync(`${root}gallery/full-res/${file}`).size])
	);

	const toUpload = files.filter(
		file => options.reupload || assets.get(file) !== sizes.get(file)
	);

	if (!toUpload.length)
	{
		console.log("All full-res images are up to date.");

		return assets;
	}

	const totalSize = toUpload.reduce((total, file) => total + sizes.get(file), 0);

	console.log(
		`Uploading ${toUpload.length} full-res image(s), `
			+ `${(totalSize / 1e6).toFixed(0)}MB...`
	);

	const proc = gh([
		"release",
		"upload",
		galleryFullResTag,
		"-R",
		repo,
		...toUpload.map(file => `${root}gallery/full-res/${file}`),
		"--clobber"
	], "inherit");

	if (proc.status !== 0)
	{
		throw new Error("Could not upload the full-res images");
	}

	for (const file of toUpload)
	{
		assets.set(file, sizes.get(file));
	}

	return assets;
}

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

	await Promise.all([
		run("cwebp", [
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

		run("cwebp", [
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
	]);

	// Has to happen after the cwebp calls finish, or it reads the last run's
	// thumbnail and reports stale results.
	const stdout = await run("identify", [
		"-verbose",
		`${root}gallery/thumbnails/${filename}.webp`,
	]);

	const profileLine = stdout.match(/icc:description:\s(.+)/);
	const profile = profileLine ? profileLine[1].trim() : null;

	console.log(filename);

	if (!profile)
	{
		console.error(`${filename} has no color profile`);

		return false;
	}

	if (!profile.includes("P3"))
	{
		console.error(`${filename} is not P3 (${profile})`);

		return false;
	}

	return true;
}

async function testImageData(files, assets)
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

		if (!assets.has(`${key}.png`))
		{
			console.error(`${key} has no full-res --- add it to gallery/full-res and rerun`);
		}
	}
}
export async function buildGallery()
{
	const proc = spawnSync("ls", [], { cwd: `${root}gallery/full-res/` });

	const files = proc.stdout.toString().split("\n").filter(file => file);

	const results = await Promise.all(
		files.map(file => makeGalleryImage(`gallery/full-res/${file}`))
	);

	// Nothing gets uploaded if any image isn't P3 --- otherwise the release ends
	// up holding originals that need to be re-rendered and re-uploaded anyway.
	if (results.includes(false))
	{
		const numBad = results.filter(result => !result).length;

		throw new Error(
			`${numBad} image(s) aren't P3 (listed above) --- nothing was uploaded. `
				+ "Re-render them in P3 and rerun."
		);
	}

	const assets = uploadFullRes(files);

	await testImageData(files, assets);
}

buildGallery();