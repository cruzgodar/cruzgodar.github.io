import { spawnSync } from "child_process";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);



async function listenToChanges()
{
	const proc = spawnSync("git", [
		"-C",
		root,
		"ls-files",
	]);

	const files = proc.stdout
		.toString()
		.split("\n")
		.filter(file => isValidFile(file))
		.map(file => root + file)
		.join("\n");

	const proc2 = spawnSync(
		"entr",
		["node", root + "build/build.mjs"],
		{ input: files }
	);

	console.log(proc2.stdout.toString());
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
		|| extension === "mjs"
		|| extension === "js"
		|| extension === "css"
	)
	{
		return true;
	}

	return false;
}

listenToChanges();