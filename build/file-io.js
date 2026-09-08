import fs from "fs";

const root = process.argv[1].replace(/(\/cruzgodar.github.io\/).+$/, (match, $1) => $1);

export async function read(filepath)
{
	return new Promise(resolve =>
	{
		const fullPath = filepath[0] === "/" ? root + filepath.slice(1) : root + filepath;

		fs.readFile(fullPath, "utf8", (err, data) =>
		{
			if (!err && data)
			{
				resolve(data);
			}
			
			resolve(null);
		});
	});
}

export async function getModifiedDate(filepath)
{
	const fullPath = filepath[0] === "/" ? root + filepath.slice(1) : root + filepath;
	
	return new Promise(resolve =>
	{
		fs.stat(fullPath, "utf8", (err, data) =>
		{
			if (!err && data)
			{
				resolve(data.mtime ?? data.ctime);
			}

			resolve(null);
		});
	});
}

export function write(filepath, content)
{
	const fullPath = filepath[0] === "/" ? root + filepath.slice(1) : root + filepath;

	// fs.writeFile truncates before it writes, so writing straight to fullPath
	// leaves a window where the dev server can hand the browser an empty or
	// half-written file. Write a scratch file alongside it and rename it into
	// place instead -- rename within a directory is atomic, so a reader sees
	// either the old file or the new one and never something in between.
	const scratchPath =
		`${fullPath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;

	return new Promise(resolve =>
	{
		fs.writeFile(scratchPath, content, writeErr =>
		{
			if (writeErr)
			{
				console.error(writeErr);

				resolve();

				return;
			}

			fs.rename(scratchPath, fullPath, renameErr =>
			{
				if (renameErr)
				{
					console.error(renameErr);

					fs.unlink(scratchPath, () => {});
				}

				resolve();
			});
		});
	});
}

export function copy(sourcePath, targetPath)
{
	const fullSourcePath = sourcePath[0] === "/" ? root + sourcePath.slice(1) : root + sourcePath;
	const fullTargetPath = targetPath[0] === "/" ? root + targetPath.slice(1) : root + targetPath;

	fs.copyFile(fullSourcePath, fullTargetPath, err =>
	{
		if (err)
		{
			console.error(err);
		}
	});
}