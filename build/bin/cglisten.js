#!/usr/bin/env bun

import { spawnSync } from "child_process";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);



function listenToChanges()
{
	const proc1 = spawnSync("find", [
		root,
		"-name",
		"index.htmdl",
	]);

	const proc2 = spawnSync("find", [
		root,
		"-name",
		"*.js",
	]);

	const proc3 = spawnSync("find", [
		root,
		"-name",
		"*.js",
	]);

	const proc4 = spawnSync("find", [
		root,
		"-name",
		"*.css",
	]);

	const files = (
		proc1.stdout.toString()
		+ "\n" + proc2.stdout.toString()
		+ "\n" + proc3.stdout.toString()
		+ "\n" + proc4.stdout.toString()
	)
		.split("\n")
		.filter(file => isValidFile(file))
		.join("\n");

	spawnSync(
		"entr",
		["-c", "bun", root + "build/build.js"],
		{ input: files, stdio: "inherit" }
	);
}

function isValidFile(file)
{
	if (!file || file.indexOf(".") === -1)
	{
		return false;
	}

	const lastSlashIndex = file.lastIndexOf("/") + 1;
	const end = file.slice(lastSlashIndex);
	const index = end.indexOf(".");

	if (index <= 0)
	{
		return;
	}

	const filename = end.slice(0, index);
	const extension = end.slice(index + 1);

	if (
		(extension === "htmdl" && filename === "index")

		|| extension === "js"
		|| extension === "css"
	) {
		return true;
	}

	return false;
}

listenToChanges();