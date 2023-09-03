const glslFilenames =
[
	"equality",
	"powers",
	"trig",
	"combinatorics",
	"number-theory",
	"gamma",
	"hypergeometric",
	"su3_character",
	"lambert_w",
	"hurwitz_zeta",
	"zeta"
];

const glslFiles =
{
	main:
	{
		dependencies: [],

		keywords: []
	},

	constants:
	{
		dependencies: [],

		keywords: []
	}
};

export let doubleEmulationGlsl = null;
export let doubleEncodingGlsl = null;

function splitGlslFile(filename, text)
{
	text = text.replaceAll("\r", "");

	let startSearchIndex = 0;

	for (;;)
	{
		const index = text.indexOf("#function", startSearchIndex);

		if (index === -1)
		{
			break;
		}

		const endIndex = text.indexOf("\n", index + 10);

		if (endIndex === -1)
		{
			console.error(`[GLSL bundling] Invalid function name in file ${filename}`);
			return;
		}

		let keywords = text.slice(index + 10, endIndex).split(" ");

		keywords = keywords.map(keyword => keyword.replaceAll(" ", ""));

		for (let i = 0; i < keywords.length; i++)
		{
			if (keywords[i] === "")
			{
				keywords.splice(i, 1);
				i--;
			}
		}



		const endFunctionIndex = text.indexOf("#endfunction", endIndex + 1);

		if (endFunctionIndex === -1)
		{
			console.error(`[GLSL bundling] Missing #endfunction in file ${filename}`);
			return;
		}



		glslFiles[keywords[0]] = { keywords };



		const dependenciesIndex = text.indexOf("#requires", index);

		if (dependenciesIndex !== -1 && dependenciesIndex < endFunctionIndex)
		{
			const endDependenciesIndex = text.indexOf("\n", dependenciesIndex + 10);

			let dependencies = text.slice(dependenciesIndex + 10, endDependenciesIndex).split(" ");

			dependencies = dependencies.map(dependency => dependency.replaceAll(" ", ""));

			for (let i = 0; i < dependencies.length; i++)
			{
				if (dependencies[i] === "")
				{
					dependencies.splice(i, 1);
					i--;
				}
			}

			glslFiles[keywords[0]].dependencies = dependencies;

			glslFiles[keywords[0]].content = text.slice(endDependenciesIndex + 1, endFunctionIndex);
		}

		else
		{
			glslFiles[keywords[0]].dependencies = [];

			glslFiles[keywords[0]].content = text.slice(endIndex + 1, endFunctionIndex);
		}



		startSearchIndex = endFunctionIndex + 13;
	}
}



const glslFilesByDepth = [];

let loadedGlsl = false;

let loadGlslPromise;

export async function loadGlsl()
{
	if (loadedGlsl)
	{
		return;
	}

	//If it's in the process of loading, return a promise that will resolve when it's done.
	if (!loadedGlsl && loadGlslPromise)
	{
		return loadGlslPromise;
	}

	loadGlslPromise = loadGlslLogic();

	return loadGlslPromise;
}

async function loadGlslLogic()
{
	//constants and main are always fetched.
	const response = await fetch("/scripts/glsl/constants");

	const text = await response.text();

	glslFiles.constants.content = text;



	const response2 = await fetch("/scripts/glsl/main");

	const text2 = await response2.text();

	glslFiles.main.content = text2;



	const response3 = await fetch("/scripts/glsl/double_emulation");

	const text3 = await response3.text();

	doubleEmulationGlsl = text3;



	const response4 = await fetch("/scripts/glsl/double_encoding");

	const text4 = await response4.text();

	doubleEncodingGlsl = text4;



	const texts = {};

	await Promise.all(glslFilenames.map(filename =>
	{
		return new Promise(resolve =>
		{
			fetch(`/scripts/glsl/${filename}`)
				.then(response => response.text())
				.then(text =>
				{
					texts[filename] = text;

					resolve();
				});
		});
	}));

	glslFilenames.forEach(filename => splitGlslFile(filename, texts[filename]));



	//Figure out the depth of everything.

	const filenames = Object.keys(glslFiles);

	filenames.forEach(filename => glslFiles[filename].parents = []);

	filenames.forEach(filename =>
	{
		const dependencies = glslFiles[filename].dependencies;

		dependencies.forEach(dependency => glslFiles[dependency].parents.push(filename));

		if (dependencies.length === 0 && filename !== "main")
		{
			glslFiles["main"].parents.push(filename);
		}
	});



	let activeNodes = ["main"];
	let depth = 0;

	while (activeNodes.length !== 0)
	{
		const nextActiveNodes = [];

		glslFilesByDepth.push([]);

		activeNodes.forEach(filename =>
		{
			if (glslFiles[filename].depth === undefined)
			{
				glslFiles[filename].depth = depth;
			}

			else
			{
				glslFiles[filename].depth = Math.max(glslFiles[filename].depth, depth);
			}

			const parents = glslFiles[filename].parents;

			parents.forEach(parent =>
			{
				if (!nextActiveNodes.includes(parent))
				{
					nextActiveNodes.push(parent);
				}
			});
		});

		depth++;
		activeNodes = nextActiveNodes;
	}



	filenames.forEach(filename => glslFilesByDepth[glslFiles[filename].depth].push(filename));



	loadedGlsl = true;
}



//Returns a bundle of all required glsl to handle the given function.
export function getGlslBundle(codeString)
{
	//First, we need to identify the keywords in the provided string.
	const keywords = codeString.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);

	let bundle = "";

	const filenames = Object.keys(glslFiles);

	const filesToInclude = {};

	filenames.forEach(filename => filesToInclude[filename] = false);

	//main is always required.
	filesToInclude["main"] = true;



	let debugMessage = "";

	function addToBundle(filename, depth)
	{
		if (filesToInclude[filename])
		{
			return;
		}

		filesToInclude[filename] = true;

		if (depth !== 0)
		{
			debugMessage += "\n                     " + "   ".repeat(depth) + `↳ ${filename}`;
		}

		glslFiles[filename].dependencies.forEach(dependency => addToBundle(dependency, depth + 1));
	}

	filenames.forEach(filename =>
	{
		if (filesToInclude[filename])
		{
			return;
		}

		keywords.forEach(keyword =>
		{
			if (glslFiles[filename].keywords.indexOf(keyword) !== -1)
			{
				debugMessage = `[GLSL bundling] Adding ${filename}`;

				addToBundle(filename, 0);

				console.log(debugMessage);
			}
		});
	});



	//constants and main are always included.
	bundle = glslFiles["constants"].content + glslFiles["main"].content;

	for (let i = 1; i < glslFilesByDepth.length; i++)
	{
		glslFilesByDepth[i].forEach(filename =>
		{
			if (filesToInclude[filename])
			{
				bundle += glslFiles[filename].content;
			}
		});
	}



	return bundle;
}