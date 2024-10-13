import { spawn } from "child_process";
import { read } from "./file-io.js";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

export async function makeGalleryImage(file)
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
		spawn("cwebp", [
			root + file,
			"-q",
			"85",
			"-resize",
			"2000",
			"2000",
			"-mt",
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
			"-o",
			`${root}gallery/thumbnails/${filename}.webp`,
		])
	]);
}