"use strict";

const root = process.argv[1].replace(/(\/90259025.github.io\/).+$/, (match, $1) => $1);

const modifiedFiles = process.argv.slice(2);

modifiedFiles.forEach(file =>
{
	const filename = file.slice(file.lastIndexOf("/") + 1)
	console.log(filename)
});