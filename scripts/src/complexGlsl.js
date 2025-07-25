import { asyncFetch } from "./utils.js";

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

	// If it's in the process of loading, return a promise that will resolve when it's done.
	if (!loadedGlsl && loadGlslPromise)
	{
		return loadGlslPromise;
	}

	loadGlslPromise = loadGlslLogic();

	return loadGlslPromise;
}

async function loadGlslLogic()
{
	// constants and main are always fetched.
	[
		glslFiles.constants.content,
		glslFiles.main.content,
	] = await Promise.all([
		asyncFetch("/scripts/glsl/constants"),
		asyncFetch("/scripts/glsl/main"),
	]);

	

	const texts = {};

	await Promise.all(glslFilenames.map(filename =>
	{
		return new Promise(resolve =>
		{
			asyncFetch(`/scripts/glsl/${filename}`)
				.then(text =>
				{
					texts[filename] = text;

					resolve();
				});
		});
	}));

	for (const filename of glslFilenames)
	{
		splitGlslFile(filename, texts[filename]);
	}

	

	// Figure out the depth of everything.

	const filenames = Object.keys(glslFiles);

	for (const filename of filenames)
	{
		glslFiles[filename].parents = [];
	}

	for (const filename of filenames)
	{
		const dependencies = glslFiles[filename].dependencies;

		for (const dependency of dependencies)
		{
			glslFiles[dependency].parents.push(filename);
		}

		if (dependencies.length === 0 && filename !== "main")
		{
			glslFiles.main.parents.push(filename);
		}
	}



	let activeNodes = ["main"];
	let depth = 0;

	while (activeNodes.length !== 0)
	{
		const nextActiveNodes = [];

		glslFilesByDepth.push([]);

		for (const filename of activeNodes)
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

			for (const parent of parents)
			{
				if (!nextActiveNodes.includes(parent))
				{
					nextActiveNodes.push(parent);
				}
			}
		}

		depth++;
		activeNodes = nextActiveNodes;
	}



	for (const filename of filenames)
	{
		glslFilesByDepth[glslFiles[filename].depth].push(filename);
	}



	loadedGlsl = true;
}



// Returns a bundle of all required glsl to handle the given function.
export function getGlslBundle(codeString)
{
	// First, we need to identify the keywords in the provided string.
	const keywords = codeString.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);

	if (!keywords)
	{
		return "";
	}

	let bundle = "";

	const filenames = Object.keys(glslFiles);

	const filesToInclude = {};

	for (const filename of filenames)
	{
		filesToInclude[filename] = false;
	}

	// main is always required.
	filesToInclude.main = true;



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

		for (const dependency of glslFiles[filename].dependencies)
		{
			addToBundle(dependency, depth + 1);
		}
	}

	for (const filename of filenames)
	{
		if (filesToInclude[filename])
		{
			continue;
		}

		for (const keyword of keywords)
		{
			if (glslFiles[filename].keywords.indexOf(keyword) !== -1)
			{
				debugMessage = `[GLSL bundling] Adding ${filename}`;

				addToBundle(filename, 0);

				console.log(debugMessage);
			}
		}
	}



	// constants and main are always included.
	bundle = glslFiles.constants.content + glslFiles.main.content;

	for (let i = 1; i < glslFilesByDepth.length; i++)
	{
		for (const filename of glslFilesByDepth[i])
		{
			if (filesToInclude[filename])
			{
				bundle += glslFiles[filename].content;
			}
		}
	}



	return bundle;
}