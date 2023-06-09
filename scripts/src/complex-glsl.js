Site.glslFilenames =
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

Site.glslFiles = 
{
	"main":
	{
		dependencies: [],
		
		keywords: []
	},
	
	"constants":
	{
		dependencies: [],
		
		keywords: []
	}
};



Site.splitGlslFile = function(filename, text)
{
	text = text.replaceAll("\r", "");
	
	let startSearchIndex = 0;
	
	while (true)
	{
		const index = text.indexOf("#function", startSearchIndex);
		
		if (index === -1)
		{
			break;
		}
		
		const endIndex = text.indexOf("\n", index + 10);
		
		if (endIndex === -1)
		{
			console.error(`[GLSL bundling] Invalid function name in file ${filename}.frag`);
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
			console.error(`[GLSL bundling] Missing #endfunction in file ${filename}.frag`);
			return;
		}
		
		
		
		Site.glslFiles[keywords[0]] =
		{
			keywords: keywords
		};
		
		
		
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
			
			Site.glslFiles[keywords[0]].dependencies = dependencies;
			
			Site.glslFiles[keywords[0]].content = text.slice(endDependenciesIndex + 1, endFunctionIndex);
		}
		
		else
		{
			Site.glslFiles[keywords[0]].dependencies = [];
			
			Site.glslFiles[keywords[0]].content = text.slice(endIndex + 1, endFunctionIndex);
		}
		
		
		
		startSearchIndex = endFunctionIndex + 13;
	}
};



Site.glslFilesByDepth = [];

Site.loadGlsl = function()
{
	if (Site.scriptsLoaded["glsl"] === 0)
	{
		Site.scriptsLoaded["glsl"] = 1;
		
		return new Promise(async (resolve, reject) =>
		{
			//constants.frag and main.frag are always fetched.
			const response = await fetch("/scripts/glsl/constants.frag");
			
			const text = await response.text();
				
			this.glslFiles["constants"].content = text;
			
			
			
			const response2 = await fetch("/scripts/glsl/main.frag");
			
			const text2 = await response2.text();
				
			this.glslFiles["main"].content = text2;
			
			
			
			const texts = {};
			
			await Promise.all(this.glslFilenames.map(filename => new Promise(async (resolve, reject) =>
			{
				const response = await fetch(`/scripts/glsl/${filename}.frag`);
				
				texts[filename] = await response.text();
				
				resolve();
			})));
			
			this.glslFilenames.forEach(filename => this.splitGlslFile(filename, texts[filename]));
			
			
			
			//Figure out the depth of everything.
			
			const filenames = Object.keys(this.glslFiles);
			
			filenames.forEach(filename => this.glslFiles[filename].parents = []);
			
			filenames.forEach(filename =>
			{
				const dependencies = this.glslFiles[filename].dependencies;
				
				dependencies.forEach(dependency => this.glslFiles[dependency].parents.push(filename));
				
				if (dependencies.length === 0 && filename !== "main")
				{
					this.glslFiles["main"].parents.push(filename);
				}
			});
			
			
			
			let activeNodes = ["main"];
			let depth = 0;
			
			while (activeNodes.length !== 0)
			{
				let nextActiveNodes = [];
				
				Site.glslFilesByDepth.push([]);
				
				activeNodes.forEach(filename =>
				{
					if (typeof this.glslFiles[filename].depth === "undefined")
					{
						this.glslFiles[filename].depth = depth;
					}
					
					else
					{
						this.glslFiles[filename].depth = Math.max(this.glslFiles[filename].depth, depth);
					}
					
					const parents = this.glslFiles[filename].parents;
					
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
			
			
			
			filenames.forEach(filename => Site.glslFilesByDepth[this.glslFiles[filename].depth].push(filename));
			
			
			
			Site.scriptsLoaded["glsl"] = 2;
			
			resolve();
		});
	}
	
	
	
	else if (Site.scriptsLoaded["glsl"] === 1)
	{
		return new Promise((resolve, reject) =>
		{
			const refreshId = setInterval(() =>
			{
				if (Site.scriptsLoaded["glsl"] === 2)
				{
					clearInterval(refreshId);
					
					resolve();
				}
			}, 100);
		});
	}
	
	
	
	else
	{
		return new Promise((resolve, reject) => resolve());
	}
};



//Returns a bundle of all required glsl to handle the given function.
Site.getGlslBundle = function(codeString)
{
	//First, we need to identify the keywords in the provided string.
	const keywords = codeString.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
	
	let bundle = "";
	
	const filenames = Object.keys(this.glslFiles);
	
	let filesToInclude = {};
	
	filenames.forEach(filename => filesToInclude[filename] = false);
	
	//main.frag is always required.
	filesToInclude["main"] = true;
	
	
	
	let debugMessage = "";
	
	function addToBundle(filename, depth)
	{
		if (filesToInclude[filename])
		{
			return;
		}
		
		filesToInclude[filename] = true;
		
		if (DEBUG && depth !== 0)
		{
			debugMessage += "\n                     " + "   ".repeat(depth) + `↳ ${filename}`;
		}
		
		Site.glslFiles[filename].dependencies.forEach(dependency => addToBundle(dependency, depth + 1));
	}
	
	
	
	filenames.forEach(filename =>
	{
		if (filesToInclude[filename])
		{
			return;
		}
		
		keywords.forEach(keyword =>
		{
			if (Site.glslFiles[filename].keywords.indexOf(keyword) !== -1)
			{
				debugMessage = `[GLSL bundling] Adding ${filename}`;
				
				addToBundle(filename, 0);
				
				if (DEBUG)
				{
					console.log(debugMessage);
				}
			}
		});
	});
	
	
	
	//constants.frag and main.glsl are always included.
	bundle = Site.glslFiles["constants"].content + Site.glslFiles["main"].content;
	
	for (let i = 1; i < Site.glslFilesByDepth.length; i++)
	{
		Site.glslFilesByDepth[i].forEach(filename =>
		{
			if (filesToInclude[filename])
			{
				bundle += Site.glslFiles[filename].content;
			}
		});
	}
	
	
	
	return bundle;
}