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

export function write(filepath, content)
{
	const fullPath = filepath[0] === "/" ? root + filepath.slice(1) : root + filepath;

	fs.writeFile(fullPath, content, err =>
	{
		if (err)
		{
			console.error(err);
		}
	});
}