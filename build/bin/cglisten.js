#!/usr/bin/env bun

import { spawnSync } from "child_process";
import { watch } from "fs";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

let debounceTimer = null;
let building = false;
let buildQueued = false;
let ignoreUntil = 0;

function runBuild()
{
	if (building)
	{
		buildQueued = true;
		return;
	}

	building = true;
	console.clear();
	spawnSync("bun", [root + "build/bin/cgbuild.js"], { stdio: "inherit" });
	building = false;

	// After a build finishes, the OS may still deliver fs.watch events
	// for files written during the build (e.g. git checkout restoring
	// .js/.css files). Ignore events for a short window so those
	// don't trigger another build cycle.
	ignoreUntil = Date.now() + 1000;

	if (buildQueued)
	{
		buildQueued = false;
		debounceTimer = setTimeout(runBuild, 1000);
	}
}

function debouncedBuild()
{
	if (building)
	{
		buildQueued = true;
		return;
	}

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
			if (Date.now() < ignoreUntil)
			{
				return;
			}

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

	if (extension !== "htmdl" && extension !== "js" && extension !== "css")
	{
		return false;
	}

	// Exclude build output files so that cgbuild writing .min.js/.min.css
	// doesn't trigger another build cycle.
	const filename = end.slice(0, index);

	if (filename.endsWith(".min"))
	{
		return false;
	}

	return true;
}

listenToChanges();
