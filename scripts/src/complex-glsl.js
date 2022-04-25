Site.glsl_filenames =
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

Site.glsl_files = 
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



Site.split_glsl_file = function(filename, text)
{
	text = text.replaceAll("\r", "");
	
	let start_search_index = 0;
	
	while (true)
	{
		let index = text.indexOf("#function", start_search_index);
		
		if (index === -1)
		{
			break;
		}
		
		let end_index = text.indexOf("\n", index + 10);
		
		if (end_index === -1)
		{
			console.error(`[GLSL bundling] Invalid function name in file ${filename}.frag`);
			return;
		}
		
		let keywords = text.slice(index + 10, end_index).split(" ");
		
		keywords = keywords.map(keyword => keyword.replaceAll(" ", ""));
		
		for (let i = 0; i < keywords.length; i++)
		{
			if (keywords[i] === "")
			{
				keywords.splice(i, 1);
				i--;
			}
		}
		
		
		
		const end_function_index = text.indexOf("#endfunction", end_index + 1);
		
		if (end_function_index === -1)
		{
			console.error(`[GLSL bundling] Missing #endfunction in file ${filename}.frag`);
			return;
		}
		
		
		
		Site.glsl_files[keywords[0]] =
		{
			keywords: keywords
		};
		
		
		
		const dependencies_index = text.indexOf("#requires", index);
		
		if (dependencies_index !== -1 && dependencies_index < end_function_index)
		{
			const end_dependencies_index = text.indexOf("\n", dependencies_index + 10);
			
			let dependencies = text.slice(dependencies_index + 10, end_dependencies_index).split(" ");
			
			dependencies = dependencies.map(dependency => dependency.replaceAll(" ", ""));
			
			for (let i = 0; i < dependencies.length; i++)
			{
				if (dependencies[i] === "")
				{
					dependencies.splice(i, 1);
					i--;
				}
			}
			
			Site.glsl_files[keywords[0]].dependencies = dependencies;
			
			Site.glsl_files[keywords[0]].content = text.slice(end_dependencies_index + 1, end_function_index);
		}
		
		else
		{
			Site.glsl_files[keywords[0]].dependencies = [];
			
			Site.glsl_files[keywords[0]].content = text.slice(end_index + 1, end_function_index);
		}
		
		
		
		start_search_index = end_function_index + 13;
	}
};



Site.glsl_files_by_depth = [];

Site.load_glsl = function()
{
	if (Site.scripts_loaded["glsl"] === 0)
	{
		Site.scripts_loaded["glsl"] = 1;
		
		return new Promise(async (resolve, reject) =>
		{
			//constants.frag and main.frag are always fetched.
			const response = await fetch("/scripts/glsl/constants.frag");
			
			const text = await response.text();
				
			this.glsl_files["constants"].content = text;
			
			
			
			const response_2 = await fetch("/scripts/glsl/main.frag");
			
			const text_2 = await response_2.text();
				
			this.glsl_files["main"].content = text_2;
			
			
			
			let texts = {};
			
			await Promise.all(this.glsl_filenames.map(filename => new Promise(async (resolve, reject) =>
			{
				const response = await fetch(`/scripts/glsl/${filename}.frag`);
				
				texts[filename] = await response.text();
				
				resolve();
			})));
			
			this.glsl_filenames.forEach(filename => this.split_glsl_file(filename, texts[filename]));
			
			
			
			//Figure out the depth of everything.
			
			let filenames = Object.keys(this.glsl_files);
			
			filenames.forEach(filename => this.glsl_files[filename].parents = []);
			
			filenames.forEach(filename =>
			{
				const dependencies = this.glsl_files[filename].dependencies;
				
				dependencies.forEach(dependency => this.glsl_files[dependency].parents.push(filename));
				
				if (dependencies.length === 0 && filename !== "main")
				{
					this.glsl_files["main"].parents.push(filename);
				}
			});
			
			
			
			let active_nodes = ["main"];
			let depth = 0;
			
			while (active_nodes.length !== 0)
			{
				let next_active_nodes = [];
				
				Site.glsl_files_by_depth.push([]);
				
				active_nodes.forEach(filename =>
				{
					if (typeof this.glsl_files[filename].depth === "undefined")
					{
						this.glsl_files[filename].depth = depth;
					}
					
					else
					{
						this.glsl_files[filename].depth = Math.max(this.glsl_files[filename].depth, depth);
					}
					
					const parents = this.glsl_files[filename].parents;
					
					parents.forEach(parent =>
					{
						if (!next_active_nodes.includes(parent))
						{
							next_active_nodes.push(parent);
						}	
					});
				});
				
				depth++;
				active_nodes = next_active_nodes;
			}
			
			
			
			filenames.forEach(filename => Site.glsl_files_by_depth[this.glsl_files[filename].depth].push(filename));
			
			
			
			Site.scripts_loaded["glsl"] = 2;
			
			resolve();
		});
	}
	
	
	
	else if (Site.scripts_loaded["glsl"] === 1)
	{
		return new Promise((resolve, reject) =>
		{
			let refresh_id = setInterval(() =>
			{
				if (Site.scripts_loaded["glsl"] === 2)
				{
					clearInterval(refresh_id);
					
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
Site.get_glsl_bundle = function(code_string)
{
	//First, we need to identify the keywords in the provided string.
	const keywords = code_string.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
	
	let bundle = "";
	
	const filenames = Object.keys(this.glsl_files);
	
	let files_to_include = {};
	
	filenames.forEach(filename => files_to_include[filename] = false);
	
	//main.frag is always required.
	files_to_include["main"] = true;
	
	
	
	let debug_message = "";
	
	function add_to_bundle(filename, depth)
	{
		if (files_to_include[filename])
		{
			return;
		}
		
		files_to_include[filename] = true;
		
		if (DEBUG && depth !== 0)
		{
			debug_message += "\n                     " + "   ".repeat(depth) + `↳ ${filename}`;
		}
		
		Site.glsl_files[filename].dependencies.forEach(dependency => add_to_bundle(dependency, depth + 1));
	}
	
	
	
	filenames.forEach(filename =>
	{
		if (files_to_include[filename])
		{
			return;
		}
		
		keywords.forEach(keyword =>
		{
			if (Site.glsl_files[filename].keywords.indexOf(keyword) !== -1)
			{
				debug_message = `[GLSL bundling] Adding ${filename}`;
				
				add_to_bundle(filename, 0);
				
				if (DEBUG)
				{
					console.log(debug_message);
				}
			}
		});
	});
	
	
	
	//constants.frag and main.glsl are always included.
	bundle = Site.glsl_files["constants"].content + Site.glsl_files["main"].content;
	
	for (let i = 1; i < Site.glsl_files_by_depth.length; i++)
	{
		Site.glsl_files_by_depth[i].forEach(filename =>
		{
			if (files_to_include[filename])
			{
				bundle += Site.glsl_files[filename].content;
			}
		});
	}
	
	
	
	return bundle;
}