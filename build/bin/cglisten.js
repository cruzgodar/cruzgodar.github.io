#!/usr/bin/env bun

import { spawnSync } from "child_process";
import { watch } from "fs";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

let debounceTimer = null;
let lastRun = 0;

function runBuild()
{
	const now = Date.now();
	
	if (now - lastRun < 3000)
	{
		return;
	}
	
	lastRun = now;
	console.clear();
	spawnSync("bun", [root + "build/bin/cgbuild.js"], { stdio: "inherit" });
}

function debouncedBuild()
{
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(runBuild, 300);
}

function listenToChanges()
{
	watch(
		root,
		{ recursive: true },
		(eventType, filename) =>
		{
			if (filename && isValidFile(filename))
			{
				debouncedBuild();
			}
		}
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
	const index = end.lastIndexOf(".");

	if (index <= 0)
	{
		return false;
	}

	const extension = end.slice(index + 1);

	return extension === "htmdl" || extension === "js" || extension === "css";
}

listenToChanges();