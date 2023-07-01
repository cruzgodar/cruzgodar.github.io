import {exec} from "child_process"

const root = process.argv[1].replace(/(\/90259025.github.io\/).+$/, (match, $1) => $1);

export function read(filepath)
{
	return new Promise((resolve, reject) =>
	{
		const fullPath = filepath[0] === "/" ? root + filepath.slice(1) : root + filepath;
		
		exec(`cat ${fullPath}`, (error, stdout, stderr) => resolve(stdout));
	});
}

export function write(filepath, content)
{
	return new Promise((resolve, reject) =>
	{
		const fullPath = filepath[0] === "/" ? root + filepath.slice(1) : root + filepath;
		console.log(`printf "${content}" > ${fullPath}`);
		exec(`printf "${content}" > ${fullPath}`, (error, stdout, stderr) => resolve(stdout));
	});
}